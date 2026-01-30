# 京me 插件 - 示例配置

## 基础配置

```yaml
# moltbot.config.yaml

# 京me 通道配置
channels:
  jingme:
    accounts:
      # 默认账户 - 从环境变量或配置获取凭证
      default:
        enabled: true
        
        # 京me 应用凭证 (必填)
        appKey: "${JINGME_APP_KEY}"  # 或直接填写: "app-key-12345"
        appSecret: "${JINGME_APP_SECRET}"  # 或直接填写: "app-secret-67890"
        robotId: "${JINGME_ROBOT_ID}"  # 或直接填写: "robot-001"
        
        # API 配置
        environment: "prod"  # 正式环境: prod, 测试环境: test
        
        # Webhook 配置
        webhookPort: 3001  # Webhook 服务器监听端口
        verificationToken: "${JINGME_VERIFICATION_TOKEN}"  # Webhook 验证 Token
        
        # 访问控制
        dmPolicy: "open"  # 单聊策略: open (允许所有) 或 allowlist (白名单)
        dmAllowlist: []  # 单聊白名单
        
        groupPolicy: "open"  # 群聊策略: open, allowlist, 或 disabled
        groupAllowlist: []  # 群聊白名单
        
        # 其他设置
        historyLimit: 10  # 历史消息限制

logging:
  level: "info"
  format: "json"
```

## 多账户配置

```yaml
channels:
  jingme:
    accounts:
      # 生产环境账户
      prod:
        enabled: true
        appKey: "prod-app-key-xxx"
        appSecret: "prod-app-secret-xxx"
        robotId: "prod-robot-001"
        environment: "prod"
        webhookPort: 3001
        verificationToken: "prod-webhook-token"
        dmPolicy: "open"
        groupPolicy: "open"
      
      # 测试环境账户
      test:
        enabled: true
        appKey: "test-app-key-xxx"
        appSecret: "test-app-secret-xxx"
        robotId: "test-robot-001"
        environment: "test"
        webhookPort: 3002
        verificationToken: "test-webhook-token"
        dmPolicy: "allowlist"
        dmAllowlist:
          - "admin1"
          - "admin2"
        groupPolicy: "allowlist"
        groupAllowlist:
          - "oc_dev_group_1"
          - "oc_dev_group_2"
      
      # 内部用途账户
      internal:
        enabled: true
        appKey: "internal-app-key-xxx"
        appSecret: "internal-app-secret-xxx"
        robotId: "internal-robot-001"
        environment: "prod"
        webhookPort: 3003
        dmPolicy: "allowlist"
        dmAllowlist:
          - "manager1"
          - "manager2"
          - "manager3"
        groupPolicy: "allowlist"
        groupAllowlist:
          - "oc_management"
          - "oc_ops_team"
```

## 环境变量配置

创建 `.env` 文件：

```bash
# 必填配置
JINGME_APP_KEY=your-app-key-here
JINGME_APP_SECRET=your-app-secret-here
JINGME_ROBOT_ID=your-robot-id-here

# 可选配置
JINGME_VERIFICATION_TOKEN=your-webhook-token
JINGME_ENVIRONMENT=prod

# Moltbot 通用配置
NODE_ENV=production
LOG_LEVEL=info
```

使用：
```bash
# 加载 .env 文件
source .env
npm start

# 或直接传入
JINGME_APP_KEY=xxx JINGME_APP_SECRET=xxx npm start
```

## Docker 配置

`Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 编译 TypeScript（如果需要）
RUN npm run build || true

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {if (r.statusCode !== 404) throw new Error(r.statusCode)})"

# 启动应用
CMD ["npm", "start"]
```

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  moltbot:
    build: .
    container_name: moltbot
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
      - JINGME_APP_KEY=${JINGME_APP_KEY}
      - JINGME_APP_SECRET=${JINGME_APP_SECRET}
      - JINGME_ROBOT_ID=${JINGME_ROBOT_ID}
      - JINGME_VERIFICATION_TOKEN=${JINGME_VERIFICATION_TOKEN}
    volumes:
      - ./logs:/app/logs
      - ./config:/app/config
    restart: unless-stopped
    networks:
      - moltbot-net

networks:
  moltbot-net:
    driver: bridge
```

启动：
```bash
# 创建 .env.docker 文件
cat > .env.docker << EOF
JINGME_APP_KEY=your-key
JINGME_APP_SECRET=your-secret
JINGME_ROBOT_ID=your-robot-id
JINGME_VERIFICATION_TOKEN=your-token
EOF

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f moltbot

# 停止服务
docker-compose down
```

## PM2 配置

`ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'moltbot-jingme',
      script: './dist/index.js',
      
      // 集群模式
      instances: 1,
      exec_mode: 'cluster',
      
      // 环境变量
      env: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info',
        JINGME_APP_KEY: process.env.JINGME_APP_KEY,
        JINGME_APP_SECRET: process.env.JINGME_APP_SECRET,
        JINGME_ROBOT_ID: process.env.JINGME_ROBOT_ID,
        JINGME_VERIFICATION_TOKEN: process.env.JINGME_VERIFICATION_TOKEN,
      },
      
      // 日志配置
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      
      // 重启策略
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      listen_timeout: 3000,
      kill_timeout: 5000,
      min_uptime: '10s',
      max_restarts: 10,
      
      // 监听模式
      ignore_watch: ['node_modules', 'logs', '.git'],
    }
  ]
};
```

启动：
```bash
# 启动应用
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs moltbot-jingme

# 保存配置
pm2 save
pm2 startup

# 重启
pm2 restart moltbot-jingme

# 停止
pm2 stop moltbot-jingme
```

## systemd 服务配置

`/etc/systemd/system/moltbot.service`:
```ini
[Unit]
Description=Moltbot with JingMe Plugin
Documentation=https://github.com/xiangyin1987/moltbot-warehouse
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=moltbot
WorkingDirectory=/opt/moltbot
ExecStartPre=/usr/bin/npm ci
ExecStart=/usr/bin/npm start

# 重启策略
Restart=on-failure
RestartSec=10s
StartLimitInterval=60s
StartLimitBurst=3

# 资源限制
LimitNOFILE=65535
LimitNPROC=4096

# 环境变量
EnvironmentFile=/opt/moltbot/.env

# 日志
StandardOutput=journal
StandardError=journal
SyslogIdentifier=moltbot

[Install]
WantedBy=multi-user.target
```

启动：
```bash
# 创建 moltbot 用户
sudo useradd -r -s /bin/false moltbot

# 设置权限
sudo chown -R moltbot:moltbot /opt/moltbot

# 创建 .env 文件
sudo tee /opt/moltbot/.env > /dev/null << EOF
JINGME_APP_KEY=your-key
JINGME_APP_SECRET=your-secret
JINGME_ROBOT_ID=your-robot-id
EOF

# 修改权限
sudo chmod 600 /opt/moltbot/.env

# 启用并启动服务
sudo systemctl daemon-reload
sudo systemctl enable moltbot
sudo systemctl start moltbot

# 查看状态
sudo systemctl status moltbot

# 查看日志
sudo journalctl -u moltbot -f
```

## Nginx 反向代理配置

```nginx
upstream moltbot {
    server localhost:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name example.com;
    
    # 重定向到 HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name example.com;
    
    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # 日志
    access_log /var/log/nginx/moltbot-access.log combined;
    error_log /var/log/nginx/moltbot-error.log;
    
    # Webhook 端点
    location / {
        proxy_pass http://moltbot;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

## 京me 应用 Webhook 配置

在京me开放平台应用设置中：

1. **回调地址 (Callback URL)**
   ```
   https://example.com
   ```
   或在内网：
   ```
   http://internal-server:3001
   ```

2. **验证 Token (Verification Token)**
   ```
   your-secure-webhook-token
   ```

3. **事件订阅**
   - ✓ 消息事件
   - ✓ 卡片交互事件

## 完整生产示例

创建 `config.production.yaml`:

```yaml
channels:
  jingme:
    accounts:
      default:
        enabled: true
        appKey: "${JINGME_APP_KEY}"
        appSecret: "${JINGME_APP_SECRET}"
        robotId: "${JINGME_ROBOT_ID}"
        environment: "prod"
        webhookPort: 3001
        verificationToken: "${JINGME_VERIFICATION_TOKEN}"
        dmPolicy: "open"
        groupPolicy: "open"
        historyLimit: 10

logging:
  level: "info"
  format: "json"
  destination: "./logs/moltbot.log"

server:
  port: 3001
  host: "0.0.0.0"
  
monitoring:
  enabled: true
  metricsPort: 9090
```

使用：
```bash
NODE_ENV=production node --load-config ./config.production.yaml npm start
```

---

## 相关资源

- [README.md](./README.md) - 快速开始
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 架构设计
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - 集成指南
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 部署指南
