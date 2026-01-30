# 京me (JingMe) 插件代码文档

## 概述

京me插件是基于Lark插件的架构开发的，为Moltbot提供与京me（JD.com内部通讯平台）的集成能力。

## 架构设计

### 分层架构

```
┌─────────────────────────────────────────┐
│      Moltbot Plugin API                 │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│   Channel Plugin (channel.ts)           │  ← 主要入口，实现ChannelPlugin接口
├─────────────────────────────────────────┤
│   Business Logic Layer                  │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  Monitor    │  │   Client         │  │  ← 消息接收与API调用
│  │ (monitor.ts)│  │  (client.ts)     │  │
│  └─────────────┘  └──────────────────┘  │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  Webhook    │  │   Runtime        │  │  ← 基础设施
│  │(webhook.ts) │  │  (runtime.ts)    │  │
│  └─────────────┘  └──────────────────┘  │
└─────────────────────────────────────────┘
```

## 核心模块说明

### 1. types.ts - 类型定义

定义了京me集成所需的所有类型：

```typescript
// 账户配置
interface JingmeAccountConfig        // 原始配置（可选字段）
interface ResolvedJingmeAccount      // 解析后配置（必填字段+默认值）

// 消息事件
interface JingmeMessageEvent         // 京me Webhook事件格式
interface ParsedMessage              // 标准化的消息格式

// API交互
interface TokenResponse              // Access Token响应
interface SendMessageResponse        // 发送消息响应
interface SendResult                 // 统一的发送结果格式
```

**关键特征：**
- 区分原始配置和解析后配置，便于处理默认值和环境变量
- 完整的WebHook事件结构定义
- 标准化的API响应格式

### 2. client.ts - API客户端

负责与京me API的所有交互：

```typescript
// 核心功能
createJingmeClient(account)          // 创建HTTP客户端（带缓存）
getAccessToken(account)              // 获取/刷新Token
clearTokenCache(account)             // 清除特定Token缓存
```

**Token管理机制：**
1. **缓存策略**：使用Map缓存Token，以appKey:appSecret为键
2. **过期检查**：比较当前时间与过期时间，留有60秒缓冲
3. **自动刷新**：过期或不存在时自动请求新Token
4. **拦截器集成**：使用axios拦截器自动添加Authorization头

```typescript
// Token缓存键示例
cache: {
  "app123:secret456": {
    token: "eyJ0eXAiOiJKV1QiLCJhbGc...",
    expiresAt: 1704067200000  // 毫秒时间戳
  }
}
```

### 3. webhook.ts - Webhook服务器

实现HTTP服务器接收京me事件：

```typescript
startWebhookServer(account, abortSignal)  // 启动Webhook服务器
verifySignature(token, timestamp, body, signature)  // 验证签名
parseBody(req)                             // 解析请求体
routeMessage(event, account)               // 路由消息到Moltbot
```

**安全特性：**
- 基于SHA256的签名验证
- 时间戳防重放攻击
- 可配置的验证Token

**错误恢复：**
- 自动崩溃重启（最多5次）
- 3秒重启延迟
- 优雅的关闭处理

### 4. monitor.ts - 消息监控

协调Webhook服务器的启动和停止：

```typescript
monitorJingmeProvider(account, abortSignal)  // 启动监控
stopMonitor()                                 // 停止监控
```

**生命周期管理：**
1. 创建AbortController用于优雅关闭
2. 启动Webhook服务器
3. 保存对服务器的引用以便关闭

### 5. channel.ts - 插件核心

实现ChannelPlugin接口，是整个插件的主要入口：

```typescript
export const jingmePlugin: ChannelPlugin<ResolvedJingmeAccount> = {
  id: "jingme",
  meta: { ... },
  capabilities: { ... },
  config: { ... },      // 账户管理
  handlers: { ... },    // 消息处理
  gateways: { ... }     // 网关生命周期
}
```

**关键功能：**

#### a) 账户配置管理 (config)

```typescript
listAccountIds(cfg)       // 列出所有账户ID
resolveAccount(cfg, id)   // 解析单个账户配置
validateAccount(account)  // 验证账户配置
```

**配置解析流程：**
```
原始配置 (config.yaml)
    ↓
环境变量 (JINGME_*)
    ↓
默认值 (DEFAULTS)
    ↓
ResolvedJingmeAccount
```

#### b) 消息处理 (handlers)

```typescript
sendMessage(account, recipient, text)     // 发送消息
sendReply(account, recipient, text)       // 回复消息（当前=发送消息）
listGroups(account)                        // 列出群组
```

**会话类型检测：**
```typescript
// 根据recipient ID前缀判断会话类型
"oc_xxxxx"  → 群聊 (sessionType=2)
"pin_xxxx"  → 单聊 (sessionType=1)
```

#### c) 网关管理 (gateways)

```typescript
async *iterate(cfg)  // 生成账户网关迭代器
```

**网关生命周期：**
1. 遍历所有启用的账户
2. 为每个账户创建AbortController
3. 启动Webhook监控
4. 返回网关对象，包含stop方法用于清理

### 6. runtime.ts - 运行时上下文

存储和提供对Moltbot API的全局访问：

```typescript
setJingmeRuntime(api)   // 设置运行时上下文
getJingmeRuntime()      // 获取运行时上下文
```

### 7. index.ts - 插件入口

导出公共API和插件对象：

```typescript
export const jingmePlugin              // 主插件对象
export { createJingmeClient }          // API客户端
export { startWebhookServer }          // Webhook服务器
export { monitorJingmeProvider }       // 消息监控
export type { ... }                    // 公共类型
```

## 数据流

### 发送消息流程

```
Moltbot API
    ↓
Channel Plugin (handlers.sendMessage)
    ↓
getAccessToken (token cache check)
    ↓ (if expired)
POST /open-api/suite/v1/access/getAppAccessToken
    ↓
POST /open-api/suite/v1/timline/sendRobotMsg
    ↓
SendResult { ok, messageId, error }
```

### 接收消息流程

```
京me Webhook POST
    ↓
Webhook Server (webhook.ts)
    ↓
verifySignature (if configured)
    ↓
parseBody
    ↓
routeMessage (monitor.ts)
    ↓
Moltbot API.inbound.handleMessage
```

## 配置示例

### 基础配置

```yaml
channels:
  jingme:
    accounts:
      default:
        appKey: "app-key-12345"
        appSecret: "app-secret-67890"
        robotId: "robot-001"
```

### 高级配置

```yaml
channels:
  jingme:
    accounts:
      prod:
        enabled: true
        appKey: "prod-app-key"
        appSecret: "prod-app-secret"
        robotId: "prod-robot"
        environment: "prod"
        webhookPort: 3001
        verificationToken: "secret-token"
        dmPolicy: "allowlist"
        dmAllowlist:
          - "user123"
          - "user456"
        groupPolicy: "allowlist"
        groupAllowlist:
          - "oc_group001"
          - "oc_group002"
      
      test:
        appKey: "test-app-key"
        appSecret: "test-app-secret"
        robotId: "test-robot"
        environment: "test"
        webhookPort: 3002
```

### 环境变量配置

```bash
export JINGME_APP_KEY="app-key"
export JINGME_APP_SECRET="app-secret"
export JINGME_ROBOT_ID="robot-id"
export JINGME_VERIFICATION_TOKEN="webhook-token"
```

## 错误处理

### 常见错误

| 错误            | 原因           | 解决方案         |
| --------------- | -------------- | ---------------- |
| 找不到模块      | 依赖未安装     | `npm install`    |
| Token过期       | 缓存超时       | 自动刷新（内置） |
| Webhook验证失败 | Token不匹配    | 检查配置         |
| 消息发送失败    | 机器人不在群内 | 添加机器人到群   |

### 调试建议

1. **启用日志**：检查Moltbot日志输出
2. **验证配置**：确认appKey、appSecret、robotId正确
3. **测试Webhook**：使用curl测试Webhook端点
4. **监控Token**：验证Token获取和缓存逻辑

## 与Lark插件的对比

| 特性      | Lark                | JingMe   |
| --------- | ------------------- | -------- |
| 连接方式  | WebSocket + Webhook | Webhook  |
| Token管理 | SDK内置             | 手动实现 |
| 消息类型  | 富文本支持          | 文本为主 |
| 群组管理  | 完整的API           | 基础API  |
| 线程支持  | 是                  | 否       |

## 扩展点

### 1. 添加消息类型支持

在`types.ts`中扩展`JingmeMessageEvent`，在`channel.ts`中添加新的handler。

### 2. 添加新的API接口

在`client.ts`中创建新的方法，使用现有的`getAccessToken`和`createJingmeClient`。

### 3. 自定义验证逻辑

在`webhook.ts`的`verifySignature`中修改签名算法。

## 性能考虑

1. **Token缓存**：减少API调用，自动处理过期
2. **HTTP客户端缓存**：复用连接，减少初始化开销
3. **并发处理**：Webhook服务器可以处理并发请求
4. **内存管理**：缓存有大小限制（默认Map），需要监控

## 安全建议

1. **环境变量**：敏感信息使用环境变量，不要提交到代码库
2. **Webhook验证**：启用verificationToken
3. **HTTPS**：在生产环境使用HTTPS
4. **速率限制**：注意京me API的频率限制（50 req/s）

## License

MIT
