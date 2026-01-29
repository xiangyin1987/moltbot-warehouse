# Lark Plugin 代码文档

## 项目概述

这是一个为 Clawdbot 提供的 Lark（飞书）消息平台集成插件。支持通过 WebSocket 或 Webhook 模式接收和发送消息，适用于个人和企业账户。

## 目录结构

```
lark/
├── clawdbot.plugin.json      # 插件配置文件
├── index.ts                  # 主入口文件
├── package.json              # 包配置文件
├── package-lock.json         # 依赖锁定文件
├── README.md                 # 使用说明文档
└── src/
    ├── channel.ts            # 频道插件实现
    ├── client.ts             # Lark SDK 客户端工厂
    ├── monitor.ts            # 消息监控器
    ├── runtime.ts            # 运行时环境
    ├── types.ts              # 类型定义
    └── webhook.ts            # Webhook 服务器
```

## 核心文件详解

### 1. 插件配置文件 (clawdbot.plugin.json)

```json
{
  "id": "lark",
  "channels": ["lark"],
  "configSchema": {
    "type": "object",
    "properties": {
      "accounts": {
        "type": "object",
        "additionalProperties": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true,
              "description": "Enable this account"
            },
            "appId": {
              "type": "string",
              "description": "Lark App ID (cli_xxx)"
            },
            "appSecret": {
              "type": "string",
              "description": "Lark App Secret"
            },
            "encryptKey": {
              "type": "string",
              "description": "Encrypt key for event verification (optional)"
            },
            "domain": {
              "type": "string",
              "enum": ["lark", "feishu"],
              "default": "lark",
              "description": "API domain: lark (international) or feishu (China)"
            },
            "connectionMode": {
              "type": "string",
              "enum": ["websocket", "webhook"],
              "default": "websocket",
              "description": "Connection mode: websocket (enterprise) or webhook (individual accounts)"
            },
            "verificationToken": {
              "type": "string",
              "description": "Verification token for webhook events (from Lark app settings)"
            },
            "webhookPort": {
              "type": "number",
              "default": 3000,
              "description": "Port for webhook server (webhook mode only)"
            },
            "dmPolicy": {
              "type": "string",
              "enum": ["open", "pairing", "allowlist"],
              "default": "pairing",
              "description": "DM access policy"
            },
            "groupPolicy": {
              "type": "string",
              "enum": ["open", "allowlist", "disabled"],
              "default": "open",
              "description": "Group chat access policy"
            },
            "groupMentionGated": {
              "type": "boolean",
              "default": true,
              "description": "Require @mention in group chats"
            }
          }
        }
      }
    }
  },
  "uiHints": {
    "appSecret": {
      "label": "App Secret",
      "sensitive": true
    },
    "encryptKey": {
      "label": "Encrypt Key",
      "sensitive": true
    },
    "verificationToken": {
      "label": "Verification Token",
      "sensitive": true
    }
  }
}
```

### 2. 主入口文件 (index.ts)

```typescript
/**
 * Moltbot Lark Plugin
 *
 * Provides Lark/Feishu (Larksuite) messaging integration.
 * Supports WebSocket-based real-time messaging with direct
 * messages and group chats.
 */

import type { MoltbotPluginApi } from "clawdbot/plugin-sdk";
import { emptyPluginConfigSchema } from "clawdbot/plugin-sdk";

import { larkPlugin } from "./src/channel.js";
import { setLarkRuntime } from "./src/runtime.js";

// Re-export for programmatic usage
export { larkPlugin } from "./src/channel.js";
export { createLarkClient, createLarkWSClient } from "./src/client.js";
export { monitorLarkProvider, stopMonitor } from "./src/monitor.js";
export { startWebhookServer } from "./src/webhook.js";
export type {
  LarkDomain,
  LarkConnectionMode,
  LarkAccountConfig,
  ResolvedLarkAccount,
  LarkChannelConfig,
  LarkMessageEvent,
  ParsedMessage,
  SendResult,
} from "./src/types.js";

const plugin = {
  id: "lark",
  name: "Lark",
  description: "Lark (Larksuite) channel plugin for Moltbot",
  configSchema: emptyPluginConfigSchema(),
  register(api: MoltbotPluginApi) {
    setLarkRuntime(api);
    api.registerChannel({ plugin: larkPlugin });
  },
};

export default plugin;
```

### 3. 包配置文件 (package.json)

```json
{
  "name": "@clawdbot/lark",
  "version": "0.0.1",
  "type": "module",
  "description": "Clawdbot Lark channel plugin",
  "clawdbot": {
    "extensions": [
      "./index.ts"
    ]
  },
  "dependencies": {
    "@larksuiteoapi/node-sdk": "^1.37.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### 4. 类型定义 (src/types.ts)

```typescript
/**
 * Lark Plugin Type Definitions
 *
 * Core types for Lark/Feishu integration with Moltbot.
 * Designed for clarity and minimal redundancy.
 */

// Domain and connection configuration
export type LarkDomain = "lark" | "feishu";
export type LarkConnectionMode = "websocket" | "webhook";

// Access control policies
export type DmPolicy = "open" | "pairing" | "allowlist";
export type GroupPolicy = "open" | "allowlist" | "disabled";

/**
 * Raw account configuration from channels.lark.accounts.<id>
 * All fields are optional - defaults applied during resolution.
 */
export interface LarkAccountConfig {
  enabled?: boolean;
  appId?: string;
  appSecret?: string;
  encryptKey?: string;
  verificationToken?: string;
  domain?: LarkDomain;
  connectionMode?: LarkConnectionMode;
  webhookPort?: number;
  dmPolicy?: DmPolicy;
  dmAllowlist?: string[];
  groupPolicy?: GroupPolicy;
  groupMentionGated?: boolean;
  groupAllowlist?: string[];
  historyLimit?: number;
}

/**
 * Fully resolved account with all defaults applied.
 * Used throughout the plugin after initial resolution.
 */
export interface ResolvedLarkAccount {
  accountId: string;
  enabled: boolean;
  configured: boolean;
  appId: string;
  appSecret: string;
  encryptKey?: string;
  verificationToken?: string;
  domain: LarkDomain;
  connectionMode: LarkConnectionMode;
  webhookPort: number;
  dmPolicy: DmPolicy;
  dmAllowlist: string[];
  groupPolicy: GroupPolicy;
  groupMentionGated: boolean;
  groupAllowlist: string[];
  historyLimit: number;
}

/**
 * Top-level Lark channel configuration in channels.lark
 */
export interface LarkChannelConfig {
  enabled?: boolean;
  accounts?: Record<string, LarkAccountConfig>;
}

/**
 * Lark message event payload from im.message.receive_v1
 * Matches the official Lark SDK event structure.
 */
export interface LarkMessageEvent {
  sender: {
    sender_id: {
      open_id: string;
      user_id?: string;
      union_id?: string;
    };
    sender_type: string;
    tenant_key: string;
  };
  message: {
    message_id: string;
    root_id?: string;
    parent_id?: string;
    create_time: string;
    update_time?: string;
    chat_id: string;
    chat_type: "p2p" | "group";
    message_type: string;
    content: string;
    mentions?: LarkMention[];
  };
}

/**
 * Mention data within a Lark message
 */
export interface LarkMention {
  key: string;
  id: {
    open_id: string;
    user_id?: string;
    union_id?: string;
  };
  name: string;
  tenant_key: string;
}

/**
 * Normalized message after parsing Lark event
 */
export interface ParsedMessage {
  messageId: string;
  chatId: string;
  chatType: "p2p" | "group";
  senderId: string;
  senderType: string;
  text: string;
  threadId?: string;
  mentions: Array<{ id: string; name: string }>;
  timestamp: number;
}

/**
 * Result from sending a message
 */
export interface SendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}
```

### 5. 客户端工厂 (src/client.ts)

```typescript
/**
 * Lark SDK Client Factory
 *
 * Creates and caches Lark API clients. Supports both REST API
 * and WebSocket clients for different use cases.
 */

import * as Lark from "@larksuiteoapi/node-sdk";

import type { ResolvedLarkAccount, LarkDomain } from "./types.js";

// Cache key for client instances
type ClientCacheKey = `${string}:${string}:${LarkDomain}`;

// REST client cache - keyed by appId:appSecret:domain
const clientCache = new Map<ClientCacheKey, Lark.Client>();

/**
 * Convert domain string to Lark SDK enum
 */
function toLarkDomain(domain: LarkDomain): Lark.Domain {
  return domain === "feishu" ? Lark.Domain.Feishu : Lark.Domain.Lark;
}

/**
 * Generate cache key for an account
 */
function cacheKey(account: ResolvedLarkAccount): ClientCacheKey {
  return `${account.appId}:${account.appSecret}:${account.domain}`;
}

/**
 * Validate account has required credentials
 */
function validateCredentials(account: ResolvedLarkAccount): void {
  if (!account.appId || !account.appSecret) {
    throw new Error("Lark appId and appSecret are required");
  }
}

/**
 * Create or retrieve a cached Lark REST API client.
 *
 * Clients are cached by appId + appSecret + domain to allow
 * efficient reuse across multiple calls with the same account.
 */
export function createLarkClient(account: ResolvedLarkAccount): Lark.Client {
  validateCredentials(account);

  const key = cacheKey(account);
  const cached = clientCache.get(key);
  if (cached) {
    return cached;
  }

  const client = new Lark.Client({
    appId: account.appId,
    appSecret: account.appSecret,
    appType: Lark.AppType.SelfBuild,
    domain: toLarkDomain(account.domain),
  });

  clientCache.set(key, client);
  return client;
}

/**
 * Create a Lark WebSocket client for long-lived connections.
 *
 * WebSocket clients are NOT cached because they manage their own
 * connection lifecycle and should be created fresh for each session.
 */
export function createLarkWSClient(account: ResolvedLarkAccount): Lark.WSClient {
  validateCredentials(account);

  return new Lark.WSClient({
    appId: account.appId,
    appSecret: account.appSecret,
    domain: toLarkDomain(account.domain),
    loggerLevel: Lark.LoggerLevel.info,
  });
}

/**
 * Create an event dispatcher for handling Lark webhook/websocket events.
 */
export function createEventDispatcher(
  encryptKey?: string,
  verificationToken?: string
): Lark.EventDispatcher {
  return new Lark.EventDispatcher({
    encryptKey,
    verificationToken,
  });
}

/**
 * Clear all cached clients.
 * Useful for testing or when credentials change.
 */
export function clearClientCache(): void {
  clientCache.clear();
}
```

### 6. 运行时环境 (src/runtime.ts)

```typescript
/**
 * Lark Plugin Runtime
 *
 * Manages the plugin API context provided by Moltbot.
 * The API is set once during plugin registration and
 * provides access to logging, inbound message handling, etc.
 */

import type { MoltbotPluginApi } from "clawdbot/plugin-sdk";

let pluginApi: MoltbotPluginApi | null = null;

/**
 * Initialize the Lark plugin with the API context.
 * Called once during plugin registration.
 */
export function setLarkRuntime(api: MoltbotPluginApi): void {
  pluginApi = api;
}

/**
 * Get the current plugin API.
 * Throws if called before plugin registration.
 */
export function getLarkRuntime(): MoltbotPluginApi {
  if (!pluginApi) {
    throw new Error(
      "Lark runtime not initialized. Ensure the plugin is properly registered."
    );
  }
  return pluginApi;
}

/**
 * Check if runtime has been initialized.
 * Useful for conditional logic without throwing.
 */
export function hasLarkRuntime(): boolean {
  return pluginApi !== null;
}
```

### 7. 频道插件实现 (src/channel.ts)

由于文件内容较长，这里展示主要结构和关键函数：

```typescript
/**
 * Lark Channel Plugin
 *
 * Implements the ChannelPlugin interface for Lark/Feishu integration.
 * Provides account configuration, message sending, and gateway management.
 */

// 主要功能包括：
// - 账户配置解析和验证
// - 消息发送功能
// - 群组列表获取
// - 插件元数据和配置
// - 访问控制策略（DM和群组）
```

### 8. 消息监控器 (src/monitor.ts)

```typescript
/**
 * Lark Message Monitor
 *
 * Listens for incoming messages via WebSocket or webhook
 * and routes them to the Moltbot message handler.
 */

// 主要功能包括：
// - WebSocket 连接管理
// - Webhook 事件处理
// - 消息解析和路由
// - 自动重连和清理
```

### 9. Webhook 服务器 (src/webhook.ts)

由于文件内容较长，这里展示主要功能：

```typescript
/**
 * Lark Webhook Server
 *
 * Standalone HTTP server for receiving Lark webhook callbacks.
 * Used for individual accounts that don't support WebSocket.
 * Includes automatic crash recovery.
 */

// 主要功能包括：
// - HTTP 服务器创建和管理
// - 事件解密和验证
// - 消息处理和路由
// - 自动重启机制
// - 图片上传支持
```

## 技术特点

### 架构设计
- **模块化设计**：每个功能模块独立，便于维护和测试
- **类型安全**：完整的 TypeScript 类型定义
- **缓存机制**：客户端实例缓存，提高性能
- **错误处理**：完善的错误处理和日志记录

### 连接模式
- **WebSocket 模式**：适用于企业账户，长连接实时通信
- **Webhook 模式**：适用于个人账户，HTTP 回调方式

### 安全特性
- **事件加密**：支持 AES-256-CBC 加密的事件数据
- **验证令牌**：请求验证和身份认证
- **访问控制**：细粒度的 DM 和群组访问策略

### 消息处理
- **多格式支持**：文本、富文本、图片消息
- **线程支持**：支持消息线程和回复
- **提及处理**：正确处理群组中的@提及
- **消息路由**：智能的消息路由和分发

## 使用说明

详细的安装、配置和使用说明请参考 [README.md](README.md) 文件。

## 开发说明

### 依赖项
- `@larksuiteoapi/node-sdk`: Lark 官方 Node.js SDK
- `typescript`: TypeScript 编译器

### 构建和测试
```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 运行测试
npm test
```

### 贡献指南
欢迎提交 Issue 和 Pull Request，请遵循项目的代码规范和贡献指南。