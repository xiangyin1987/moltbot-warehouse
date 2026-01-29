# 京me 插件集成指南

## 快速开始

### 1. 安装依赖

```bash
cd extensions/jingme
npm install
```

### 2. 配置应用

在Moltbot配置文件中添加京me通道：

```yaml
# config.yaml 或 moltbot.config.yaml
channels:
  jingme:
    accounts:
      default:
        appKey: "your-app-key"
        appSecret: "your-app-secret"
        robotId: "your-robot-id"
        webhookPort: 3001
```

### 3. 申请权限

在京me开放平台：
1. 创建应用
2. 申请 **消息权限** - 机器人发送消息

### 4. 配置Webhook

在京me应用设置中：
1. 设置回调地址：`http://your-server:3001`
2. 配置验证Token（可选）

### 5. 启动机器人

```bash
npm start
```

## 配置详解

### 账户配置参数

#### 必填参数

```yaml
appKey: "string"      # 应用ID，来自京me开放平台
appSecret: "string"   # 应用密钥，来自京me开放平台
robotId: "string"     # 机器人ID，用于标识发送消息的机器人
```

#### 可选参数

```yaml
enabled: boolean      # 是否启用账户（默认：true）

# API配置
environment: "prod"   # 环境：prod=正式 / test=测试（默认：prod）
  
# Webhook配置
webhookPort: 3001             # Webhook服务器端口（默认：3001）
verificationToken: "string"   # Webhook验证Token（可选）

# 访问控制
dmPolicy: "open"              # 单聊策略：open=允许所有 / allowlist=白名单（默认：open）
dmAllowlist: ["pin1", "pin2"] # 单聊白名单
groupPolicy: "open"           # 群聊策略：open / allowlist / disabled（默认：open）
groupAllowlist: ["gid1"]      # 群聊白名单

# 其他
historyLimit: 10              # 历史消息限制（默认：10）
```

### 环境变量配置

如果不想在配置文件中暴露敏感信息，可使用环境变量：

```bash
# 必填
JINGME_APP_KEY=your-app-key
JINGME_APP_SECRET=your-app-secret
JINGME_ROBOT_ID=your-robot-id

# 可选
JINGME_VERIFICATION_TOKEN=webhook-token
```

## 使用示例

### 发送消息到用户

```javascript
// 发送单聊消息
await bot.send({
  channel: "jingme",
  accountId: "default",
  recipient: "user-pin",  // 用户的PIN/ERP
  text: "Hello, user!"
});
```

### 发送消息到群组

```javascript
// 发送群聊消息
await bot.send({
  channel: "jingme",
  accountId: "default",
  recipient: "oc_group-id",  // 群ID（以oc_开头）
  text: "Hello, group!"
});
```

### 回复消息

```javascript
// 当前版本中回复和发送消息相同
await bot.reply({
  channel: "jingme",
  accountId: "default",
  recipient: "user-pin",
  text: "Reply message"
});
```

### 列出可用群组

```javascript
const groups = await bot.listGroups({
  channel: "jingme",
  accountId: "default"
});

console.log(groups);
// [
//   { id: "oc_group1", name: "工程部" },
//   { id: "oc_group2", name: "产品部" }
// ]
```

## 消息事件处理

机器人会自动接收京me Webhook事件，处理过程：

```
京me Webhook → Webhook服务器 → 签名验证 → 消息解析 → Moltbot Handler
```

### 接收事件结构

```javascript
{
  "from": {
    "app": "ee",           // 租户应用
    "pin": "user123",      // 用户PIN
    "clientType": "pc"     // 客户端类型
  },
  "to": {
    "app": "ee",
    "pin": "robot001"      // 机器人PIN
  },
  "gid": "1234567890",     // 群号（群聊时）
  "datetime": 1704067200000,  // 时间戳
  "body": {
    "sessionType": 1,      // 1=单聊 / 2=群聊
    "sessionId": "user123", // 会话ID
    "content": "Hello"     // 消息内容
  }
}
```

## Webhook设置详解

### 签名验证（推荐）

如果配置了验证Token，插件会自动验证请求签名：

```typescript
signContent = token + timestamp + body
signature = SHA256(signContent)
```

验证过程：
1. 获取请求头中的签名和时间戳
2. 重新计算签名
3. 比对是否一致

### 手动测试Webhook

```bash
# 使用curl测试
curl -X POST http://localhost:3001 \
  -H "Content-Type: application/json" \
  -H "X-JingMe-Signature: signature-here" \
  -H "X-JingMe-Timestamp: 1704067200000" \
  -d '{
    "from": {"app": "ee", "pin": "user123"},
    "to": {"app": "ee", "pin": "robot001"},
    "datetime": 1704067200000,
    "body": {
      "sessionType": 1,
      "sessionId": "user123",
      "content": "test message"
    }
  }'
```

## 多账户配置

支持配置多个京me账户：

```yaml
channels:
  jingme:
    accounts:
      # 账户1：主账户
      default:
        appKey: "app-key-1"
        appSecret: "app-secret-1"
        robotId: "robot-001"
        webhookPort: 3001
      
      # 账户2：测试账户
      test:
        appKey: "app-key-2"
        appSecret: "app-secret-2"
        robotId: "robot-002"
        webhookPort: 3002
        environment: "test"
      
      # 账户3：内部用
      internal:
        appKey: "app-key-3"
        appSecret: "app-secret-3"
        robotId: "robot-003"
        dmPolicy: "allowlist"
        dmAllowlist:
          - "admin1"
          - "admin2"
```

使用时指定账户ID：

```javascript
// 使用默认账户
await bot.send({
  channel: "jingme",
  accountId: "default",
  recipient: "user-pin",
  text: "Message from default account"
});

// 使用测试账户
await bot.send({
  channel: "jingme",
  accountId: "test",
  recipient: "user-pin",
  text: "Message from test account"
});
```

## 故障排查

### 1. 连接问题

**症状：** Webhook无法接收消息

**检查清单：**
```bash
# 检查Webhook端口是否监听
netstat -an | grep 3001

# 检查防火墙规则
sudo firewall-cmd --list-ports

# 测试连接
curl -v http://localhost:3001/
```

### 2. Token问题

**症状：** 消息发送失败，日志显示Token错误

```
[jingme] Failed to get access token: ...
```

**解决方案：**
```bash
# 验证凭证
echo $JINGME_APP_KEY
echo $JINGME_APP_SECRET

# 检查环境
JINGME_APP_KEY="test-key" JINGME_APP_SECRET="test-secret" npm start
```

### 3. 签名验证失败

**症状：** Webhook返回403错误

```
Webhook signature verification failed
```

**原因：**
- Token配置错误
- 请求体被修改
- 时间戳过期

**解决方案：**
```yaml
# 临时禁用签名验证（仅用于调试）
channels:
  jingme:
    accounts:
      default:
        # 不配置 verificationToken
        appKey: "..."
        appSecret: "..."
        robotId: "..."
```

### 4. 消息发送失败

**症状：** 发送消息返回错误

| 错误码   | 含义           | 解决方案          |
| -------- | -------------- | ----------------- |
| 20100002 | 服务内部错误   | 确认机器人在群内  |
| 20100007 | 消息接收者为空 | 检查recipient参数 |
| 20100009 | 消息限流       | 降低发送频率      |
| 20100012 | 不在发送范围   | 检查访问控制策略  |

### 5. 日志分析

启用详细日志：

```javascript
// 在Moltbot配置中
logging:
  level: "debug"  // 显示调试信息
```

常见日志：
```
[jingme] Starting webhook monitor for account: default
[jingme] Webhook server listening on port 3001
[jingme] Received message from user123 in direct sessionId
[jingme] Failed to get access token: ...
```

## 性能调优

### 1. Token缓存优化

Token自动缓存，默认有效期2小时。不需要手动优化。

### 2. 连接池优化

HTTP客户端自动复用连接：

```javascript
// 默认情况下，同一账户的所有请求共享连接
// 无需额外配置
```

### 3. 并发处理

Webhook服务器可处理并发请求：

```yaml
# 如果遇到高并发，可增加Webhook端口数量（不同账户）
channels:
  jingme:
    accounts:
      account1:
        webhookPort: 3001
      account2:
        webhookPort: 3002
      account3:
        webhookPort: 3003
```

### 4. 内存管理

监控Token和客户端缓存：

```javascript
// 正常情况下，缓存大小：
// - Token缓存：每个账户 ~1KB
// - 客户端缓存：每个账户 ~100KB
```

## 安全最佳实践

### 1. 环境变量管理

```bash
# ✓ 好的做法
export JINGME_APP_KEY="..." 
export JINGME_APP_SECRET="..."

# ✗ 坏的做法
JINGME_APP_KEY="..." node app.js  # 会暴露在进程列表
```

### 2. Webhook验证

```yaml
channels:
  jingme:
    accounts:
      default:
        # ✓ 配置验证Token
        verificationToken: "your-secret-token"
        
        # ✗ 不配置验证（仅用于开发）
```

### 3. 访问控制

```yaml
# ✓ 限制群聊范围
groupPolicy: "allowlist"
groupAllowlist: ["oc_approved_group"]

# ✓ 限制单聊范围
dmPolicy: "allowlist"
dmAllowlist: ["admin1", "admin2"]
```

### 4. HTTPS部署

```javascript
// 在生产环境使用HTTPS
const https = require("https");
const fs = require("fs");

// 配置SSL证书（Webhook服务器内部）
```

## API限制

根据京me官方文档：

| 限制项             | 限制值   | 备注         |
| ------------------ | -------- | ------------ |
| 单条消息内容       | 2000字符 | 超出会被拦截 |
| 同个PIN/群消息频率 | 1秒5条   | 超出触发限流 |
| 全局请求频率       | 50 req/s | 平台级限制   |
| 30分钟请求量       | 10万     | 周期性限制   |
| Token有效期        | 2小时    | 自动刷新     |

优化建议：
```javascript
// 批量消息时添加延迟
const delay = (ms) => new Promise(r => setTimeout(r, ms));

for (const user of users) {
  await bot.send({...});
  await delay(200);  // 避免触发限流
}
```

## 常见问题

### Q: 如何在多个环境中使用不同的配置？
A: 使用不同的账户ID，或使用环境变量覆盖：
```bash
NODE_ENV=test JINGME_APP_KEY="test-key" npm start
```

### Q: 支持消息富文本吗？
A: 当前版本仅支持纯文本消息。富文本支持需要扩展。

### Q: 如何处理消息发送失败的重试？
A: 在应用层实现重试逻辑：
```javascript
async function sendWithRetry(msg, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await bot.send(msg);
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await delay(1000 * (i + 1));
    }
  }
}
```

### Q: 能否接收消息的附件？
A: 当前版本不支持附件。需要扩展`JingmeMessageEvent`和解析逻辑。

## 相关资源

- [京me开放平台](http://openme.jd.local)
- [API文档](http://openme.jd.local/docs)
- [Moltbot文档](../../../README.md)
- [Lark插件参考](../lark/README.md)

## License

MIT
