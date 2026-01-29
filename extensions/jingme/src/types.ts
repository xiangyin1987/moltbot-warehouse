/**
 * JingMe Plugin Type Definitions
 *
 * Core types for JingMe (京me) integration with Moltbot.
 * JingMe is JD.com's internal communication platform similar to DingDing.
 */

// Environment and access control
export type JingmeEnvironment = 'prod' | 'test';
export type DmPolicy = 'open' | 'allowlist';
export type GroupPolicy = 'open' | 'allowlist' | 'disabled';

/**
 * Raw account configuration from channels.jingme.accounts.<id>
 * All fields are optional - defaults applied during resolution.
 */
export interface JingmeAccountConfig {
  enabled?: boolean;
  appKey?: string;
  appSecret?: string;
  robotId?: string;
  environment?: JingmeEnvironment;
  webhookPort?: number;
  verificationToken?: string;
  dmPolicy?: DmPolicy;
  dmAllowlist?: string[];
  groupPolicy?: GroupPolicy;
  groupAllowlist?: string[];
  historyLimit?: number;
}

/**
 * Fully resolved account with all defaults applied.
 * Used throughout the plugin after initial resolution.
 */
export interface ResolvedJingmeAccount {
  id: string; // Required by AccountConfig interface
  accountId: string;
  enabled: boolean;
  configured: boolean;
  appKey: string;
  appSecret: string;
  robotId: string;
  environment: JingmeEnvironment;
  webhookPort: number;
  verificationToken?: string;
  dmPolicy: DmPolicy;
  dmAllowlist: string[];
  groupPolicy: GroupPolicy;
  groupAllowlist: string[];
  historyLimit: number;
}

/**
 * Top-level JingMe channel configuration in channels.jingme
 */
export interface JingmeChannelConfig {
  enabled?: boolean;
  accounts?: Record<string, JingmeAccountConfig>;
}

/**
 * JingMe message event from webhook callback
 * Structure based on京me开放平台 event format
 */
export interface JingmeMessageEvent {
  from: {
    app: string; // 租户 app (e.g., "ee")
    pin: string; // 用户 erp/PIN
    clientType: string; // 客户端类型 (e.g., "pc", "mobile")
  };
  to: {
    app: string; // 机器人 app
    pin: string; // 机器人 PIN
  };
  gid?: string; // 群号 (群聊会话携带)
  datetime: number; // 时间戳
  token: string; // 机器人验证 token
  lang: string; // 客户端语言 (e.g., "zh_cn")
  body: {
    templateId?: string; // 互动卡片模板 ID
    cardMsgId?: string; // 卡片消息 ID
    sessionType: number; // 会话类型: 1 = 单聊, 2 = 群聊
    sessionId: string; // 会话 ID
    content?: string; // 消息内容 (文本消息)
    callbackData?: Record<string, unknown>; // 卡片回传数据
    actionData?: Record<string, unknown>; // 卡片交互回传数据
  };
}

/**
 * Normalized message after parsing JingMe event
 */
export interface ParsedMessage {
  messageId: string;
  sessionId: string;
  sessionType: 'p2p' | 'group';
  senderId: string;
  senderPin: string;
  text: string;
  timestamp: number;
  cardData?: Record<string, unknown>;
}

/**
 * Result from sending a message
 */
export interface SendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Access token response from JingMe API
 */
export interface TokenResponse {
  code: number;
  msg: string;
  data?: {
    appAccessToken: string;
    expiresIn: number;
  };
}

/**
 * Send message response from JingMe API
 */
export interface SendMessageResponse {
  code: number;
  msg: string;
  data?: {
    msgId: string;
  };
}
