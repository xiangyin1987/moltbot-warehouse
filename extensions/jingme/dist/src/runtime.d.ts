/**
 * JingMe Runtime Context
 *
 * Stores and provides access to the Moltbot plugin API
 * throughout the plugin's lifetime.
 */
import type { MoltbotPluginApi } from 'clawdbot/plugin-sdk';
/**
 * Set the runtime API context
 */
export declare function setJingmeRuntime(api: MoltbotPluginApi): void;
/**
 * Get the current runtime API context
 */
export declare function getJingmeRuntime(): MoltbotPluginApi;
//# sourceMappingURL=runtime.d.ts.map