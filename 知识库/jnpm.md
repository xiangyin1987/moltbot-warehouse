jnpm: 京东npm私服
镜像
开源镜像: http://npm.m.jd.com/mirrors
Node.js 镜像: http://npm.m.jd.com/mirrors/node
Node.js 文档镜像: http://npm.m.jd.com/mirrors/node/latest/docs/api/index.html
NPM 镜像: http://npm.m.jd.com/mirrors/npm/
phantomjs 镜像: http://npm.m.jd.com/mirrors/phantomjs
Scope
jnpm 库 默认的公共 Scope 为 @jd，你可以把对公司内部开放的包发布在 @jd 下
jnpm提供了@test作为测试包的scope，你可以用 @test 进行测试
如果你需要专有的 Scope 请联系王三平(wangsanping5)或汤晓祥(tangxiaoxiang7)添加
安全提示
在发布私有包时请务必谨慎，不要把私有包发布到外部 npm 库中：
确保你的私有包名字带 scope 前缀，例如 test 项目的 package.js 中，"name" 字段的值为 @test/test；
私服设置
手动设置
npm config set registry=http://registry.m.jd.com
npm config set disturl=http://npm.m.jd.com/mirrors/node

## 模块相关proxy
export SASS_BINARY_SITE=http://npm.m.jd.com/mirrors/node-sass     # node-sass
npm config set puppeteer_download_host=http://npm.m.jd.com/mirrors   # puppeteer
export ELECTRON_MIRROR=http://npm.m.jd.com/mirrors/electron/  # electron
export   ELECTRON_BUILDER_BINARIES_MIRROR=http://npm.m.jd.com/mirrors/electron-builder-binaries/    # electron-builder
export CHROMEDRIVER_CDNURL=http://storage.jd.local/mirrors/chromedriver/
npm config set node_sqlite3_binary_host_mirror=http://npm.m.jd.com/mirrors    # node-sqlite3
通过nrm设置
原先的jnpm客户端已不在维护，请不要在使用jnpm客户端

# 1. 安装nrm管理多个源
npm install -g nrm --registry=http://registry.m.jd.com

# 2. 添加京东私源
nrm add jd http://registry.m.jd.com

# 3. 切换到jd源
nrm use jd
通过以上命令，即可通过npm直接使用jnpm源

sync
如果你在npm.m.jd.com上搜索一个外部包时，没有这个包，可以点页面上的SYNC按钮同步该包。如果需要一次同步多个包，可以使用批量同步功能

publish
所有公司内网用户都能够发布包到 jnpm 库。

如果你之前没有发布包的经验，请先查看 npm 官方文档 npm publish 。

$ npm publish
如果出现错误代码："ERR! code ENEEDAUTH" ， 错误消息: "ERR! need auth auth required for publishing", 那么请使用 npm adduser 或者 npm login 来为 publish 操作授权.

npm adduser
或者:

npm login
unpublish
只有管理员才能 unpublish，如果需要unpublish，请联系wangsanping5(unpublish需谨慎，如果是当前包版本有问题，可以通过升级版本的方式修复，不要轻易unpublish)

$ npm unpublish @jmfe/[name]
添加包成员
添加包维护者需要有该包发布权限的owner添加(如果原包的管理者离职，再联系wangsanping5)，通过npm owner add命令添加