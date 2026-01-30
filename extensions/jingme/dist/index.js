/**
 * Moltbot JingMe Plugin
 *
 * Provides JingMe (京me) - JD.com internal communication platform
 * messaging integration. Supports REST API-based message sending
 * and webhook-based event reception.
 */
import { emptyPluginConfigSchema } from 'clawdbot/plugin-sdk';
import { jingmePlugin } from './src/channel.js';
import { setJingmeRuntime } from './src/runtime.js';
// Re-export for programmatic usage
export { jingmePlugin } from './src/channel.js';
export { createJingmeClient } from './src/client.js';
export { startWebhookServer } from './src/webhook.js';
export { monitorJingmeProvider, stopMonitor } from './src/monitor.js';
const plugin = {
    id: '@jd/moltbot-jingme',
    name: 'JingMe',
    description: 'JingMe (京ME) channel plugin for Moltbot',
    configSchema: emptyPluginConfigSchema(),
    register(api) {
        setJingmeRuntime(api);
        api.registerChannel({ plugin: jingmePlugin });
    },
};
export default plugin;
//# sourceMappingURL=index.js.map