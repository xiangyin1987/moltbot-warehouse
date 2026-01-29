# Changelog

All notable changes to the JingMe plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2026-01-28

### Added

- Initial release of JingMe (京me) plugin for Moltbot
- Webhook-based message reception from JingMe platform
- REST API-based message sending to users and groups
- Automatic access token management with caching
- Multi-account support with independent configurations
- Support for environment variable configuration
- Configurable access control policies (allowlist/open)
- Webhook signature verification for security
- Comprehensive error handling and logging
- Full TypeScript support
- Complete API documentation and guides
- Architecture documentation
- Integration guide with examples
- Deployment guide for production use

### Features

- **Message Sending**: Send text messages to direct chats and groups
- **Message Reception**: Receive messages via webhook callbacks
- **Token Management**: Automatic access token acquisition and caching
- **Multi-Account**: Support for multiple JingMe accounts in one instance
- **Security**: Webhook signature verification, token-based authentication
- **Access Control**: Configurable allowlist policies for users and groups
- **Error Recovery**: Automatic Webhook server restart on failures
- **Logging**: Comprehensive logging for debugging and monitoring

### Documentation

- `README.md` - User guide and configuration reference
- `ARCHITECTURE.md` - Detailed architecture and design documentation
- `INTEGRATION_GUIDE.md` - Step-by-step integration instructions
- `DEPLOYMENT.md` - Production deployment guidelines
- `CHANGELOG.md` - Version history (this file)

### Configuration

- Supports both YAML file configuration and environment variables
- Configurable parameters for API environment, webhook port, access policies
- Schema validation for configuration correctness

### API Endpoints

- `POST /open-api/suite/v1/access/getAppAccessToken` - Token acquisition
- `POST /open-api/suite/v1/timline/sendRobotMsg` - Message sending
- `POST /open-api/suite/v1/timline/getRobotGroup` - Group listing

### Technical Stack

- TypeScript 5.0+
- axios for HTTP requests
- Node.js built-in modules (http, crypto)
- Moltbot Plugin SDK

### Known Limitations

- Text messages only (no rich text/cards yet)
- No message threading support
- No attachment support
- No user directory API integration

### Future Enhancements

- [ ] Rich text and interactive card support
- [ ] Message attachment handling
- [ ] Thread/reply support
- [ ] User directory integration
- [ ] Message editing and deletion
- [ ] Read receipt tracking
- [ ] Typing indicators

---

For detailed information about features, configuration, and usage, please refer to:
- [README.md](./README.md) for quick start
- [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for integration examples
- [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
