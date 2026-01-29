/**
 * JingMe Channel Plugin
 *
 * Implements the ChannelPlugin interface for JingMe integration.
 * Provides account configuration, message sending, and gateway management.
 */
import { createJingmeClient } from './client.js';
import { getJingmeRuntime } from './runtime.js';
import { monitorJingmeProvider } from './monitor.js';
// Default values for account configuration
const DEFAULTS = {
    environment: 'prod',
    webhookPort: 3001,
    encryptKey: 'a98ad11ceb83bd34',
    dmPolicy: 'open',
    groupPolicy: 'open',
    historyLimit: 10,
};
/**
 * Extract JingMe channel config from Moltbot config
 */
function getChannelConfig(cfg) {
    return cfg.channels?.jingme ?? {};
}
/**
 * Get account config from channel config, with empty object fallback
 */
function getAccountConfig(channelConfig, accountId) {
    return channelConfig.accounts?.[accountId] ?? {};
}
/**
 * Check if default account has env var credentials configured
 */
function hasEnvCredentials() {
    return Boolean(process.env.JINGME_APP_KEY &&
        process.env.JINGME_APP_SECRET &&
        process.env.JINGME_ROBOT_ID);
}
/**
 * Resolve account configuration with defaults and env fallbacks.
 * For "default" account, environment variables take precedence.
 */
function resolveAccount(cfg, accountId) {
    const channelConfig = getChannelConfig(cfg);
    const accountConfig = getAccountConfig(channelConfig, accountId);
    // Resolve credentials - env vars as fallback for default account
    const isDefault = accountId === 'default';
    const appKey = accountConfig.appKey ??
        (isDefault ? process.env.JINGME_APP_KEY : undefined);
    const appSecret = accountConfig.appSecret ??
        (isDefault ? process.env.JINGME_APP_SECRET : undefined);
    const robotId = accountConfig.robotId ??
        (isDefault ? process.env.JINGME_ROBOT_ID : undefined);
    const openTeamId = accountConfig.openTeamId ??
        (isDefault ? process.env.JINGME_OPEN_TEAM_ID : undefined);
    const verificationToken = accountConfig.verificationToken ??
        (isDefault ? process.env.JINGME_VERIFICATION_TOKEN : undefined);
    const encryptKey = accountConfig.encryptKey ??
        (isDefault ? process.env.JINGME_ENCRYPT_KEY : undefined) ??
        DEFAULTS.encryptKey;
    const configured = Boolean(appKey?.trim() && appSecret?.trim() && robotId?.trim() && openTeamId?.trim());
    return {
        id: accountId,
        accountId,
        enabled: accountConfig.enabled ?? true,
        configured,
        appKey: appKey ?? '',
        appSecret: appSecret ?? '',
        robotId: robotId ?? '',
        openTeamId: openTeamId ?? '',
        environment: accountConfig.environment ?? DEFAULTS.environment,
        webhookPort: accountConfig.webhookPort ?? DEFAULTS.webhookPort,
        verificationToken,
        encryptKey,
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
export async function sendTextMessage(account, sessionId, sessionType, text) {
    try {
        const api = getJingmeRuntime();
        const client = createJingmeClient(account);
        const MAX_SINGLE = 2000;
        const CHUNK_SIZE = 1800;
        async function sendChunk(textChunk) {
            const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            let requestBody = {
                appId: account.appKey,
                requestId: requestId,
                dateTime: Date.now(),
                params: {
                    robotId: account.robotId,
                    body: {
                        type: 'text',
                        content: textChunk,
                    },
                },
            };
            if (sessionType === 1) {
                requestBody.erp = sessionId;
                requestBody.tenantId = 'CN.JD.GROUP';
            }
            else {
                requestBody.groupId = sessionId;
            }
            const response = await client.post('/open-api/suite/v1/timline/sendRobotMsg', requestBody);
            if (response.data.code === 0) {
                api.logger.info(`[jingme] Message sent successfully: packetId=${response.data.data?.packetId}`);
                return {
                    ok: true,
                    messageId: response.data.data?.packetId || requestId,
                };
            }
            const error = response.data.msg || 'Unknown error';
            api.logger.warn(`[jingme] Failed to send message: ${error}`);
            return { ok: false, error };
        }
        if (text.length > MAX_SINGLE) {
            const chunks = [];
            for (let i = 0; i < text.length; i += CHUNK_SIZE) {
                chunks.push(text.slice(i, i + CHUNK_SIZE));
            }
            let lastMessageId;
            for (let i = 0; i < chunks.length; i++) {
                const res = await sendChunk(chunks[i]);
                if (!res.ok) {
                    return { ok: false, error: res.error };
                }
                lastMessageId = res.messageId;
            }
            return { ok: true, messageId: lastMessageId };
        }
        return await sendChunk(text);
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[jingme] Exception sending message: ${errorMsg}`, error);
        return { ok: false, error: errorMsg };
    }
}
/**
 * Get robot's groups
 */
async function listGroups(account) {
    try {
        const client = createJingmeClient(account);
        const response = await client.post('/open-api/suite/v1/timline/getRobotGroup', {
            robotId: account.robotId,
        });
        if (response.data.code === 1 && Array.isArray(response.data.data)) {
            const groups = response.data.data.map((group) => ({
                id: group.gid || '',
                name: group.groupName || 'Unknown',
            }));
            return groups;
        }
        console.warn(`[jingme] Failed to list groups: code=${response.data.code}`);
        return [];
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[jingme] Exception listing groups: ${errorMsg}`, error);
        return [];
    }
}
/**
 * JingMe channel plugin implementation
 */
export const jingmePlugin = {
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
        listAccountIds(cfg) {
            const channelConfig = getChannelConfig(cfg);
            const accountIds = Object.keys(channelConfig.accounts ?? {});
            // Include default account if env vars are configured
            if (!accountIds.includes('default') && hasEnvCredentials()) {
                accountIds.push('default');
            }
            return accountIds;
        },
        resolveAccount(cfg, accountId) {
            return resolveAccount(cfg, accountId ?? 'default');
        },
        isConfigured(account) {
            const isConfigured = account.configured;
            return isConfigured;
        },
        setAccountEnabled(cfg, accountId, enabled) {
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
        deliveryMode: 'direct',
        textChunkLimit: 4000,
        chunkerMode: 'markdown',
        async sendText({ account, recipientId, text }) {
            console.log(`[JingMe Debug] sendText triggered! To: ${recipientId}, Content: ${text.substring(0, 20)}...`);
            // Determine session type: "oc_" prefix = group, otherwise direct
            const sessionType = recipientId.startsWith('oc_') ? 2 : 1;
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
            api.logger.info(`[jingme] Starting provider: account=${account.accountId}, environment=${account.environment}, webhookPort=${account.webhookPort}`);
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
        mode(cfg) {
            const channelConfig = getChannelConfig(cfg);
            return channelConfig.accounts?.default?.dmPolicy ?? DEFAULTS.dmPolicy;
        },
        allowlist(cfg) {
            const channelConfig = getChannelConfig(cfg);
            return channelConfig.accounts?.default?.dmAllowlist ?? [];
        },
    },
    groupPolicy: {
        mode(cfg) {
            const channelConfig = getChannelConfig(cfg);
            return (channelConfig.accounts?.default?.groupPolicy ?? DEFAULTS.groupPolicy);
        },
        allowlist(cfg) {
            const channelConfig = getChannelConfig(cfg);
            return channelConfig.accounts?.default?.groupAllowlist ?? [];
        },
    },
    setup: {
        validate(account) {
            const errors = [];
            if (!account.appKey?.trim()) {
                errors.push('App Key is required. Set via channels.jingme.accounts.<id>.appKey or JINGME_APP_KEY env var.');
            }
            if (!account.appSecret?.trim()) {
                errors.push('App Secret is required. Set via channels.jingme.accounts.<id>.appSecret or JINGME_APP_SECRET env var.');
            }
            if (!account.robotId?.trim()) {
                errors.push('Robot ID is required. Set via channels.jingme.accounts.<id>.robotId or JINGME_ROBOT_ID env var.');
            }
            if (errors.length > 0) {
                console.warn(`[jingme] Validation errors for account ${account.accountId}:`, errors);
            }
            return errors;
        },
    },
};
//# sourceMappingURL=channel.js.map