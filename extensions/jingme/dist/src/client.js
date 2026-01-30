/**
 * JingMe API Client Factory
 *
 * Creates and caches API clients for JingMe.
 * Handles authentication and token management.
 */
import { request } from 'undici';
// API domain mapping
const API_DOMAINS = {
    prod: 'http://openme.jd.local',
    test: 'http://openme-test.jd.local',
};
// Cache for access tokens: key = appKey:appSecret
const tokenCache = new Map();
// Cache for client instances
const clientCache = new Map();
/**
 * Generate cache key for an account
 */
function cacheKey(account) {
    return `${account.appKey}:${account.appSecret}`;
}
/**
 * Get the API domain for the environment
 */
function getApiDomain(environment) {
    return API_DOMAINS[environment];
}
/**
 * Get or refresh access token for the account
 *
 * First get appAccessToken, then use it to get teamAccessToken
 */
async function getAccessToken(account) {
    const cacheKey_ = cacheKey(account);
    const cached = tokenCache.get(cacheKey_);
    const now = Date.now();
    if (cached && cached.expiresAt > now + 60000) {
        console.debug(`[jingme-client] cached: ${cached.token}`);
        return cached.token;
    }
    const domain = getApiDomain(account.environment);
    const appTokenUrl = `${domain}/open-api/auth/v1/app_access_token`;
    const appTokenBody = JSON.stringify({
        appKey: account.appKey,
        appSecret: account.appSecret,
    });
    const appTokenResponse = await request(appTokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: appTokenBody,
    });
    const appTokenData = (await appTokenResponse.body.json());
    if (appTokenData.code !== 0 || !appTokenData.data?.appAccessToken) {
        throw new Error(`Failed to get appAccessToken: ${appTokenData.msg || 'Unknown error'}`);
    }
    const appAccessToken = appTokenData.data.appAccessToken;
    // Step 2: Get teamAccessToken using appAccessToken
    const teamTokenUrl = `${domain}/open-api/auth/v1/team_access_token`;
    const teamTokenBody = JSON.stringify({
        appAccessToken: appAccessToken,
        openTeamId: account.openTeamId,
    });
    const teamTokenResponse = await request(teamTokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: teamTokenBody,
    });
    const teamTokenData = (await teamTokenResponse.body.json());
    if (teamTokenData.code !== 0 || !teamTokenData.data?.teamAccessToken) {
        throw new Error(`Failed to get teamAccessToken: ${teamTokenData.msg || 'Unknown error'}`);
    }
    const token = teamTokenData.data.teamAccessToken;
    const expiresIn = (teamTokenData.data.expiresIn || 7200) * 1000; // Convert to ms
    // Cache the token
    tokenCache.set(cacheKey_, {
        token,
        expiresAt: now + expiresIn,
    });
    return token;
}
/**
 * Create or retrieve a cached HTTP client for JingMe API
 */
export function createJingmeClient(account) {
    const key = cacheKey(account);
    const cached = clientCache.get(key);
    if (cached) {
        return cached;
    }
    const domain = getApiDomain(account.environment);
    // Simple client wrapper for undici
    const client = {
        baseURL: domain,
        async post(path, data) {
            const token = await getAccessToken(account);
            const response = await request(`${domain}${path}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            return {
                data: await response.body.json(),
                status: response.statusCode,
                headers: response.headers,
            };
        },
    };
    clientCache.set(key, client);
    return client;
}
/**
 * Clear cached token for an account (e.g., after token expiration error)
 */
export function clearTokenCache(account) {
    tokenCache.delete(cacheKey(account));
}
/**
 * Clear all cached clients and tokens
 */
export function clearAllCaches() {
    tokenCache.clear();
    clientCache.clear();
}
//# sourceMappingURL=client.js.map