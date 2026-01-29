/**
 * JingMe API Client Factory
 *
 * Creates and caches API clients for JingMe.
 * Handles authentication and token management.
 */

import axios, { type AxiosInstance } from 'axios';
import type { ResolvedJingmeAccount } from './types.js';

// API domain mapping
const API_DOMAINS = {
  prod: 'http://openme.jd.local',
  test: 'http://openme-test.jd.local',
};

// Cache for access tokens: key = appKey:appSecret
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

// Cache for client instances
const clientCache = new Map<string, AxiosInstance>();

/**
 * Generate cache key for an account
 */
function cacheKey(account: ResolvedJingmeAccount): string {
  return `${account.appKey}:${account.appSecret}`;
}

/**
 * Get the API domain for the environment
 */
function getApiDomain(environment: 'prod' | 'test'): string {
  return API_DOMAINS[environment];
}

/**
 * Get or refresh access token for the account
 */
async function getAccessToken(account: ResolvedJingmeAccount): Promise<string> {
  const cacheKey_ = cacheKey(account);
  const cached = tokenCache.get(cacheKey_);
  const now = Date.now();

  // Return cached token if still valid (with 60s buffer)
  if (cached && cached.expiresAt > now + 60000) {
    return cached.token;
  }

  // Request new token
  const domain = getApiDomain(account.environment);
  const response = await axios.post(
    `${domain}/open-api/suite/v1/access/getAppAccessToken`,
    {
      appKey: account.appKey,
      appSecret: account.appSecret,
    },
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    },
  );

  if (response.data.code !== 1 || !response.data.data?.appAccessToken) {
    throw new Error(
      `Failed to get access token: ${response.data.msg || 'Unknown error'}`,
    );
  }

  const token = response.data.data.appAccessToken;
  const expiresIn = (response.data.data.expiresIn || 7200) * 1000; // Convert to ms

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
export function createJingmeClient(
  account: ResolvedJingmeAccount,
): AxiosInstance {
  const key = cacheKey(account);
  const cached = clientCache.get(key);

  if (cached) {
    return cached;
  }

  const domain = getApiDomain(account.environment);

  const client = axios.create({
    baseURL: domain,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });

  // Add request interceptor to include authorization header
  client.interceptors.request.use(async (config) => {
    const token = await getAccessToken(account);
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  clientCache.set(key, client);
  return client;
}

/**
 * Clear cached token for an account (e.g., after token expiration error)
 */
export function clearTokenCache(account: ResolvedJingmeAccount): void {
  tokenCache.delete(cacheKey(account));
}

/**
 * Clear all cached clients and tokens
 */
export function clearAllCaches(): void {
  tokenCache.clear();
  clientCache.clear();
}
