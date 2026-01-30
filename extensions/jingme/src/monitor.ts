/**
 * JingMe Message Monitor
 *
 * Manages message reception via webhook server.
 * Routes messages to the Moltbot message handler.
 */

import { startWebhookServer } from './webhook.js';
import { getJingmeRuntime } from './runtime.js';
import type { ResolvedJingmeAccount } from './types.js';

// Active webhook server for cleanup
let activeWebhookServer: { stop: () => void } | null = null;
let abortController: AbortController | null = null;

/**
 * Start monitoring for incoming messages via webhook
 */
export function monitorJingmeProvider(
  account: ResolvedJingmeAccount,
  abortSignal?: AbortSignal,
): void {
  const api = getJingmeRuntime();

  api.logger.info(
    `[jingme] Starting webhook monitor for account: ${account.accountId}`,
  );

  // Create abort controller if not provided
  if (!abortSignal) {
    abortController = new AbortController();
    abortSignal = abortController.signal;
  }

  // Start webhook server
  const server = startWebhookServer(account, abortSignal);
  activeWebhookServer = server;
}

/**
 * Stop monitoring
 */
export function stopMonitor(): void {
  const api = getJingmeRuntime();

  api.logger.info('[jingme] Stopping webhook monitor');

  if (activeWebhookServer) {
    activeWebhookServer.stop();
    activeWebhookServer = null;
  }

  if (abortController) {
    abortController.abort();
    abortController = null;
  }
}
