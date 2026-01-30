# 京me 插件 - 快速参考卡

## 📋 项目结构

```
extensions/jingme/
├── src/
│   ├── types.ts          # 类型定义 (interface, enum)
│   ├── runtime.ts        # 全局API上下文
│   ├── client.ts         # HTTP客户端 + Token管理
│   ├── webhook.ts        # Webhook服务器
│   ├── monitor.ts        # 消息监控协调
│   └── channel.ts        # ChannelPlugin实现
├── index.ts              # 插件导出
├── package.json          # NPM配置
├── tsconfig.json         # TS编译配置
├── clawdbot.plugin.json  # 配置Schema
└── 文档/
    ├── README.md              # 👈 从这里开始
    ├── ARCHITECTURE.md        # 设计细节
    ├── INTEGRATION_GUIDE.md   # 集成步骤
    ├── DEPLOYMENT.md          # 生产部署
    ├── EXAMPLES.md            # 配置示例
    ├── CHANGELOG.md           # 版本历史
    └── SUMMARY.md             # 项目总结
```

## 🚀 快速开始

### 1️⃣ 安装
```bash
npm install @clawdbot/jingme
```

### 2️⃣ 配置
```yaml
channels:
  jingme:
    accounts:
      default:
        appKey: "your-app-key"
        appSecret: "your-app-secret"
        robotId: "your-robot-id"
```

### 3️⃣ 启动
```bash
npm start
```

## 📚 文档导航

| 需要...  | 查看                   |
| -------- | ---------------------- |
| 快速开始 | `README.md`            |
| 深入理解 | `ARCHITECTURE.md`      |
| 集成指导 | `INTEGRATION_GUIDE.md` |
| 部署上线 | `DEPLOYMENT.md`        |
| 配置示例 | `EXAMPLES.md`          |
| 版本信息 | `CHANGELOG.md`         |
| 项目概况 | `SUMMARY.md`           |

## 🔑 核心概念

### 类型 (types.ts)
```typescript
JingmeAccountConfig      // 原始配置
ResolvedJingmeAccount    // 解析后配置
JingmeMessageEvent       // 接收的事件
SendResult               // 发送结果
```

### 客户端 (client.ts)
```typescript
createJingmeClient()     // 创建HTTP客户端
getAccessToken()         // 获取/刷新Token (自动缓存)
clearTokenCache()        // 清除Token缓存
```

### Webhook (webhook.ts)
```typescript
startWebhookServer()     // 启动服务器
verifySignature()        // 验证签名
routeMessage()           // 路由消息
```

### 监控 (monitor.ts)
```typescript
monitorJingmeProvider()  // 启动监控
stopMonitor()            // 停止监控
```

### 插件 (channel.ts)
```typescript
jingmePlugin             // 主要导出
  .config                // 账户管理
  .outbound              // 消息发送
  .gateway               // 生命周期
  .directory             // 目录操作
  .dmPolicy              // 单聊策略
  .groupPolicy           // 群聊策略
  .setup                 // 配置验证
```

## ⚙️ 配置速查表

```yaml
# 最小配置
appKey: "app-key"
appSecret: "app-secret"
robotId: "robot-id"

# 完整配置
enabled: true
environment: "prod"              # prod | test
webhookPort: 3001
verificationToken: "token"       # 可选
dmPolicy: "open"                 # open | allowlist
dmAllowlist: ["pin1", "pin2"]
groupPolicy: "open"              # open | allowlist | disabled
groupAllowlist: ["oc_group1"]
historyLimit: 10
```

## 📡 API 端点

```
获取Token
  POST /open-api/suite/v1/access/getAppAccessToken

发送消息
  POST /open-api/suite/v1/timline/sendRobotMsg

列出群组
  POST /open-api/suite/v1/timline/getRobotGroup
```

## 🔄 消息流

### 发送消息
```
sendMessage()
  ↓
getAccessToken()  [缓存检查]
  ↓
POST /timline/sendRobotMsg
  ↓
SendResult {ok, messageId, error}
```

### 接收消息
```
Webhook POST
  ↓
验证签名
  ↓
路由到handler
  ↓
inbound.handleMessage()
```

## 🛠️ 常见任务

### 发送单聊消息
```javascript
await bot.send({
  channel: "jingme",
  recipient: "user-pin",
  text: "Hello!"
});
```

### 发送群聊消息
```javascript
await bot.send({
  channel: "jingme",
  recipient: "oc_group-id",
  text: "Hello, group!"
});
```

### 列出群组
```javascript
const groups = await bot.listGroups({
  channel: "jingme"
});
```

### 多账户使用
```javascript
await bot.send({
  channel: "jingme",
  accountId: "prod",  // 指定账户
  recipient: "user-pin",
  text: "From prod account"
});
```

## 🔒 安全最佳实践

```bash
# ✓ 使用环境变量
export JINGME_APP_KEY="xxx"
export JINGME_APP_SECRET="xxx"

# ✓ 配置Webhook验证Token
verificationToken: "secure-random-token"

# ✓ 限制访问范围
dmPolicy: "allowlist"
groupPolicy: "allowlist"

# ✗ 避免在代码中硬编码凭证
```

## ❌ 常见错误

| 错误            | 原因           | 解决                  |
| --------------- | -------------- | --------------------- |
| 找不到模块      | 依赖未安装     | `npm install`         |
| Token过期       | 缓存超时       | 自动刷新              |
| Webhook验证失败 | Token不匹配    | 检查verificationToken |
| 消息发送失败    | 机器人不在群内 | 添加机器人到群        |

## 📊 系统要求

- Node.js 18+
- npm/yarn
- 网络连接
- 防火墙开放：出站443，入站3001

## 🚀 部署方式

| 方式     | 难度 | 适用场景  |
| -------- | ---- | --------- |
| 本地运行 | ⭐    | 开发测试  |
| Docker   | ⭐⭐   | 容器编排  |
| PM2      | ⭐⭐   | 进程管理  |
| systemd  | ⭐⭐   | Linux服务 |
| K8s      | ⭐⭐⭐  | 大规模    |

## 📈 监控指标

```
Webhook服务器运行状态
Token获取成功率
消息发送成功率
内存使用率 > 80% ⚠️
错误日志频率
```

## 🔗 相关资源

| 资源                                                            | 用途     |
| --------------------------------------------------------------- | -------- |
| [京me开放平台](http://openme.jd.local)                          | API文档  |
| [GitHub仓库](https://github.com/xiangyin1987/moltbot-warehouse) | 源代码   |
| [Moltbot文档](../../../README.md)                               | 主项目   |
| [Lark插件](../lark/README.md)                                   | 参考实现 |

## 💡 最佳实践

### 配置管理
```bash
# 使用环境变量管理敏感信息
# 使用不同环境配置（dev/test/prod）
# 定期轮换Token
```

### 日志管理
```bash
# 启用日志聚合
# 设置适当的日志级别
# 监控关键错误
```

### 性能优化
```bash
# Token缓存自动管理
# 连接复用（HTTP client缓存）
# 并发Webhook处理
```

### 错误处理
```bash
# 捕获所有异常
# 提供有意义的错误消息
# 实现自动重试逻辑
```

## 📞 获取帮助

1. 📖 查看文档（README, ARCHITECTURE, INTEGRATION_GUIDE）
2. 🔍 搜索 Issues 和 Discussions
3. 📝 提交 Issue 附带：
   - 错误信息
   - 日志输出
   - 重现步骤
   - 环境信息

## 📅 版本信息

- **当前版本**：0.0.1
- **发布日期**：2026-01-28
- **状态**：稳定
- **许可证**：MIT

## 🎯 下一步

1. ✅ 阅读 `README.md` 了解基本用法
2. ✅ 查看 `EXAMPLES.md` 的配置示例
3. ✅ 按照 `INTEGRATION_GUIDE.md` 进行集成
4. ✅ 参考 `DEPLOYMENT.md` 进行部署
5. ✅ 查阅 `ARCHITECTURE.md` 深入了解

---

**需要更多帮助？** 查看完整文档或提交 Issue！
