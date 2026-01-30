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
  openTeamId?: string;
  environment?: JingmeEnvironment;
  webhookPort?: number;
  verificationToken?: string;
  encryptKey?: string;
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
   openTeamId: string;
  environment: JingmeEnvironment;
  webhookPort: number;
  verificationToken?: string;
  encryptKey?: string;
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
 * Sender information in JingMe message event
 */
export interface JingmeSender {
  app: string; // 租户 app (e.g., "ee")
  pin: string; // 用户 erp/PIN
  clientType: string; // 客户端类型 (e.g., "pc", "mobile")
  clientVersion: string; // 客户端版本
}

/**
 * Message body structure in JingMe event
 */
export interface JingmeMessageBody {
  param: {
    pushContent: string; // 推送内容
  };
  state: number; // 消息状态
  requestData: {
    sessionId: string; // 会话 ID
  };
  type: string; // 消息类型 (e.g., "text", "card")
  content?: string; // 消息内容 (文本消息)
  callbackData?: Record<string, unknown>; // 卡片回传数据
  actionData?: Record<string, unknown>; // 卡片交互回传数据
}

/**
 * Nested event structure within JingMe message event
 */
export interface JingmeEvent {
  sender: JingmeSender;
  msgId: string; // 消息 ID
  body: JingmeMessageBody;
  chatType: number; // 聊天类型: 1 = 单聊, 2 = 群聊
}

/**
 * JingMe message event from webhook callback
 * Structure based on京me开放平台 event format
 */
export interface JingmeMessageEvent {
  challenge?: string;
  timeStamp: number; // 事件发生时间戳
  eventId: string; // 事件 ID
  robotApp: string; // 机器人应用 ID (e.g., "robot.dd")
  eventType: string; // 事件类型 (e.g., "chat_message")
  event: JingmeEvent;
  robotPin: string; // 机器人 PIN
  token: string; // 机器人验证 token
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
    appAccessToken?: string;
    teamAccessToken?: string;
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
