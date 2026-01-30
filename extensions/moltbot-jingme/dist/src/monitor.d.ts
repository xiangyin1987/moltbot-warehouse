/**
 * JingMe Message Monitor
 *
 * Manages message reception via webhook server.
 * Routes messages to the Moltbot message handler.
 */
import type { ResolvedJingmeAccount } from './types.js';
/**
 * Start monitoring for incoming messages via webhook
 */
export declare function monitorJingmeProvider(account: ResolvedJingmeAccount, abortSignal?: AbortSignal): void;
/**
 * Stop monitoring
 */
export declare function stopMonitor(): void;
//# sourceMappingURL=monitor.d.ts.map