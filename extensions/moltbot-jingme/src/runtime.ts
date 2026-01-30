/**
 * JingMe Runtime Context
 *
 * Stores and provides access to the Moltbot plugin API
 * throughout the plugin's lifetime.
 */

import type { MoltbotPluginApi } from 'clawdbot/plugin-sdk';

let runtimeApi: MoltbotPluginApi | null = null;

/**
 * Set the runtime API context
 */
export function setJingmeRuntime(api: MoltbotPluginApi): void {
  runtimeApi = api;
}

/**
 * Get the current runtime API context
 */
export function getJingmeRuntime(): MoltbotPluginApi {
  if (!runtimeApi) {
    throw new Error('JingMe runtime not initialized');
  }
  return runtimeApi;
}
