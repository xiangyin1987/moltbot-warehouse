/**
 * JingMe Channel Plugin
 *
 * Implements the ChannelPlugin interface for JingMe integration.
 * Provides account configuration, message sending, and gateway management.
 */

import type { ChannelPlugin, MoltbotConfig } from 'clawdbot/plugin-sdk';

import { createJingmeClient } from './client.js';
import { getJingmeRuntime } from './runtime.js';
import { monitorJingmeProvider } from './monitor.js';
import type {
  ResolvedJingmeAccount,
  JingmeAccountConfig,
  JingmeChannelConfig,
  SendResult,
} from './types.js';

// Default values for account configuration
const DEFAULTS = {
  environment: 'prod' as const,
  webhookPort: 3001,
  dmPolicy: 'open' as const,
  groupPolicy: 'open' as const,
  historyLimit: 10,
} as const;

/**
 * Extract JingMe channel config from Moltbot config
 */
function getChannelConfig(cfg: MoltbotConfig): JingmeChannelConfig {
  return (cfg.channels?.jingme as JingmeChannelConfig) ?? {};
}

/**
 * Get account config from channel config, with empty object fallback
 */
function getAccountConfig(
  channelConfig: JingmeChannelConfig,
  accountId: string,
): JingmeAccountConfig {
  return channelConfig.accounts?.[accountId] ?? {};
}

/**
 * Check if default account has env var credentials configured
 */
function hasEnvCredentials(): boolean {
  return Boolean(
    process.env.JINGME_APP_KEY &&
    process.env.JINGME_APP_SECRET &&
    process.env.JINGME_ROBOT_ID,
  );
}

/**
 * Resolve account configuration with defaults and env fallbacks.
 * For "default" account, environment variables take precedence.
 */
function resolveAccount(
  cfg: MoltbotConfig,
  accountId: string,
): ResolvedJingmeAccount | null {
  const channelConfig = getChannelConfig(cfg);
  const accountConfig = getAccountConfig(channelConfig, accountId);

  // Resolve credentials - env vars as fallback for default account
  const isDefault = accountId === 'default';
  const appKey =
    accountConfig.appKey ??
    (isDefault ? process.env.JINGME_APP_KEY : undefined);
  const appSecret =
    accountConfig.appSecret ??
    (isDefault ? process.env.JINGME_APP_SECRET : undefined);
  const robotId =
    accountConfig.robotId ??
    (isDefault ? process.env.JINGME_ROBOT_ID : undefined);
  const verificationToken =
    accountConfig.verificationToken ??
    (isDefault ? process.env.JINGME_VERIFICATION_TOKEN : undefined);

  const configured = Boolean(
    appKey?.trim() && appSecret?.trim() && robotId?.trim(),
  );

  return {
    id: accountId,
    accountId,
    enabled: accountConfig.enabled ?? true,
    configured,
    appKey: appKey ?? '',
    appSecret: appSecret ?? '',
    robotId: robotId ?? '',
    environment: accountConfig.environment ?? DEFAULTS.environment,
    webhookPort: accountConfig.webhookPort ?? DEFAULTS.webhookPort,
    verificationToken,
    dmPolicy: accountConfig.dmPolicy ?? DEFAULTS.dmPolicy,
    dmAllowlist: accountConfig.dmAllowlist ?? [],
    groupPolicy: accountConfig.groupPolicy ?? DEFAULTS.groupPolicy,
    groupAllowlist: accountConfig.groupAllowlist ?? [],
    historyLimit: accountConfig.historyLimit ?? DEFAULTS.historyLimit,
  };
}

/**
 * Send a text message via JingMe API
 * Supports both direct messages (sessionType=1) and group messages (sessionType=2)
 */
async function sendTextMessage(
  account: ResolvedJingmeAccount,
  sessionId: string,
  sessionType: 1 | 2,
  text: string,
): Promise<SendResult> {
  try {
    const client = createJingmeClient(account);

    const response = await client.post(
      '/open-api/suite/v1/timline/sendRobotMsg',
      {
        robotId: account.robotId,
        sessionId,
        sessionType, // 1: direct message, 2: group message
        msgType: 'text',
        content: text,
      },
    );

    if (response.data.code === 1 && response.data.data?.msgId) {
      return { ok: true, messageId: response.data.data.msgId };
    }

    const error = response.data.msg ?? 'Unknown error';
    console.warn(`[jingme] Failed to send message: ${error}`);
    return {
      ok: false,
      error,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[jingme] Exception sending message: ${errorMsg}`, error);
    return {
      ok: false,
      error: errorMsg,
    };
  }
}

/**
 * Get robot's groups
 */
async function listGroups(
  account: ResolvedJingmeAccount,
): Promise<Array<{ id: string; name: string }>> {
  try {
    const client = createJingmeClient(account);

    const response = await client.post(
      '/open-api/suite/v1/timline/getRobotGroup',
      {
        robotId: account.robotId,
      },
    );

    if (response.data.code === 1 && Array.isArray(response.data.data)) {
      const groups = response.data.data.map((group: any) => ({
        id: group.gid ?? '',
        name: group.groupName ?? 'Unknown',
      }));
      return groups;
    }

    console.warn(`[jingme] Failed to list groups: code=${response.data.code}`);
    return [];
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[jingme] Exception listing groups: ${errorMsg}`, error);
    return [];
  }
}

/**
 * JingMe channel plugin implementation
 */
export const jingmePlugin: ChannelPlugin<ResolvedJingmeAccount> = {
  id: 'jingme',

  meta: {
    label: 'JingMe',
    selectionLabel: 'JingMe (京me)',
    docsPath: '/channels/jingme',
    blurb: 'Chat with your bot on JingMe (京ME)',
    order: 80,
  },

  capabilities: {
    chatTypes: ['direct', 'group'],
    reactions: false,
    threads: false,
    media: false,
    nativeCommands: false,
    streamingBlocked: false,
  },

  config: {
    listAccountIds(cfg: MoltbotConfig): string[] {
      const channelConfig = getChannelConfig(cfg);
      const accountIds = Object.keys(channelConfig.accounts ?? {});

      // Include default account if env vars are configured
      if (!accountIds.includes('default') && hasEnvCredentials()) {
        accountIds.push('default');
      }

      return accountIds;
    },

    resolveAccount(
      cfg: MoltbotConfig,
      accountId?: string,
    ): ResolvedJingmeAccount | null {
      return resolveAccount(cfg, accountId ?? 'default');
    },

    isConfigured(account: ResolvedJingmeAccount): boolean {
      const isConfigured = account.configured;
      return isConfigured;
    },

    setAccountEnabled(
      cfg: MoltbotConfig,
      accountId: string,
      enabled: boolean,
    ): MoltbotConfig {
      const channelConfig = getChannelConfig(cfg);

      return {
        ...cfg,
        channels: {
          ...cfg.channels,
          jingme: {
            ...channelConfig,
            accounts: {
              ...channelConfig.accounts,
              [accountId]: {
                ...channelConfig.accounts?.[accountId],
                enabled,
              },
            },
          },
        },
      };
    },
  },

  outbound: {
    deliveryMode: 'direct' as const,
    textChunkLimit: 4000,
    chunkerMode: 'markdown',

    async sendText({ account, recipientId, text }) {
      console.log(
        `[JingMe Debug] sendText triggered! To: ${recipientId}, Content: ${text.substring(0, 20)}...`,
      );
      // Determine session type: "oc_" prefix = group, otherwise direct
      const sessionType: 1 | 2 = recipientId.startsWith('oc_') ? 2 : 1;

      getJingmeRuntime().logger.debug(`[jingme] sendText: ${account}${text}`);
      return sendTextMessage(account, recipientId, sessionType, text);
    },
  },

  gateway: {
    async startAccount({ account, abortSignal }) {
      const api = getJingmeRuntime();

      api.logger.debug(`[jingme] Starting account: ${account.accountId}`);

      if (!account.configured) {
        api.logger.warn(`[jingme] Account ${account.accountId} not configured`);
        return;
      }

      if (!account.enabled) {
        api.logger.debug(`[jingme] Account ${account.accountId} disabled`);
        return;
      }

      api.logger.info(
        `[jingme] Starting provider: account=${account.accountId}, environment=${account.environment}, webhookPort=${account.webhookPort}`,
      );

      monitorJingmeProvider(account, abortSignal);
      api.logger.debug(`[jingme] Account ${account.accountId} monitor started`);
    },
  },

  directory: {
    async listPeers() {
      // JingMe does not provide a simple user directory API
      return [];
    },

    async listGroups(account) {
      return listGroups(account);
    },

    async resolveSelf() {
      return null;
    },
  },

  dmPolicy: {
    mode(cfg: MoltbotConfig) {
      const channelConfig = getChannelConfig(cfg);
      return channelConfig.accounts?.default?.dmPolicy ?? DEFAULTS.dmPolicy;
    },

    allowlist(cfg: MoltbotConfig) {
      const channelConfig = getChannelConfig(cfg);
      return channelConfig.accounts?.default?.dmAllowlist ?? [];
    },
  },

  groupPolicy: {
    mode(cfg: MoltbotConfig) {
      const channelConfig = getChannelConfig(cfg);
      return (
        channelConfig.accounts?.default?.groupPolicy ?? DEFAULTS.groupPolicy
      );
    },

    allowlist(cfg: MoltbotConfig) {
      const channelConfig = getChannelConfig(cfg);
      return channelConfig.accounts?.default?.groupAllowlist ?? [];
    },
  },

  setup: {
    validate(account: ResolvedJingmeAccount): string[] {
      const errors: string[] = [];

      if (!account.appKey?.trim()) {
        errors.push(
          'App Key is required. Set via channels.jingme.accounts.<id>.appKey or JINGME_APP_KEY env var.',
        );
      }

      if (!account.appSecret?.trim()) {
        errors.push(
          'App Secret is required. Set via channels.jingme.accounts.<id>.appSecret or JINGME_APP_SECRET env var.',
        );
      }

      if (!account.robotId?.trim()) {
        errors.push(
          'Robot ID is required. Set via channels.jingme.accounts.<id>.robotId or JINGME_ROBOT_ID env var.',
        );
      }

      if (errors.length > 0) {
        console.warn(
          `[jingme] Validation errors for account ${account.accountId}:`,
          errors,
        );
      }

      return errors;
    },
  },
};
