/**
 * JingMe Channel Plugin
 *
 * Implements the ChannelPlugin interface for JingMe integration.
 * Provides account configuration, message sending, and gateway management.
 */
import type { ChannelPlugin } from 'clawdbot/plugin-sdk';
import type { ResolvedJingmeAccount, SendResult } from './types.js';
/**
 * Send a text message via JingMe API
 * Supports both direct messages (sessionType=1) and group messages (sessionType=2)
 */
export declare function sendTextMessage(account: ResolvedJingmeAccount, sessionId: string, sessionType: 1 | 2, text: string): Promise<SendResult>;
/**
 * JingMe channel plugin implementation
 */
export declare const jingmePlugin: ChannelPlugin<ResolvedJingmeAccount>;
//# sourceMappingURL=channel.d.ts.map