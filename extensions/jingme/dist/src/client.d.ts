/**
 * JingMe API Client Factory
 *
 * Creates and caches API clients for JingMe.
 * Handles authentication and token management.
 */
import type { ResolvedJingmeAccount } from './types.js';
/**
 * Create or retrieve a cached HTTP client for JingMe API
 */
export declare function createJingmeClient(account: ResolvedJingmeAccount): any;
/**
 * Clear cached token for an account (e.g., after token expiration error)
 */
export declare function clearTokenCache(account: ResolvedJingmeAccount): void;
/**
 * Clear all cached clients and tokens
 */
export declare function clearAllCaches(): void;
//# sourceMappingURL=client.d.ts.map