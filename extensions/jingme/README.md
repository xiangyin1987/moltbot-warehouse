# JingMe（京me）Moltbot 渠道插件

为 Moltbot 提供与京东内部沟通平台 JingMe（京me）的集成能力。

## 功能特性

- 文本消息发送：支持单聊与群聊
- Webhook 集成：支持通过回调接收消息
- 多账号：可配置多套 JingMe 账号
- Token 管理：自动获取与缓存访问令牌
- 错误处理：完善的日志与异常处理

## 安装

```bash
npm install @clawdbot/jingme
```

## 配置

在 Moltbot 配置文件中添加：

```yaml
channels:
  jingme:
    accounts:
      default:
        appKey: "your-app-key"
        appSecret: "your-app-secret"
        robotId: "your-robot-id"
        openTeamId: "your-open-team-id"    # 必填：团队 Open ID
        environment: "prod"                # prod 或 test
        webhookPort: 3001
        verificationToken: "optional-token"
        dmPolicy: "open"                   # open 或 allowlist
        groupPolicy: "open"                # open、allowlist 或 disabled
```

### 环境变量

对于 `default` 账号，也可通过环境变量配置：

```bash
JINGME_APP_KEY=your-app-key
JINGME_APP_SECRET=your-app-secret
JINGME_ROBOT_ID=your-robot-id
JINGME_OPEN_TEAM_ID=your-open-team-id
JINGME_VERIFICATION_TOKEN=optional-token
```

## 配置说明

| 字段                | 类型   | 必填 | 说明                                              |
| ------------------- | ------ | ---- | ------------------------------------------------- |
| `appKey`            | string | 是   | 应用 App Key                                      |
| `appSecret`         | string | 是   | 应用 App Secret                                   |
| `robotId`           | string | 是   | 机器人 ID（发送消息使用）                         |
| `openTeamId`        | string | 是   | 用于调用协同产品API需要用的参数                   |
| `environment`       | string | 否   | 环境：`prod`（默认）或 `test`                     |
| `webhookPort`       | number | 否   | Webhook 端口（默认：3001）                        |
| `verificationToken` | string | 否   | Webhook 验证 Token                                |
| `dmPolicy`          | string | 否   | 单聊策略：`open`（默认）或 `allowlist`            |
| `dmAllowlist`       | array  | 否   | 单聊允许列表（用户 PIN）                          |
| `groupPolicy`       | string | 否   | 群聊策略：`open`（默认）、`allowlist`、`disabled` |
| `groupAllowlist`    | array  | 否   | 群聊允许列表（群 ID）                             |
| `historyLimit`      | number | 否   | 历史消息数量上限（默认：10）                      |

## 使用的 API

- `POST /open-api/suite/v1/access/getAppAccessToken` 获取 app 级 token
- `POST /open-api/suite/v1/timline/sendRobotMsg` 发送消息
- `POST /open-api/suite/v1/timline/getRobotGroup` 查询机器人所在群
- `POST /open-api/auth/v1/team_access_token` 获取团队级 token（需 `openTeamId`）

## Webhook 配置

1. 在 JingMe 应用配置中设置回调地址：
   ```
   http://your-server:3001
   ```
2. 在 Moltbot 配置中设置 `verificationToken`（如启用）
3. 插件会自动校验并处理回调请求

## 消息格式

### 发送消息

```typescript
await bot.send({
  channel: "jingme",
  accountId: "default",
  recipient: "user-pin",    // 单聊
  text: "Hello, world!"
});

// 群聊：
await bot.send({
  channel: "jingme",
  accountId: "default",
  recipient: "oc_group-id", // 群聊（oc_ 前缀）
  text: "Hello, group!"
});
```

### 接收消息

消息通过 Webhook 回调到服务并自动路由到处理逻辑。

## 错误处理

- 认证异常：配置阶段校验并给出提示
- Token 过期：自动刷新并缓存
- Webhook 异常：优雅返回错误响应
- 网络错误：向上抛出，便于定位问题

## 常见问题

### 无法生成 Token
- 检查 `appKey` 与 `appSecret`
- 确认环境匹配（prod/test）
- 确保 `openTeamId` 已正确配置

### Webhook 收不到消息
- 检查回调地址是否正确
- 检查端口与网络访问策略
- 核对 `verificationToken`（如启用）

### 无法发送消息
- 检查 `robotId` 是否正确
- 确认机器人已在目标群（群聊）
- 检查文本长度：单条限制 2000 字，超过会自动分段（每段 1800 字）