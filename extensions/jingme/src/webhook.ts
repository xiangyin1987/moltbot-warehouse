/**
 * JingMe Webhook Server
 *
 * Standalone HTTP server for receiving JingMe webhook callbacks.
 * Validates requests and routes messages to Moltbot handler.
 */

import * as http from 'node:http';
import * as crypto from 'node:crypto';

import { getJingmeRuntime } from './runtime.js';
import type { ResolvedJingmeAccount, JingmeMessageEvent } from './types.js';

const RESTART_DELAY_MS = 3000;
const MAX_RESTART_ATTEMPTS = 5;

interface WebhookServer {
  server: http.Server | null;
  port: number;
  stop: () => void;
}

/**
 * Verify webhook request signature
 * JingMe uses token-based verification
 */
function verifySignature(
  token: string,
  timestamp: number,
  body: string,
  signature: string,
): boolean {
  // Create the string to sign: token + timestamp + body
  const signContent = token + timestamp + body;
  // Calculate SHA256 hash
  const calculated = crypto
    .createHash('sha256')
    .update(signContent)
    .digest('hex');

  const isValid = calculated === signature;
  return isValid;
}

/**
 * Parse request body as JSON
 */
async function parseBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8');
        resolve(JSON.parse(body));
      } catch (err) {
        console.error(`[jingme] Failed to parse body: ${err}`);
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

/**
 * Route incoming message to Moltbot handler
 */
async function routeMessage(
  event: JingmeMessageEvent,
  account: ResolvedJingmeAccount,
): Promise<void> {
  const api = getJingmeRuntime();

  // Validate message content
  const text = event.body.content?.trim() || '';
  if (!text) {
    api.logger.debug('[jingme] Skipping empty message');
    return;
  }

  const messageId = event.body.cardMsgId || `${event.datetime}`;
  const sessionType = event.body.sessionType === 1 ? 'direct' : 'group';
  const sessionId = event.body.sessionId;
  const senderId = event.from.pin;

  api.logger.info(
    `[jingme] Received message from ${senderId} in ${sessionType} ${sessionId}`,
  );

  try {
    await api.inbound.handleMessage({
      channel: 'jingme',
      accountId: account.accountId,
      messageId,
      chatId: sessionId,
      chatType: sessionType,
      senderId,
      text,
      timestamp: Math.floor(event.datetime / 1000), // Convert to seconds
      raw: event,
    });
  } catch (error) {
    console.error(`[jingme] Failed to route message: ${error}`, error);
    throw error;
  }
}

/**
 * Send JSON response with proper status code and headers
 */
function sendResponse(
  res: http.ServerResponse,
  statusCode: number,
  data: { code: number; msg: string; data?: unknown },
): void {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

/**
 * Create webhook request handler
 *
 * Handles webhook requests with the following logic:
 * 1. Validate HTTP method (POST only)
 * 2. Extract and validate signature and timestamp headers
 * 3. Parse and validate request body
 * 4. Verify webhook signature (if verification token is configured)
 * 5. Route message to Moltbot handler
 * 6. Return appropriate response
 */
function createRequestHandler(account: ResolvedJingmeAccount) {
  return async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const api = getJingmeRuntime();

    // Step 1: Validate HTTP method - Only handle POST requests
    if (req.method !== 'POST') {
      api.logger.warn(`[jingme] Invalid HTTP method: ${req.method}`);
      sendResponse(res, 405, { code: 0, msg: 'Method not allowed' });
      return;
    }

    try {
      // Step 2: Extract signature and timestamp headers
      const signature = req.headers['x-jingme-signature'] as string;
      const timestamp = parseInt(
        req.headers['x-jingme-timestamp'] as string,
        10,
      );

      if (!signature || !timestamp || Number.isNaN(timestamp)) {
        api.logger.warn(
          '[jingme] Missing or invalid signature/timestamp headers',
        );
        sendResponse(res, 400, {
          code: 0,
          msg: 'Missing or invalid signature/timestamp',
        });
        return;
      }

      api.logger.debug(
        `[jingme] Webhook request received - Signature: ${signature.substring(0, 8)}..., Timestamp: ${timestamp}`,
      );

      // Step 3: Parse request body
      let body: unknown;
      try {
        body = await parseBody(req);
      } catch (parseError) {
        api.logger.error(
          `[jingme] Failed to parse request body: ${parseError}`,
        );
        sendResponse(res, 400, {
          code: 0,
          msg: 'Invalid request body format',
        });
        return;
      }

      // Step 4: Validate body is an object
      if (typeof body !== 'object' || body === null) {
        api.logger.warn('[jingme] Invalid request body: not an object');
        sendResponse(res, 400, {
          code: 0,
          msg: 'Invalid request body',
        });
        return;
      }

      const bodyStr = JSON.stringify(body);

      // Step 5: Verify webhook signature if token is configured
      if (account.verificationToken) {
        const isSignatureValid = verifySignature(
          account.verificationToken,
          timestamp,
          bodyStr,
          signature,
        );

        if (!isSignatureValid) {
          api.logger.warn('[jingme] Webhook signature verification failed');
          sendResponse(res, 403, {
            code: 0,
            msg: 'Signature verification failed',
          });
          return;
        }

        api.logger.debug('[jingme] Webhook signature verified successfully');
      } else {
        api.logger.debug(
          '[jingme] Verification token not configured, skipping signature verification',
        );
      }

      // Step 6: Route the message to Moltbot handler
      try {
        await routeMessage(body as JingmeMessageEvent, account);
        api.logger.info('[jingme] Message routed successfully');
      } catch (routeError) {
        const routeErrorMsg =
          routeError instanceof Error ? routeError.message : String(routeError);
        api.logger.error(`[jingme] Failed to route message: ${routeErrorMsg}`);
        // Return error response with 500 status code
        sendResponse(res, 500, {
          code: 0,
          msg: 'Failed to process message',
        });
        return;
      }

      // Step 7: Send success response
      api.logger.info('[jingme] Webhook request processed successfully');
      sendResponse(res, 200, {
        code: 1,
        msg: 'Success',
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      api.logger.error(`[jingme] Unexpected webhook error: ${errorMsg}`);

      // Return error response with 500 status code
      sendResponse(res, 500, {
        code: 0,
        msg: 'Internal server error',
      });
    }
  };
}

/**
 * Start webhook server for a single account
 */
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

      // Attempt automatic restart
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

  // Create and start the server
  webhookServer.server = createServer();

  webhookServer.server.listen(port, () => {
    api.logger.info(`[jingme] Webhook server listening on port ${port}`);
  });

  // Handle abort signal for graceful shutdown
  if (abortSignal) {
    abortSignal.addEventListener('abort', () => {
      api.logger.info('[jingme] Stopping webhook server');
      webhookServer.stop();
    });
  }

  return webhookServer;
}
