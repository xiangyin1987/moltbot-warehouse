/**
 * JingMe Plugin Type Definitions
 *
 * Core types for JingMe (京me) integration with Moltbot.
 * JingMe is JD.com's internal communication platform similar to DingDing.
 */
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
    id: string;
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
    app: string;
    pin: string;
    clientType: string;
    clientVersion: string;
}
/**
 * Message body structure in JingMe event
 */
export interface JingmeMessageBody {
    param: {
        pushContent: string;
    };
    state: number;
    requestData: {
        sessionId: string;
    };
    type: string;
    content?: string;
    callbackData?: Record<string, unknown>;
    actionData?: Record<string, unknown>;
}
/**
 * Nested event structure within JingMe message event
 */
export interface JingmeEvent {
    sender: JingmeSender;
    msgId: string;
    body: JingmeMessageBody;
    chatType: number;
    groupId?: string;
}
/**
 * JingMe message event from webhook callback
 * Structure based on京me开放平台 event format
 */
export interface JingmeMessageEvent {
    challenge?: string;
    timeStamp: number;
    eventId: string;
    robotApp: string;
    eventType: string;
    event: JingmeEvent;
    robotPin: string;
    token: string;
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
//# sourceMappingURL=types.d.ts.map