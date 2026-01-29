# Moltbot 完整文档

## 📋 目录

1. [介绍](#介绍)
2. [快速开始](#快速开始)
3. [向导设置](#向导设置)
4. [频道配置](#频道配置)
5. [网关管理](#网关管理)
6. [控制面板](#控制面板)
7. [代理配置](#代理配置)
8. [技能系统](#技能系统)
9. [远程访问](#远程访问)
10. [故障排除](#故障排除)
11. [安全指南](#安全指南)
12. [开发指南](#开发指南)

---

## 🎯 介绍

### 什么是 Moltbot？

Moltbot 是一个跨平台的 AI 代理网关，支持 WhatsApp、Telegram、Discord、iMessage 等多个通讯平台。它为编程代理（如 Pi）提供了一个统一的网关，让用户可以通过熟悉的聊天应用与 AI 代理交互。

### 核心特性

- 📱 **多平台支持**：WhatsApp、Telegram、Discord、iMessage 等
- 🤖 **代理桥接**：支持 Pi 代理（RPC 模式）
- ⏱️ **流式处理**：支持块流式传输和草稿流式传输
- 🧠 **多代理路由**：将提供商账户/对等端路由到隔离的代理
- 🔐 **订阅认证**：支持 Anthropic（Claude Pro/Max）和 OpenAI（ChatGPT/Codex）
- 💬 **会话管理**：直接聊天合并到共享主会话；群聊是隔离的
- 👥 **群聊支持**：默认基于提及；所有者可以切换 `/activation always|mention`
- 📎 **媒体支持**：发送和接收图片、音频、文档
- 🎤 **语音笔记**：可选转录钩子
- 🖥️ **Web 界面**：本地 UI + macOS 菜单栏伴侣

### 架构概览

```
WhatsApp / Telegram / Discord / iMessage (+ plugins)
 │
 ▼
 ┌───────────────────────────┐
 │ Gateway │ ws://127.0.0.1:18789 (loopback-only)
 │ (single source) │
 │ │ http://<gateway-host>:18793
 │ │ /__moltbot__/canvas/ (Canvas host)
 └───────────┬───────────────┘
 │
 ├─ Pi agent (RPC)
 ├─ CLI (moltbot …)
 ├─ Chat UI (SwiftUI)
 ├─ macOS app (Moltbot.app)
 ├─ iOS node via Gateway WS + pairing
 └─ Android node via Gateway WS + pairing
```

---

## 🚀 快速开始

### 系统要求

- **运行时要求**：Node ≥ 22
- **推荐安装**：npm 或 pnpm
- **macOS**：如果计划构建应用，需要安装 Xcode / CLT
- **Windows**：使用 WSL2（推荐 Ubuntu）

### 推荐安装方式

```bash
# 推荐：全局安装 (npm/pnpm)
npm install -g moltbot@latest
# 或者: pnpm add -g moltbot@latest

# 引导安装并安装服务（launchd/systemd 用户服务）
moltbot onboard --install-daemon

# 配置 WhatsApp Web（显示二维码）
moltbot channels login

# 网关通过服务在引导后运行；手动运行仍可使用：
moltbot gateway --port 18789
```

### 从源码构建

```bash
git clone https://github.com/moltbot/moltbot.git
cd moltbot
pnpm install
pnpm ui:build # 首次运行自动安装 UI 依赖
pnpm build
moltbot onboard --install-daemon
```

### 多实例快速启动

```bash
CLAWDBOT_CONFIG_PATH=~/.clawdbot/a.json \
CLAWDBOT_STATE_DIR=~/.clawdbot-a \
moltbot gateway --port 19001
```

### 验证安装

```bash
# 检查状态
moltbot status

# 健康检查
moltbot health

# 安全审计
moltbot security audit --deep

# 发送测试消息
moltbot message send --target +15555550123 --message "Hello from Moltbot"
```

### 基础配置示例

```json
{
  "channels": {
    "whatsapp": {
      "allowFrom": ["+15555550123"],
      "groups": { "*": { "requireMention": true } }
    }
  },
  "messages": { 
    "groupChat": { 
      "mentionPatterns": ["@clawd"] 
    } 
  }
}
```

---

## 🔧 向导设置

### 运行引导向导

```bash
moltbot onboard
```

### 快速开始 vs 高级模式

- **快速开始**：保持默认设置
  - 本地网关（回环）
  - 默认工作区
  - 网关端口 18789
  - 网关认证令牌（自动生成，即使是回环）
  - Tailscale 暴露关闭
  - Telegram + WhatsApp DM 默认为允许列表

- **高级模式**：完全控制
  - 暴露每个步骤（模式、工作区、网关、频道、守护进程、技能）

### 本地模式流程详情

1. **模型/认证**
   - Anthropic API 密钥（推荐）
   - Anthropic OAuth（Claude Code CLI）
   - Anthropic 令牌（粘贴 setup-token）
   - OpenAI Code（Codex）订阅（OAuth）
   - OpenAI API 密钥
   - MiniMax/GLM/Moonshot/AI Gateway 选项

2. **工作区位置 + 引导文件**
3. **网关设置**（端口/绑定/认证/tailscale）
4. **提供商**（Telegram、WhatsApp、Discord、Google Chat、Mattermost）
5. **守护进程安装**（LaunchAgent/systemd 用户单元）
6. **健康检查**
7. **技能**（推荐）

### 远程模式详情

远程模式仅配置本地客户端连接到其他地方的网关。它不会在远程主机上安装或更改任何内容。

### 非交互式模式

```bash
moltbot onboard --non-interactive \
 --mode local \
 --auth-choice apiKey \
 --anthropic-api-key "$ANTHROPIC_API_KEY" \
 --gateway-port 18789 \
 --gateway-bind loopback \
 --install-daemon \
 --daemon-runtime node \
 --skip-skills
```

### 添加另一个代理

```bash
moltbot agents add <name>
```

### 信号设置（signal-cli）

向导可以从 GitHub 发布安装 signal-cli：
- 下载适当的发布资产
- 将其存储在 ~/.clawdbot/tools/signal-cli/<version>/ 下
- 将 channels.signal.cliPath 写入您的配置

---

## 📡 频道配置

### 支持的频道

| 频道 | 说明 | 状态 |
|------|------|------|
| **WhatsApp** | 最受欢迎；使用 Baileys 和 QR 配对 | ✅ |
| **Telegram** | 通过 grammY 的 Bot API；支持群组 | ✅ |
| **Discord** | Discord Bot API + Gateway；支持服务器、频道和 DM | ✅ |
| **Slack** | Bolt SDK；工作区应用 | ✅ |
| **Google Chat** | 通过 HTTP webhook 的 Google Chat API 应用 | ✅ |
| **Mattermost** | Bot API + WebSocket；频道、群组、DM（插件） | ✅ |
| **Signal** | signal-cli；注重隐私 | ✅ |
| **BlueBubbles** | 推荐 iMessage；使用 BlueBubbles macOS 服务器 REST API | ✅ |
| **iMessage** | 仅限 macOS；通过 imsg 的原生集成 | ✅ |
| **Microsoft Teams** | Bot Framework；企业支持（插件） | ✅ |
| **LINE** | LINE Messaging API bot（插件） | ✅ |
| **Nextcloud Talk** | 通过 Nextcloud Talk 的自托管聊天（插件） | ✅ |
| **Matrix** | Matrix 协议（插件） | ✅ |
| **Nostr** | 通过 NIP-04 的去中心化 DM（插件） | ✅ |
| **Tlon** | 基于 Urbit 的消息传递（插件） | ✅ |
| **Twitch** | 通过 IRC 连接的 Twitch 聊天（插件） | ✅ |
| **Zalo** | Zalo Bot API；越南的流行消息传递（插件） | ✅ |
| **Zalo Personal** | 通过 QR 登录的 Zalo 个人账户（插件） | ✅ |
| **WebChat** | 通过 WebSocket 的 Gateway WebChat UI | ✅ |

### WhatsApp 配置

```json
{
  "channels": {
    "whatsapp": {
      "dmPolicy": "pairing",          // pairing | allowlist | open | disabled
      "allowFrom": ["+15555550123"],   // 允许的 E.164 电话号码
      "textChunkLimit": 4000,         // 可选的出站块大小（字符）
      "chunkMode": "length",          // 可选的块化模式（length | newline）
      "mediaMaxMb": 50,               // 可选的入站媒体限制（MB）
      "sendReadReceipts": true,        // 是否标记入站消息为已读
      "accounts": {                    // 多账户支持
        "default": {},
        "personal": {},
        "biz": {}
      }
    }
  }
}
```

### Telegram 配置

```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "your-bot-token",
      "dmPolicy": "pairing",
      "allowFrom": ["tg:123456789"],
      "groups": {
        "*": {
          "requireMention": true
        },
        "-1001234567890": {
          "allowFrom": ["@admin"],
          "systemPrompt": "Keep answers brief.",
          "topics": {
            "99": {
              "requireMention": false,
              "skills": ["search"],
              "systemPrompt": "Stay on topic."
            }
          }
        }
      },
      "historyLimit": 50,
      "replyToMode": "first",
      "linkPreview": true,
      "streamMode": "partial",
      "draftChunk": {
        "minChars": 200,
        "maxChars": 800,
        "breakPreference": "paragraph"
      },
      "actions": {
        "reactions": true,
        "sendMessage": true
      }
    }
  }
}
```

### Discord 配置

```json
{
  "channels": {
    "discord": {
      "enabled": true,
      "token": "your-bot-token",
      "mediaMaxMb": 8,
      "allowBots": false,
      "actions": {
        "reactions": true,
        "stickers": true,
        "polls": true,
        "permissions": true,
        "messages": true,
        "threads": true,
        "pins": true,
        "search": true,
        "memberInfo": true,
        "roleInfo": true,
        "roles": false,
        "channelInfo": true,
        "voiceStatus": true,
        "events": true,
        "moderation": false
      },
      "replyToMode": "off",
      "dm": {
        "enabled": true,
        "policy": "pairing",
        "allowFrom": ["1234567890", "steipete"],
        "groupEnabled": false,
        "groupChannels": ["clawd-dm"]
      },
      "guilds": {
        "123456789012345678": {
          "slug": "friends-of-clawd",
          "requireMention": false,
          "reactionNotifications": "own",
          "users": ["987654321098765432"],
          "channels": {
            "general": { "allow": true },
            "help": {
              "allow": true,
              "requireMention": true,
              "users": ["987654321098765432"],
              "skills": ["docs"],
              "systemPrompt": "Short answers only."
            }
          }
        }
      },
      "historyLimit": 20,
      "textChunkLimit": 2000,
      "chunkMode": "length",
      "maxLinesPerMessage": 17,
      "retry": {
        "attempts": 3,
        "minDelayMs": 500,
        "maxDelayMs": 30000,
        "jitter": 0.1
      }
    }
  }
}
```

### Slack 配置

```json
{
  "channels": {
    "slack": {
      "enabled": true,
      "botToken": "xoxb-...",
      "appToken": "xapp-...",
      "dm": {
        "enabled": true,
        "policy": "pairing",
        "allowFrom": ["U123", "U456", "*"],
        "groupEnabled": false,
        "groupChannels": ["G123"]
      },
      "channels": {
        "C123": { "allow": true, "requireMention": true, "allowBots": false },
        "#general": {
          "allow": true,
          "requireMention": true,
          "allowBots": false,
          "users": ["U123"],
          "skills": ["docs"],
          "systemPrompt": "Short answers only."
        }
      },
      "historyLimit": 50,
      "allowBots": false,
      "reactionNotifications": "own",
      "reactionAllowlist": ["U123"],
      "replyToMode": "off",
      "thread": {
        "historyScope": "thread",
        "inheritParent": false
      },
      "actions": {
        "reactions": true,
        "messages": true,
        "pins": true,
        "memberInfo": true,
        "emojiList": true
      },
      "slashCommand": {
        "enabled": true,
        "name": "clawd",
        "sessionPrefix": "slack:slash",
        "ephemeral": true
      }
    }
  }
}
```

### Google Chat 配置

```json
{
  "channels": {
    "googlechat": {
      "enabled": true,
      "serviceAccountFile": "/path/to/service-account.json",
      "audienceType": "app-url",
      "audience": "https://gateway.example.com/googlechat",
      "webhookPath": "/googlechat",
      "botUser": "users/1234567890",
      "dm": {
        "enabled": true,
        "policy": "pairing",
        "allowFrom": ["users/1234567890"]
      },
      "groupPolicy": "allowlist",
      "groups": {
        "spaces/AAAA": { "allow": true, "requireMention": true }
      },
      "actions": { "reactions": true },
      "typingIndicator": "message",
      "mediaMaxMb": 20
    }
  }
}
```

### 多账户支持

```json
{
  "channels": {
    "whatsapp": {
      "accounts": {
        "default": {},      // 可选；保持默认 ID 稳定
        "personal": {},
        "biz": {
          // 可选覆盖。默认：~/.clawdbot/credentials/whatsapp/biz
          // "authDir": "~/.clawdbot/credentials/whatsapp/biz"
        }
      }
    }
  }
}
```

---

## 🌐 网关管理

### 网关服务运行手册

网关是拥有单个 Baileys/Telegram 连接和控制/事件平面的常驻进程。

### 运行方式（本地）

```bash
# 基本运行
moltbot gateway --port 18789

# 完整调试/跟踪日志到 stdio：
moltbot gateway --port 18789 --verbose

# 如果端口繁忙，终止监听器然后启动：
moltbot gateway --force

# 开发循环（TS 变化时自动重新加载）：
pnpm gateway:watch
```

### 配置热重载

默认模式：`gateway.reload.mode="hybrid"`（热应用安全更改，关键时重启）
热重载在需要时使用通过 SIGUSR1 的进程内重启
禁用：`gateway.reload.mode="off"`

### 绑定和端口

- 将 WebSocket 控制平面绑定到 `127.0.0.1:<port>`（默认 18789）
- 相同的端口也提供 HTTP（控制 UI、钩子、A2UI）
- Canvas 文件服务器默认在 `canvasHost.port`（默认 18793）上运行

### 多个网关（同一主机）

通常不需要：一个网关可以为多个消息传递频道和代理服务。仅用于冗余或严格隔离时才使用多个网关。

如果隔离状态 + 配置并使用唯一端口，则受支持。

### 配置参考

```json
{
  "gateway": {
    "port": 18789,
    "bind": "loopback",
    "auth": {
      "token": "your-secret-token",
      "allowTailscale": true
    },
    "controlUi": {
      "basePath": "/",
      "enabled": true
    },
    "canvasHost": {
      "enabled": true,
      "port": 18793,
      "basePath": "/__moltbot__/canvas/"
    },
    "reload": {
      "mode": "hybrid",
      "watch": true,
      "watchDebounceMs": 250
    },
    "logging": {
      "level": "info",
      "file": "/tmp/moltbot/moltbot.log",
      "consoleLevel": "info",
      "consoleStyle": "pretty"
    }
  }
}
```

### 服务管理

```bash
# 检查状态
moltbot gateway status

# 安装服务
moltbot gateway install

# 停止服务
moltbot gateway stop

# 重启服务
moltbot gateway restart

# 查看日志
moltbot logs --follow

# 卸载服务
moltbot gateway uninstall
```

### 协议（操作员视图）

完整的协议文档请参考：[网关协议](https://docs.molt.bot/gateway/protocol) 和 [桥接协议](https://docs.molt.bot/gateway/bridge)。

### 健康检查

- **存活性**：打开 WS 并发送 `req:connect` → 期望带有 `payload.type="hello-ok"` 的响应
- **就绪性**：调用 `health` → 期望 `ok: true` 和链接的频道
- **调试**：订阅 `tick` 和 `presence` 事件

---

## 🎛️ 控制面板

### 控制面板概述

网关控制面板是浏览器控制 UI，默认在 `/` 上提供服务（可通过 `gateway.controlUi.basePath` 覆盖）。

### 快速打开（本地网关）

```bash
# 本地网关：
http://127.0.0.1:18789/ （或 http://localhost:18789/）
```

### 认证机制

通过 `connect.params.auth`（令牌或密码）在 WebSocket 握手处强制执行认证。

### 安全注意事项

控制面板是管理界面（聊天、配置、执行批准）。不要公开暴露它。
UI 在首次加载后将令牌存储在 localStorage 中。
优先使用 localhost、Tailscale Serve 或 SSH 隧道。

### 快速路径（推荐）

引导后，CLI 现在会自动打开带有您的令牌的控制面板并打印相同的令牌化链接。

随时重新打开：`moltbot dashboard`

### 令牌基础（本地 vs 远程）

- **Localhost**：打开 `http://127.0.0.1:18789/`。如果看到"unauthorized"，运行 `moltbot dashboard` 并使用令牌化链接（`?token=...`）
- **Token 源**：`gateway.auth.token`（或 `CLAWDBOT_GATEWAY_TOKEN`）；UI 在首次加载后存储它
- **Not localhost**：使用 Tailscale Serve（如果 `gateway.auth.allowTailscale: true` 则无令牌）、tailnet 绑定和令牌，或 SSH 隧道

### 远程访问

- **SSH 隧道**：`ssh -N -L 18789:127.0.0.1:18789 user@host`
- **Tailscale Serve**：自动化 tailnet 连接

### 控制面板功能

- **聊天界面**：直接与代理交互
- **配置管理**：实时查看和修改配置
- **节点管理**：管理连接的节点
- **会话监控**：查看活动会话
- **系统状态**：监控网关健康状况
- **日志查看**：实时查看系统日志

---

## 🤖 代理配置

### 多代理路由

运行多个隔离的代理（独立的工作区、agentDir、会话）在一个网关内。
入站消息通过绑定路由到代理。

### 代理列表配置

```json
{
  "agents": {
    "defaults": {
      "workspace": "~/clawd",
      "model": {
        "primary": "anthropic/claude-opus-4-5",
        "fallbacks": ["openai/gpt-5.2"]
      },
      "sandbox": {
        "mode": "non-main",
        "scope": "session"
      },
      "subagents": {
        "maxConcurrent": 8
      }
    },
    "list": [
      {
        "id": "main",
        "name": "Personal Assistant",
        "default": true,
        "identity": {
          "name": "Samantha",
          "theme": "helpful sloth",
          "emoji": "🦥",
          "avatar": "avatars/samantha.png"
        },
        "groupChat": {
          "mentionPatterns": ["@clawd", "reisponde"]
        }
      },
      {
        "id": "work",
        "workspace": "~/clawd-work",
        "model": {
          "primary": "openai/gpt-5.2"
        }
      }
    ]
  }
}
```

### 绑定配置

```json
{
  "bindings": [
    {
      "agentId": "main",
      "match": {
        "channel": "whatsapp",
        "peer": {
          "kind": "dm",
          "id": "+15555550123"
        }
      }
    },
    {
      "agentId": "work",
      "match": {
        "channel": "whatsapp",
        "accountId": "biz"
      }
    }
  ]
}
```

### 沙盒配置

```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",
        "scope": "session",
        "workspaceAccess": "rw",
        "docker": {
          "image": "node:22-alpine",
          "network": "bridge",
          "env": {
            "NODE_ENV": "production"
          },
          "setupCommand": "npm install -g uv && uv pip install --system -r requirements.txt",
          "limits": {
            "memory": "512m",
            "cpu": "1.0"
          }
        },
        "browser": {
          "headless": true,
          "args": [
            "--no-sandbox",
            "--disable-setuid-sandbox"
          ]
        },
        "prune": {
          "intervalMs": 3600000,
          "maxAgeMs": 86400000
        }
      }
    }
  }
}
```

### 工具限制

```json
{
  "agents": {
    "list": [
      {
        "id": "personal",
        "tools": {
          "allow": ["read", "write", "edit", "exec", "process", "browser"],
          "deny": []
        }
      },
      {
        "id": "family",
        "tools": {
          "allow": ["read", "sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status"],
          "deny": ["write", "edit", "apply_patch", "exec", "process", "browser"]
        }
      },
      {
        "id": "public",
        "tools": {
          "allow": ["sessions_list", "sessions_history", "sessions_send", "sessions_spawn", "session_status", "whatsapp", "telegram", "slack", "discord"],
          "deny": ["read", "write", "edit", "apply_patch", "exec", "process", "browser", "canvas", "nodes", "cron", "gateway", "image"]
        }
      }
    ]
  }
}
```

---

## 🎯 技能系统

### 技能概述

Moltbot 使用 AgentSkills 兼容的技能文件夹来教授代理如何使用工具。每个技能都是一个包含带有 YAML frontmatter 和指令的 SKILL.md 的目录。

### 技能位置和优先级

技能从三个位置加载：
1. **捆绑技能**：随安装一起提供（npm 包或 Moltbot.app）
2. **托管/本地技能**：`~/.clawdbot/skills`
3. **工作区技能**：`<workspace>/skills`

优先级：`<workspace>/skills` → `~/.clawdbot/skills` → **捆绑技能**

### 多代理设置中的技能

在多代理设置中，每个代理都有自己的工作区：
- 每个代理的技能只存在于该代理的 `<workspace>/skills` 中
- 共享技能存在于 `~/.clawdbot/skills` 中，对同一机器上的所有代理都可见

### 技能格式

```markdown
---
name: nano-banana-pro
description: Generate or edit images via Gemini 3 Pro Image
metadata: {
  "moltbot": {
    "requires": {
      "bins": ["uv"],
      "env": ["GEMINI_API_KEY"],
      "config": ["browser.enabled"]
    },
    "primaryEnv": "GEMINI_API_KEY"
  }
}
---
```

### 配置覆盖

```json
{
  "skills": {
    "load": {
      "extraDirs": [
        "/path/to/shared/skills",
        "/path/to/custom/skills"
      ]
    },
    "entries": {
      "nano-banana-pro": {
        "enabled": true,
        "apiKey": "GEMINI_KEY_HERE",
        "env": {
          "GEMINI_API_KEY": "GEMINI_KEY_HERE"
        },
        "config": {
          "endpoint": "https://example.invalid",
          "model": "nano-pro"
        }
      },
      "peekaboo": { "enabled": true },
      "sag": { "enabled": false }
    },
    "allowBundled": ["nano-banana-pro", "peekaboo"]
  }
}
```

### 安装示例

```bash
# 安装技能到工作区
clawdhub install <skill-slug>

# 更新所有已安装的技能
clawdhub update --all

# 同步（扫描 + 发布更新）
clawdhub sync --all

# 列出所有可用的技能
clawdhub list

# 搜索技能
clawdhub search <keyword>
```

### 常用技能

| 技能名称 | 描述 | 用途 |
|----------|------|------|
| **summarize** | 文档和对话摘要 | 快速理解长内容 |
| **search** | 网络搜索 | 实时信息获取 |
| **code** | 代码生成和编辑 | 编程助手 |
| **image** | 图像生成 | 创意设计 |
| **read** | 文件读取 | 文档分析 |
| **write** | 文件写入 | 内容创作 |
| **exec** | 命令执行 | 系统操作 |

### 技能元数据

```json
{
  "metadata": {
    "moltbot": {
      "emoji": "🎨",
      "homepage": "https://example.com/skill",
      "os": ["darwin", "linux"],
      "always": true,
      "install": [
        {
          "id": "brew",
          "kind": "brew",
          "formula": "imagemagick",
          "bins": ["convert"],
          "label": "Install ImageMagick"
        }
      ]
    }
  }
}
```

---

## 🌐 远程访问

### 远程访问方式

1. **SSH 隧道**（推荐）
2. **Tailscale Serve**
3. **反向代理**
4. **VPN**

### SSH 隧道配置

```bash
# 基本隧道
ssh -N -L 18789:127.0.0.1:18789 user@remote-host

# 带端口转发的完整隧道
ssh -N -R 18789:localhost:18789 user@remote-host
```

### Tailscale 配置

```json
{
  "gateway": {
    "tailscale": {
      "mode": "serve",
      "serveConfig": {
        "hostname": "moltbot-gateway",
        "web": {
          "enabled": true,
          "path": "/",
          "auth": "token"
        }
      },
      "resetOnExit": false
    }
  }
}
```

### 远程访问配置

```json
{
  "gateway": {
    "bind": "tailnet",
    "auth": {
      "token": "your-secret-token",
      "allowTailscale": true
    },
    "controlUi": {
      "basePath": "/",
      "enabled": true
    }
  }
}
```

### Web 界面远程访问

```bash
# 本地开发（端口转发）
ssh -N -L 18789:127.0.0.1:18789 user@remote-server

# 然后访问 http://localhost:18789/?token=your-token

# 或使用 Tailscale
tailscale serve 18789 --hostname=moltbot-gateway
```

### 安全配置

```json
{
  "gateway": {
    "auth": {
      "token": "your-very-long-secret-token",
      "password": null,
      "allowTailscale": true,
      "tokenRotation": {
        "enabled": true,
        "intervalMs": 86400000
      }
    },
    "tls": {
      "enabled": true,
      "certFile": "/path/to/cert.pem",
      "keyFile": "/path/to/key.pem"
    }
  }
}
```

---

## 🔧 故障排除

### 常见问题

#### 1. 网关启动失败

```bash
# 检查端口占用
lsof -i :18789

# 强制重启
moltbot gateway --force

# 检查配置
moltbot doctor

# 查看详细日志
moltbot gateway --port 18789 --verbose
```

#### 2. WhatsApp 连接问题

```bash
# 检查 WhatsApp 状态
moltbot channels status whatsapp

# 重新配对
moltbot channels login whatsapp

# 清除缓存
rm -rf ~/.clawdbot/credentials/whatsapp/*/sessions
```

#### 3. Telegram 配置错误

```bash
# 验证 bot token
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/getMe"

# 检查权限
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/getChatAdministrators?chat_id=@yourusername"
```

#### 4. Discord 连接问题

```bash
# 邀请 bot 到服务器
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands

# 检查权限
curl -X GET "https://discord.com/api/v9/users/@me/guilds" -H "Authorization: Bot YOUR_BOT_TOKEN"
```

### 调试命令

```bash
# 完整状态检查
moltbot status --all

# 健康检查
moltbot health --json

# 日志分析
moltbot logs --grep "error" --tail 50

# 网关连接测试
moltbot gateway call health --params '{}'

# 会话诊断
moltbot sessions list --agent main --format json
```

### 日志文件位置

- **Linux/macOS**: `/tmp/moltbot/moltbot-YYYY-MM-DD.log`
- **Windows**: `%TEMP%\moltbot\moltbot-YYYY-MM-DD.log`
- **配置文件**: `~/.clawdbot/moltbot.json`

### 性能调优

```json
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "anthropic/claude-sonnet-4-5",
        "fallbacks": ["openai/gpt-5-mini"]
      },
      "maxConcurrent": 4,
      "subagents": {
        "maxConcurrent": 8
      }
    }
  },
  "messages": {
    "queue": {
      "mode": "steer",
      "debounceMs": 1000,
      "cap": 20
    },
    "inbound": {
      "debounceMs": 2000
    }
  },
  "gateway": {
    "reload": {
      "watch": true,
      "watchDebounceMs": 250
    }
  }
}
```

### 内存管理

```json
{
  "agents": {
    "defaults": {
      "compaction": {
        "mode": "safeguard",
        "maxMessages": 1000,
        "maxChars": 50000
      }
    }
  },
  "messages": {
    "queue": {
      "cap": 20,
      "drop": "summarize"
    }
  }
}
```

---

## 🔒 安全指南

### 基本安全原则

1. **令牌管理**：使用强随机令牌，定期轮换
2. **网络访问**：限制网关的访问范围
3. **认证**：为所有通道启用适当的认证
4. **沙盒**：在不受信任的环境中运行沙盒化代理

### 网关安全配置

```json
{
  "gateway": {
    "auth": {
      "token": "very-long-random-token",
      "password": null,
      "allowTailscale": true,
      "tokenRotation": {
        "enabled": true,
        "intervalMs": 86400000
      }
    },
    "bind": "loopback",
    "tls": {
      "enabled": true,
      "certFile": "/etc/letsencrypt/live/your-domain/fullchain.pem",
      "keyFile": "/etc/letsencrypt/live/your-domain/privkey.pem"
    },
    "controlUi": {
      "basePath": "/",
      "auth": {
        "enabled": true,
        "method": "token"
      }
    }
  }
}
```

### 频道安全配置

```json
{
  "channels": {
    "whatsapp": {
      "dmPolicy": "pairing",
      "allowFrom": ["+15555550123"],
      "sendReadReceipts": false,
      "accounts": {
        "personal": {
          "enabled": true,
          "authDir": "~/.clawdbot/credentials/whatsapp/personal"
        },
        "business": {
          "enabled": true,
          "authDir": "~/.clawdbot/credentials/whatsapp/business"
        }
      }
    },
    "telegram": {
      "dmPolicy": "allowlist",
      "allowFrom": ["tg:123456789", "@admin"],
      "groups": {
        "*": {
          "requireMention": true,
          "allowFrom": ["@admin"]
        }
      }
    },
    "discord": {
      "dmPolicy": "pairing",
      "allowBots": false,
      "actions": {
        "reactions": true,
        "sendMessage": true,
        "permissions": true,
        "moderation": false
      }
    }
  }
}
```

### 代理安全配置

```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",
        "scope": "session",
        "workspaceAccess": "ro",
        "docker": {
          "image": "node:22-alpine",
          "network": "none",
          "env": {},
          "readOnlyRootfs": true,
          "securityOpt": ["no-new-privileges"]
        }
      },
      "tools": {
        "allow": ["read", "write", "sessions_list", "sessions_send"],
        "deny": ["exec", "process", "browser", "elevated"]
      }
    },
    "list": [
      {
        "id": "main",
        "workspace": "~/clawd",
        "sandbox": {
          "mode": "off"
        },
        "tools": {
          "allow": ["*"],
          "deny": []
        }
      },
      {
        "id": "guest",
        "workspace": "~/clawd-guest",
        "sandbox": {
          "mode": "all",
          "scope": "session",
          "workspaceAccess": "none"
        },
        "tools": {
          "allow": ["sessions_list", "sessions_history", "sessions_send"],
          "deny": ["*"]
        }
      }
    ]
  }
}
```

### 环境变量安全

```bash
# 敏感环境变量
export ANTHROPIC_API_KEY="your-api-key"
export OPENAI_API_KEY="your-api-key"
export GEMINI_API_KEY="your-api-key"

# 网关配置
export CLAWDBOT_GATEWAY_TOKEN="your-long-secret-token"
export CLAWDBOT_GATEWAY_PORT=18789

# 日志配置
export CLAWDBOT_LOGGING_LEVEL=info
export CLAWDBOT_LOGGING_FILE="/var/log/moltbot.log"
```

### 安全审计

```bash
# 深度安全审计
moltbot security audit --deep

# 配置验证
moltbot doctor --security

# 权限检查
moltbot permissions check

# 网络扫描
nmap -p 18789,18793 localhost

# 日志分析
moltbot logs --security --tail 1000
```

### 最佳实践

1. **令牌管理**：
   - 使用强随机令牌（至少 32 字符）
   - 定期轮换令牌（每 24 小时）
   - 不要在代码或配置中硬编码令牌

2. **网络访问**：
   - 限制网关绑定到回环地址
   - 使用 SSH 隧道或 VPN 进行远程访问
   - 不要将网关暴露到公共互联网

3. **认证**：
   - 为所有通道启用适当的认证
   - 使用允许列表限制访问
   - 启用配对流程进行 DM 访问

4. **沙盒**：
   - 在不受信任的环境中运行沙盒化代理
   - 限制工具访问权限
   - 使用容器隔离

---

## 💻 开发指南

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/moltbot/moltbot.git
cd moltbot

# 安装依赖
pnpm install

# 构建 UI 资源
pnpm ui:build

# 编译 TypeScript
pnpm build

# 运行开发模式
pnpm gateway:watch
```

### 插件开发

```typescript
// 插件入口文件
const plugin = {
  id: 'my-plugin',
  name: 'My Plugin',
  description: 'A custom plugin for Moltbot',
  configSchema: {
    type: 'object',
    properties: {
      setting1: {
        type: 'string',
        description: 'First plugin setting'
      }
    }
  },
  register(api: MoltbotPluginApi) {
    // 插件初始化逻辑
  }
};

export default plugin;
```

### 自定义技能

```markdown
---
name: my-custom-tool
description: A custom tool for Moltbot
metadata: {
  "moltbot": {
    "requires": {
      "bins": ["my-custom-cli"],
      "env": ["MY_API_KEY"]
    }
  }
}
---

# Custom Tool Usage

This tool provides custom functionality for Moltbot agents.

## Usage

1. Install the required dependencies
2. Configure your API key
3. Use the tool in your agent conversations

## Examples

\`\`\`
/my-custom-tool --option1 value1 --option2 value2
\`\`\`
```

### API 开发

```typescript
// 创建自定义工具
import { Tool, ToolContext } from '@moltbot/tool';

export class CustomTool extends Tool {
  async invoke(ctx: ToolContext, params: any): Promise<any> {
    // 实现工具逻辑
    return { result: 'success' };
  }

  get schema() {
    return {
      type: 'object',
      properties: {
        input: {
          type: 'string',
          description: 'Input parameter'
        }
      }
    };
  }
}
```

### 测试

```bash
# 运行测试套件
pnpm test

# 运行特定测试
pnpm test --grep "gateway"

# 测试覆盖率
pnpm test:coverage

# E2E 测试
pnpm test:e2e
```

### 贡献指南

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

### 代码风格

```typescript
// 使用 TypeScript 和 ESLint
// 遵循项目现有的代码风格
// 添加适当的类型注解
// 编写单元测试
```

---

## 📚 总结

Moltbot 是一个功能强大的跨平台 AI 代理网关，支持多个消息传递平台。通过本文档，您应该能够：

- 🚀 快速开始使用 Moltbot
- 🔧 配置各种频道和设置
- 🌐 管理网关和服务
- 🎯 配置多代理环境
- 🎨 使用和管理技能
- 🌐 设置远程访问
- 🔧 解决常见问题
- 🔒 实施安全最佳实践
- 💻 进行开发定制

如需更多帮助，请访问：
- 官方文档：https://docs.molt.bot
- GitHub 仓库：https://github.com/moltbot/moltbot
- 社区支持：GitHub Discussions 和 Issues

---

*最后更新：2026 年 1 月 29 日*
*版本：Moltbot 完整文档 v1.0*