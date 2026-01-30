# 京me 插件 - 快速开始

## 文件结构概览

```
extensions/jingme/
├── src/
│   ├── types.ts          # 类型定义
│   ├── runtime.ts        # 运行时上下文管理
│   ├── client.ts         # API 客户端和 Token 管理
│   ├── webhook.ts        # Webhook 服务器实现
│   ├── monitor.ts        # 消息监控协调器
│   └── channel.ts        # 插件核心 - ChannelPlugin 实现
├── index.ts              # 插件入口和导出
├── package.json          # 项目依赖
├── tsconfig.json         # TypeScript 配置
├── clawdbot.plugin.json  # 插件配置 Schema
├── README.md             # 用户指南
├── ARCHITECTURE.md       # 架构文档
├── INTEGRATION_GUIDE.md  # 集成指南
└── DEPLOYMENT.md         # 此文件 - 部署指南
```

## 开发流程

### 1. 本地开发

```bash
# 安装依赖
cd extensions/jingme
npm install

# 编译 TypeScript
npx tsc

# 运行测试（如果有）
npm test
```

### 2. 集成到 Moltbot

```bash
# 在 Moltbot 主项目中
npm install ./extensions/jingme

# 或在 monorepo 中自动识别
```

### 3. 配置

创建或修改 `moltbot.config.yaml`：

```yaml
channels:
  jingme:
    accounts:
      default:
        appKey: "your-app-key"
        appSecret: "your-app-secret"
        robotId: "your-robot-id"
        webhookPort: 3001
```

### 4. 启动

```bash
npm start
```

## 部署检查清单

### 前置条件

- [ ] Node.js 18+ 已安装
- [ ] npm/yarn 包管理器可用
- [ ] 网络连接正常
- [ ] 防火墙允许出站 HTTPS (port 443)
- [ ] 防火墙允许入站 Webhook (port 3001 或配置的端口)

### 应用配置

- [ ] 在京me开放平台创建应用
- [ ] 获取 appKey 和 appSecret
- [ ] 创建或配置机器人
- [ ] 获取 robotId
- [ ] 申请消息权限

### 插件安装

- [ ] `npm install @clawdbot/jingme` (或本地安装)
- [ ] 检查 `node_modules/@clawdbot/jingme` 存在
- [ ] 检查依赖 `axios` 已安装

### 配置验证

```bash
# 检查配置文件语法
npm run validate-config

# 测试 Token 获取
npm run test-token

# 测试 Webhook 端点
curl -X POST http://localhost:3001 \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Webhook 设置

- [ ] 在京me应用设置中配置 Webhook URL
- [ ] 设置验证 Token（推荐）
- [ ] 测试 Webhook 连接

### 日志监控

```bash
# 启用详细日志
LOG_LEVEL=debug npm start

# 检查关键日志
# [jingme] Webhook server listening on port 3001
# [jingme] Starting provider: account=default
# [jingme] Received message from xxx
```

### 功能测试

- [ ] 发送消息到用户
- [ ] 发送消息到群组
- [ ] 接收用户消息
- [ ] 接收群聊消息
- [ ] 列出可用群组

## 生产部署建议

### 环境变量

```bash
# 使用环境变量管理敏感信息
export JINGME_APP_KEY="xxx"
export JINGME_APP_SECRET="xxx"
export JINGME_ROBOT_ID="xxx"
export JINGME_VERIFICATION_TOKEN="xxx"
export LOG_LEVEL="info"
```

### Docker 部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制应用
COPY . .

# 编译 TypeScript（如果需要）
RUN npm run build

# 启动
CMD ["npm", "start"]
```

`docker-compose.yml`:
```yaml
version: '3.8'
services:
  moltbot:
    build: .
    ports:
      - "3001:3001"  # Webhook 端口
    environment:
      - JINGME_APP_KEY=${JINGME_APP_KEY}
      - JINGME_APP_SECRET=${JINGME_APP_SECRET}
      - JINGME_ROBOT_ID=${JINGME_ROBOT_ID}
      - JINGME_VERIFICATION_TOKEN=${JINGME_VERIFICATION_TOKEN}
      - LOG_LEVEL=info
    restart: unless-stopped
```

### PM2 进程管理

`ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'moltbot',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    listen_timeout: 3000,
    kill_timeout: 5000,
    min_uptime: '10s',
    max_restarts: 10
  }]
};
```

启动：
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 反向代理 (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Webhook 端点
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 监控和维护

### 健康检查

```bash
# 检查进程状态
ps aux | grep moltbot

# 检查端口监听
netstat -an | grep 3001

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

### 日志管理

```bash
# 实时查看日志
tail -f logs/app.log

# 搜索错误
grep ERROR logs/app.log

# 统计错误数量
grep ERROR logs/app.log | wc -l

# 按日期归档日志
gzip logs/app.log.2024-01-01
```

### 性能监控

使用 Node.js 性能工具：
```bash
# 内存快照
node --inspect app.js

# CPU 分析
node --prof app.js
node --prof-process isolate-*.log > profile.txt
```

### 告警配置

关键监控指标：
- Webhook 服务器运行状态
- Token 获取成功率
- 消息发送成功率
- 内存使用率 > 80%
- 错误日志出现

## 故障恢复

### 自动重启

使用 PM2 或 systemd 配置自动重启：

```bash
# systemd 服务文件
sudo cat > /etc/systemd/system/moltbot.service << EOF
[Unit]
Description=Moltbot Service
After=network.target

[Service]
Type=simple
User=moltbot
WorkingDirectory=/opt/moltbot
ExecStart=/usr/bin/node /opt/moltbot/dist/index.js
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable moltbot
sudo systemctl start moltbot
```

### 故障排查流程

1. **检查日志**
   ```bash
   journalctl -u moltbot -f
   ```

2. **验证配置**
   ```bash
   NODE_ENV=production node -c "require('./dist/index.js')"
   ```

3. **测试连接**
   ```bash
   curl -v http://localhost:3001
   ```

4. **重启服务**
   ```bash
   systemctl restart moltbot
   ```

5. **检查依赖**
   ```bash
   npm ls
   npm audit
   ```

## 备份和恢复

### 备份配置

```bash
# 备份配置文件
cp moltbot.config.yaml moltbot.config.yaml.backup

# 备份依赖列表
npm ls > dependencies.txt
npm ci
```

### 版本管理

```bash
# 标记版本
git tag -a v1.0.0 -m "Release version 1.0.0"

# 查看版本历史
git log --oneline
```

## 扩展和升级

### 更新依赖

```bash
# 检查更新
npm outdated

# 安装特定版本
npm install axios@latest

# 更新包
npm update
```

### 升级插件

```bash
# 从 GitHub 获取最新版本
npm install xiangyin1987/moltbot-warehouse#main

# 编译和测试
npm run build
npm test

# 重启服务
systemctl restart moltbot
```

## License

MIT

---

## 相关文档

- [README.md](./README.md) - 用户指南
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 架构设计
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - 详细集成指南
