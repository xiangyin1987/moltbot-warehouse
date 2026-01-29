# JingMe (京me) Channel Plugin for Moltbot

A Moltbot channel plugin providing integration with JingMe (京me), JD.com's internal communication platform.

## Features

- **Message Sending**: Send text messages to users and groups
- **Webhook Integration**: Receive messages via webhook callbacks
- **Multi-Account Support**: Configure multiple JingMe accounts
- **Token Management**: Automatic access token handling with caching
- **Error Handling**: Comprehensive error handling and logging

## Installation

```bash
npm install @clawdbot/jingme
```

## Configuration

Configure the plugin in your Moltbot config file:

```yaml
channels:
  jingme:
    accounts:
      default:
        appKey: "your-app-key"
        appSecret: "your-app-secret"
        robotId: "your-robot-id"
        environment: "prod"          # prod or test
        webhookPort: 3001
        verificationToken: "optional-token"
        dmPolicy: "open"             # open or allowlist
        groupPolicy: "open"          # open, allowlist, or disabled
```

### Environment Variables

For the "default" account, you can also use environment variables:

```bash
JINGME_APP_KEY=your-app-key
JINGME_APP_SECRET=your-app-secret
JINGME_ROBOT_ID=your-robot-id
JINGME_VERIFICATION_TOKEN=optional-token
```

## Configuration Schema

| Property            | Type   | Required | Description                                                        |
| ------------------- | ------ | -------- | ------------------------------------------------------------------ |
| `appKey`            | string | Yes      | JingMe Application Key                                             |
| `appSecret`         | string | Yes      | JingMe Application Secret                                          |
| `robotId`           | string | Yes      | Robot ID for sending messages                                      |
| `environment`       | string | No       | API environment: `prod` (default) or `test`                        |
| `webhookPort`       | number | No       | Port for webhook server (default: 3001)                            |
| `verificationToken` | string | No       | Token for webhook verification                                     |
| `dmPolicy`          | string | No       | Direct message policy: `open` (default) or `allowlist`             |
| `dmAllowlist`       | array  | No       | Allowlist of user PINs for direct messages                         |
| `groupPolicy`       | string | No       | Group message policy: `open` (default), `allowlist`, or `disabled` |
| `groupAllowlist`    | array  | No       | Allowlist of group IDs                                             |
| `historyLimit`      | number | No       | Maximum historical messages to fetch (default: 10)                 |

## API Endpoints Used

- `POST /open-api/suite/v1/access/getAppAccessToken` - Get access token
- `POST /open-api/suite/v1/timline/sendRobotMsg` - Send message
- `POST /open-api/suite/v1/timline/getRobotGroup` - List robot groups

## Webhook Setup

1. In JingMe app settings, configure the webhook callback address:
   ```
   http://your-server:3001/webhook/jingme
   ```

2. Set the verification token in your Moltbot configuration

3. The plugin will automatically validate incoming webhook requests

## Message Format

### Sending Messages

Messages are sent using the JingMe Robot API:

```typescript
await bot.send({
  channel: "jingme",
  accountId: "default",
  recipient: "user-pin",    // Direct message
  text: "Hello, world!"
});

// Or to a group:
await bot.send({
  channel: "jingme",
  accountId: "default",
  recipient: "oc_group-id", // Group message (oc_ prefix)
  text: "Hello, group!"
});
```

### Receiving Messages

Messages are received via webhook callbacks and automatically routed to handlers.

## Error Handling

The plugin handles various error scenarios:

- **Invalid credentials**: Validation during configuration
- **Token expiration**: Automatic token refresh with caching
- **Webhook failures**: Graceful error responses
- **Network errors**: Proper error propagation

## Troubleshooting

### Token Generation Fails
- Verify appKey and appSecret are correct
- Ensure credentials match the configured environment (prod/test)

### Webhook Not Receiving Messages
- Verify webhook URL is correctly configured in JingMe app settings
- Check firewall/network settings for the webhook port
- Verify verification token matches if configured

### Messages Not Sending
- Confirm robotId is correct
- Verify robot is in the target group (for group messages)
- Check message content length (max 2000 characters)

## License

MIT
