import * as http from 'node:http';
import * as crypto from 'node:crypto';
import { getJingmeRuntime } from './runtime.js';
import { sendTextMessage } from './channel.js';
import type { ResolvedJingmeAccount, JingmeMessageEvent } from './types.js';

const RESTART_DELAY_MS = 3000;
const MAX_RESTART_ATTEMPTS = 5;

interface WebhookServer {
  server: http.Server | null;
  port: number;
  stop: () => void;
}

/**
 * Decrypt AES-256-CBC encrypted event data from JingMe.
 * The encrypted data format: Base64(IV + Ciphertext)
 * - First 16 bytes: IV (Initialization Vector)
 * - Remaining bytes: Ciphertext
 */
function decryptEvent(encrypted: string, encryptKey: string): string {
  const key = crypto.createHash('sha256').update(encryptKey).digest();
  const encryptedBuffer = Buffer.from(encrypted, 'base64');
  const iv = encryptedBuffer.subarray(0, 16);
  const ciphertext = encryptedBuffer.subarray(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(ciphertext, undefined, 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function parseBody(req: http.IncomingMessage): Promise<unknown> {
  const buffers = [];
  for await (const chunk of req) {
    buffers.push(chunk);
  }
  const body = Buffer.concat(buffers).toString('utf8');
  try {
    return JSON.parse(body);
  } catch (err) {
    console.error(`[jingme] Failed to parse body: ${err}`);
    throw err;
  }
}

async function routeMessage(
  message: JingmeMessageEvent,
  account: ResolvedJingmeAccount,
): Promise<{
  msgId: string;
  sender?: string;
  timestamp?: number;
}> {
  const api = getJingmeRuntime();
  const core = api.runtime;
  const cfg = api.config;

  const text = (
    message.event.body.content ??
    message.event.body.param?.pushContent ??
    ''
  ).trim();
  if (!text) {
    api.logger.debug('[jingme] Skipping empty message');
    return {
      msgId: message.event.msgId,
      sender: message.event.sender.pin,
      timestamp: Math.floor(message.timeStamp / 1000),
    };
  }

  const messageId = message.event.msgId;
  const chatType = message.event.chatType === 1 ? 'direct' : 'group';
  const sessionId = message.event.body.requestData?.sessionId;
  const senderId = message.event.sender.pin;

  api.logger.info(
    `[jingme] Received message from ${senderId} in ${chatType} ${sessionId}`,
  );

  try {
    // Build JingMe-specific identifiers
    const jingmeFrom = `jingme:${account.accountId}:${senderId}`;
    const jingmeTo = `jingme:${account.accountId}:${sessionId}`;

    // Resolve routing to find the agent
    const route = await core.channel.routing.resolveAgentRoute({
      cfg,
      channel: 'jingme',
      accountId: account.accountId,
      chatType,
      chatId: sessionId,
      senderId,
    });

    if (!route) {
      api.logger.warn('[jingme] No route found for message');
      return {
        msgId: messageId,
        sender: senderId,
        timestamp: Math.floor(message.timeStamp / 1000),
      };
    }

    // Finalize inbound context
    const ctxPayload = core.channel.reply.finalizeInboundContext({
      Body: text,
      RawBody: text,
      CommandBody: text,
      From: jingmeFrom,
      To: jingmeTo,
      SessionKey: route.sessionKey,
      AccountId: route.accountId,
      ChatType: chatType,
      GroupSubject: chatType === 'group' ? sessionId : undefined,
      SenderName: senderId,
      SenderId: senderId,
      Provider: 'jingme',
      Surface: 'jingme',
      MessageSid: messageId,
      Timestamp: Date.now(),
      WasMentioned: false,
      CommandAuthorized: true,
      OriginatingChannel: 'jingme',
      OriginatingTo: jingmeTo,
    });

    // Create a dispatcher that sends replies back to JingMe
    const dispatcher = {
      async sendBlockReply(block: Record<string, unknown>) {
        // Handle text replies
        const replyText = (block.markdown || block.text || '') as string;
        if (!replyText.trim()) return;

        const sessionType: 1 | 2 = chatType === 'direct' ? 1 : 2;

        await sendTextMessage(account, senderId, sessionType, replyText);
      },
      async waitForIdle() {
        // No buffering, messages sent immediately
      },
      getQueuedCounts() {
        return { blocks: 0, chars: 0 };
      },
    };

    // Dispatch the message to the agent
    await core.channel.reply.dispatchReplyFromConfig({
      ctx: ctxPayload,
      cfg,
      dispatcher,
      replyOptions: {
        agentId: route.agentId,
        channel: 'jingme',
        accountId: account.accountId,
      },
    });

    return {
      msgId: messageId,
      sender: senderId,
      timestamp: Math.floor(message.timeStamp / 1000),
    };
  } catch (error) {
    console.error(`[jingme] Failed to route message: ${error}`, error);
    throw error;
  }
}

function sendResponse(
  res: http.ServerResponse,
  statusCode: number,
  data: { msg: string; code: number; data?: unknown },
): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function createRequestHandler(account: ResolvedJingmeAccount) {
  const resultInfo = { msg: '消息处理成功', code: 1, data: null };
  return async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const api = getJingmeRuntime();
    if (req.method !== 'POST') {
      api.logger.warn(`[jingme] Invalid HTTP method: ${req.method}`);
      sendResponse(res, 405, { ...resultInfo, msg: 'Method not allowed' });
      return;
    }

    try {
      let body: unknown;
      try {
        body = await parseBody(req);
        if (Object.keys(body).length === 0) {
          return sendResponse(res, 200, resultInfo);
        }
        const bodyObj = body as Record<string, unknown>;
        if (
          bodyObj.encrypt &&
          typeof bodyObj.encrypt === 'string' &&
          account.encryptKey
        ) {
          try {
            const decrypted = decryptEvent(bodyObj.encrypt, account.encryptKey);
            body = JSON.parse(decrypted);
          } catch (decryptError) {
            api.logger.error(
              `[jingme] Failed to decrypt message: ${decryptError}`,
            );
            sendResponse(res, 400, { ...resultInfo, msg: 'Failed to decrypt' });
            return;
          }
        }
      } catch (parseError) {
        api.logger.error(
          `[jingme] Failed to parse request body: ${parseError}`,
        );
        sendResponse(res, 400, { ...resultInfo, msg: 'Invalid request body' });
        return;
      }

      if (typeof body !== 'object' || body === null) {
        api.logger.warn('[jingme] Invalid request body: not an object');
        sendResponse(res, 400, { ...resultInfo, msg: 'Invalid request body' });
        return;
      }

      const bodyObj = body as JingmeMessageEvent;
      if (bodyObj.challenge) {
        api.logger.info(
          `[jingme] Verification request detected, challenge: ${bodyObj.challenge}`,
        );
        sendResponse(res, 200, { ...resultInfo, msg: '验证成功' });
        return;
      }

      try {
        if (bodyObj.eventType === 'chat_message') {
          routeMessage(bodyObj, account);
          return sendResponse(res, 200, resultInfo);
        } else {
          api.logger.info(
            `[jingme] 暂时不支持处理该类型的消息${bodyObj.eventType}`,
          );
          return sendResponse(res, 200, resultInfo);
        }
      } catch (routeError) {
        const routeErrorMsg =
          routeError instanceof Error ? routeError.message : String(routeError);
        api.logger.error(`[jingme] Failed to route message: ${routeErrorMsg}`);
        sendResponse(res, 500, { ...resultInfo, msg: '消息处理失败' });
        return;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      api.logger.error(`[jingme] Unexpected webhook error: ${errorMsg}`);
      sendResponse(res, 500, { ...resultInfo, msg: 'Internal server error' });
    }
  };
}

export function startWebhookServer(
  account: ResolvedJingmeAccount,
  abortSignal?: AbortSignal,
): WebhookServer {
  const api = getJingmeRuntime();
  const port = account.webhookPort;

  let restartCount = 0;
  let restartTimeout: NodeJS.Timeout | null = null;

  const createServer = (): http.Server => {
    const handler = createRequestHandler(account);
    const server = http.createServer(handler);

    server.on('error', (error) => {
      api.logger.error(`[jingme] Webhook server error: ${error}`);
      console.error(`[jingme] Webhook server error: ${error}`, error);

      if (restartCount < MAX_RESTART_ATTEMPTS) {
        restartCount++;
        api.logger.info(
          `[jingme] Restarting webhook server (attempt ${restartCount}/${MAX_RESTART_ATTEMPTS})`,
        );
        console.warn(
          `[jingme] Restarting webhook server (attempt ${restartCount}/${MAX_RESTART_ATTEMPTS})`,
        );
        restartTimeout = setTimeout(() => {
          webhookServer.server = createServer();
          webhookServer.server.listen(port, () => {
            api.logger.info(
              `[jingme] Webhook server restarted on port ${port}`,
            );
          });
        }, RESTART_DELAY_MS);
      } else {
        console.error(
          `[jingme] Max restart attempts (${MAX_RESTART_ATTEMPTS}) reached, giving up`,
        );
      }
    });

    return server;
  };

  const webhookServer: WebhookServer = {
    server: null,
    port,
    stop: () => {
      if (webhookServer.server) {
        webhookServer.server.close();
      }
      if (restartTimeout) {
        clearTimeout(restartTimeout);
      }
    },
  };

  webhookServer.server = createServer();

  webhookServer.server.listen(port, () => {
    api.logger.info(`[jingme] Webhook server listening on port ${port}`);
  });

  if (abortSignal) {
    abortSignal.addEventListener('abort', () => {
      api.logger.info('[jingme] Stopping webhook server');
      webhookServer.stop();
    });
  }

  return webhookServer;
}
