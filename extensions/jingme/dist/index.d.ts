/**
 * Moltbot JingMe Plugin
 *
 * Provides JingMe (京me) - JD.com internal communication platform
 * messaging integration. Supports REST API-based message sending
 * and webhook-based event reception.
 */
import type { MoltbotPluginApi } from 'clawdbot/plugin-sdk';
export { jingmePlugin } from './src/channel.js';
export { createJingmeClient } from './src/client.js';
export { startWebhookServer } from './src/webhook.js';
export { monitorJingmeProvider, stopMonitor } from './src/monitor.js';
export type { JingmeEnvironment, JingmeAccountConfig, ResolvedJingmeAccount, JingmeChannelConfig, JingmeMessageEvent, ParsedMessage, SendResult, } from './src/types.js';
declare const plugin: {
    id: string;
    name: string;
    description: string;
    configSchema: import("clawdbot/plugin-sdk").PluginConfigSchema;
    register(api: MoltbotPluginApi): void;
};
export default plugin;
//# sourceMappingURL=index.d.ts.map