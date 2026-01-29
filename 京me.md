API调用指南/
API申请&调用流程概述
API申请&调用流程概述
开放平台对外提供了咚咚事件、咚咚消息、日程、任务、邮箱、文档等开放api。调用服务端 API 的流程如下图所示。
创建业务应用。在开放平台，根据业务需要自建应用（已有业务应用，不需要重复创建）
申请权限。
邮箱、消息号申请消息号
日程，文档，任务申请api调用权限
获取访问凭证
参考具体API接口文档，调用 API API的域名
环境 域名 说明
正式环境 http://openme.jd.local 内网域名，正式环境服务器可用 ，测试服务器无法稳定访问
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
API调用指南/
获取访问凭证
获取访问凭证
访问凭证（也叫做access_token）代表应用从平台，租户手中获得的授权。调用服务端API之前，需要从京me开放平台获取相应的访问凭证
确定API支持的访问凭证。
访问凭证需要填充到http请求头中，在api文档请求头部分，描述了API需要的访问凭证类型
获取访问凭证
访问京东me开放平台
进入业务应用
查看应用 "凭证与基本信息"
调用获取凭证接口:获取appAccessToken，获取teamAccessToken
API调用指南/
消息通知申请
消息通知申请
消息通知的渠道有邮件通知、任务通知。 为了节约资源，同时避免对用户造成过多打扰，同一个业务不建议申请多个通知渠道，如果需要多个通知渠道触达用户，请从成本、效率、体验等角度说明业务价值，需要更严格的审批。
API调用指南/
拦截规则
拦截规则
京ME机器人-消息拦截规则
一、名词术语
消息内容拦截 消息发送投递时，若不满足「消息内容合规」的规则，将会被消息网关终止消息发送行为，并即时通知应用开发者
消息投递拦截 消息发送投递时，若不满足「消息投递频率&范围」的规则，将会被消息网关终止消息发送行为，并即时通知应用开发者
消息预警 消息发送投递后，若涉及「消息敏感」，则将一段时间内的此类信息聚合，推送给ME开放平台产品/运营进行人工审核和干预
二、触发机制
业务类型 消息内容合规
(满足任意条件，触发消息内容拦截 ) 消息投递频率&范围
(满足任意条件，触发消息投递拦截 )
系统报警 - 内容不允许为空
- 文本消息内容最多2000字符
- 卡片消息包大小最多20KB
- 向同1个 用户/群，投递相同内容的消息，需要间隔1小时以上
- 消息内容不能涉及敏感内容(黄色、暴力、政治等)：暂未进行拦截 - 只能推送给机器人已申请的发送范围的人群
- 1s内，只能给同1个PIN/群，推送5条消息
- 最高推送频率不超过50次/S
- 最高推送频率不超过10W次/30min
账户安全
工作待办 - 只能推送给机器人已申请的发送范围的人群
- 1s内，只能给同1个PIN/群，推送5条消息
- 最高推送频率不超过20次/S
- 最高推送频率不超过10W次/60min
调研收集
流程进度变更
其他
咨询问答 - 内容不允许为空
- 文本消息内容最多2000字符
- 卡片消息包大小最多20KB
- 消息内容不能涉及敏感内容(黄色、暴力、政治等)：暂未进行拦截 - 只能推送给机器人已申请的发送范围的人群
- 1s内，只能给同1个PIN/群，推送5条消息
- 最高推送频率不超过50次/S
- 最高推送频率不超过10W次/30min
三、通知机制
即时通知模式
消息拦截：
触发拦截后立即发送拦截消息
10分钟最多发送5条 拦截通知。超过数量的拦截不发送通知
拦截优先级：
优先级排序：内容合规- “空”内容 > 内容合规- 内容超长 > 消息投递频率&范围- 无发送权限 > 内容合规 - 重复内容 > 消息投递频率&范围- 推送频率
优先级应用规则：
按照优先级从高到低进行拦截，优先触发高优先级拦截
说明： 优先级相同时，随机触发同级的1个规则
触发任意拦截后，阻断消息发送，并发送拦截通知，且不再对该消息进行后续检测
API调用指南/
API错误码
API错误码
建议使用内网域名http://openme.jd.local ，大部分线上服务器无法放呢jd.com公网域名。
建议直接使用平台正式环境 ，预发环境不稳定，仅联调未上线能力用（x-stage配置）
网关平台错误
code msg 说明 排查
99990011 无效的api 类似访问url 404 1、检查url是否正确
2、联系平台确定接口服务是否正常
99990041 路由后端服务异常 1、一般为参数异常，网关向服务端转发请求，参数序列化为对象时失败
2、这个错误，请不要重试，会让网关以为是服务问题，触发接口熔断
3、如发现多次异常调用，导致服务熔断，平台将下线调用方接口使用权限 1、检查请求header头，Content-Type：application/json
2、检查请求体是否json格式， 如少逗号，引号等
3、检查请求参数是否符合文档说明示例，比如入参要数字，传输字符串
99990010 缺少api url对应服务api不存在 联系平台确定接口服务是否正常
99990011 无效的api url对应服务api不可用 联系平台确定接口服务是否正常
99990012 请求的content-type不支持 content-type异常
99990013 参数错误，缺少认证信息 header缺少authorization信息
99990014 解析请求参数内容异常 入参异常
99990015 api状态无效，请发布api url对应服务api不可用 联系平台确定接口服务是否正常
99990040 API没有配置对应的后端路由 url对应服务api不存在 联系平台确定接口服务是否正常
99990042 写入响应异常 网络异常 联系平台确定接口服务是否正常
99990098 Service Bad 网关层服务异常 联系平台确定接口服务是否正常
99990099 GateWay Bad 网关层服务异常 联系平台确定接口服务是否正常
开放平台错误
code msg 说明 排查
99990101 授权服务异常
99990102 应用信息不合法 appKey不可用 1、检查appKey是否书写错误
2、me-test.jd.com环境的appKey，不可用于正式、预发环境开放API
3、联系平台检查appKey可用
99990103 授权校验异常
99990104 账号信息不合法
99990105 访问频次限制 访问频次过高 API调用次数是否超过申请API填写的最大申请次数
99990119 token生成失败
99990000 Open APP Token 无效 app_access_token过期、或不可用 1、检查token获取，传输方式是否正确
2、是否缓存设置不合适，token已过期
99990001 Open Team Token 无效 team_access_token过期、或不可用 1、检查token获取，传输方式是否正确
2、是否缓存设置不合适，token已过期
99990002 Open User Access Token 无效 user_access_token过期、或不可用 1、检查token获取，传输方式是否正确
2、是否缓存设置不合适，token已过期
99990003 Open User Refresh Token 无效 token过期、或不可用 1、检查token获取，传输方式是否正确
2、是否缓存设置不合适，token已过期
99990118 无效的code code不可用 1、code只能认证一次，认证后失效
2、code生成后，5分钟内未使用
3、生成code的appKey，与校验code的appKey不一致
99990106 HTTP Header不合法
99990107 HTTP 参数不合法
99990108 参数校验不合法
99990100 未知错误
99990120 IP无权限访问
99990121 应用未授权
99990122 AES解析异常
99990123 响应体异常
99990128 无权限操作
99990124 参数缺失
99990125 字段获取异常
99990126 没有此用户 查询不到用户信息 1、检查入参用户信息是否正确
2、检查用户账号是否正常可用（用户在职）
99990129 白名单内无此应用
99990127 没有此部门
99990130 父部门下已有此名称部门
99990131 推送失败
99990133 没有此员工 查询不到用户信息 1、检查入参用户信息是否正确
2、检查用户账号是否正常可用（用户在职）
99990132 没有此团队
99990134 社区服务异常
99990135 通用服务异常
99990136 认证服务异常
99990137 应用服务异常
99990138 应用不合法
99990140 认证中心异常
99990141 未经团队授权的应用
99990142 应用未经用户授权
99990143 搜索中心异常
99990144 帐户中心异常
99990145 通讯录服务异常
99990146 消息卡片服务异常
99990147 AI服务异常
99990148 应用无权限交换ID
99990149 日程起始时间应小于结束时间
99990150 日程重复时间设置错误
99990151 日历套件服务异常
99990152 日程起始时间设置错误
99990153 无权限访问该用户日历资源
99990154 任务起始时间应小于结束时间
99990155 代办服务异常
99990156 负责人不存在
99990156 执行人不存在
99990157 snap login no face template
99990158 snap face identification error
99990159 snap face verification error
99990160 snap face identification unknown result
机器人接口错误
code msg 说明 排查
500 失败
10100006 API映射未配置 接口不存在 联系平台研发
10600001 接口未授权 1、查看开放平台是否申请了当前接口的权限。
2、 申请之后是否部署 和已上线。
3、如果申请后并已上线还是不行请联系平台研发
20100001 数据不存在
20100002 服务内部错误 case 1: 发消息机器人，不在要发送的群内
case 2: 消息参数错误，检查发送消息参数
20100003 请求参数错误
20100004 机器人不存在
20100005 签名信息和时间戳不能为空
20100006 签名验证失败
20100007 消息接收者为空
20100008 群信息不存在
20100009 机器人消息被限流
20100010 机器人消息是空
20100011 机器人消息超过2000
20100012 不在发送范围 同20100009发送消息错误，消息接受人，不在机器人开放范围内 1、正式机器人：检查机器人上线“可用范围”
2、测试机器人：测试机器人只能给“应用成员”或“测试群”发送，如果新加用户，需要再机器人编辑页面，“调试发布”，同步用户成员
20100013 发送人数超过%d限制
236008 机器人未加入该群
10100020 无效的机器人信息 服务没有找到入参的robotId相关机器人 1、检查机器人是否发布
2、检查机器人id填写错误
10300000 无此群主创群权限 接口创建群时，会进行erp是否可被邀请的权限检查，如果设置的群主owner或者群成员members，不在邀请的范围内（机器人的可用范围），会提示该错误. 检查机器人上线发布时的可用范围
JoyDay错误码
code msg
1101100 系统错误
1101101 无法获取用户信息
1101102 入参传输有误，请检查
1101103 无法创建个人日历，已存在
1101104 无法获登录用户信息
1101105 获取租户信息错误
1101106 用户已离职
1101107 参数校验失败,参数缺失
1101201 加入群聊失败
1101202 申请入群失败
1101203 群聊已存在
1101204 未查询到对应的日程
1101205 操作类型不能为空
1101206 用户不能为空
1101207 推送内容不能为空
1101208 客户端类型不能为空
1101209 签名不能为空
1101210 发送用户不能为空
1101211 接收用户不能为空
1101212 推送标题不能为空
1101213 至少有一中文一种
409 创建群聊失败
1101301 日历编码不能为空
1101302 是否一整天不能为空
1101303 日程标题不能为空
1101304 开始时间不能为空
1101305 结束时间不能为空
1101306 提醒设置不能为空
1101307 重复设置不能为空
1101308 来源不能为空
1101309 地址信息不能为空
1101310 日程编码不能为空
1101311 用户或日程编号至少传一个
1101312 应答状态不能为空
1101313 应答用户不能为空
1101314 变更方式不能为空
1101315 参与者用户不能为空
1101316 附件信息传入有误
1101317 撤消状态不能为空
1101318 组织者不能为空
1101319 结束时间必须大于开始时间
1101320 操作类型不能为空
1101321 开始时间或结束时间不能为空
1101322 时间不能为空
1101323 应答方式不能为空
1101324 未查询到对应关系
1101325 至少一个参数
1101326 操作类型有误，请检查
1101327 无权操作，请检查
1101328 今天需要在开始时间和结束时间之间
1101401 日历编码不能为空
1101402 日历名称不能为空
1101403 公开范围不能为空
1101404 视图模式不能为空
1101405 订阅者用户信息不能为空
1101406 订阅者权限不能为空
1101407 未查询到日历信息
1101408 订阅者用户所属域不能为空
1101409 无法删除个人日历
1101410 您无权删除公共日历
1101411 您无joyspace文档分享权限
1101412 您无joyspace文档编辑权限
1101413 mix-service返回业务失败
1101414 joymeeting创建失败
1101415 会议纪要生成失败
1101416 joyspace文档关联失败
1101417 joymeeting取消失败
1101418 日程已经关联过joymeeting
1101419 不能订阅自己的个人日历
1101420 日程取消关联joymeeting失败
1101421 开放平台创建的不可以编辑日程，不允许日历端修改
1101422 自定义按钮信息不全
1101423 DongDongmeeting创建失败
1101501 用户密码错误 对应ServiceError.PASSWORD_ERROR
1101502 用户密码未配置 对应ServiceError.NO_PASSWORD_CONFIGURED
1101503 EXCHANGE服务读超时 对应ServiceError.EXCHANGE_SERVICE_TIMEOUT
1101504 EXCHANGE服务错误 对应ServiceError.EXCHANGE_SERVICE_ERROR
1101505 EXCHANGE查询日程过多 对应ServiceError.QUERY_TOO_LARGE
1101506 请勿重复提交
1101507 joymeeting会议无效
1101508 joymeeting会议存在，但密码不同
1101509 joymeeting会议校验失败
1101510 邮箱已超过最大邮箱大小（Outlook返回固定错误信息，不可更改）
1101511 修改后的事件将与相邻事件交叉或重叠
1101512 joymeeting时间间隔超出范围
1101513 该会议绑定的日程已发生变更，请查看日程详情加入会议～
1101514 日程不存在
1101515 日程已结束
1101516 joymeeting人数超限
1101517 外协人员没有JoyMeeting创建权限
1101518 咚咚视频会议人数超限
1101519 修改关联的群ID失败
1101520 当前请求处理中
1101521 joymeeting错误
1101522 日程洞察数据解析失败
1101523 公共日历不允许操作
1101524 非Joymeeting会议号的主持人
1101525 租户信息为空
1101526 跨天时间间隔不能大于重复时间间隔
1101527 超出限制
1101528 已关联文档，无需提醒
1101530 参会人超出最大限制
1101532 附件不存在
1101533 附件已读保存失败
1101531 服务异常，请稍后重试
1101534 关联失败
1101535 参会人不存在
1101536 日程已取消不允许索要材料
1101537 索要材料无组织者
1101538 通用搜索接口检索失败
1101539 通用搜索接口时间范围超出三个月限制
1101540 拉取会议评价失败
1101541 提交评价失败，找不到初始题目
1101542 题目已提交
1101543 提醒评价当前人非组织者
1101544 通用搜索onlyAttendeeStrategyUser限制为当前参与人
1101601 有权限
1101602 无权限
1101603 日程不存在
1101604 不存在
10100005 咚咚卡片消息限流
2000001 SET Extended Property Error
2000002 错误的修改类型
2000003 不存在的日程，可能已经删除
2000004 不能打开或分享此日程：因为该日程的组织者对该日程的管辖权发生变化或未同步此日程
3000001 用户校验密码失败
3000002 用户校验非密码校验失败
3000003 同步日程第一步删除失败
3000004 同步日程布置任务失败
3000005 用户认证失败
4000000 评论保存失败
4000001 评论列保存失败
4000002 评论删除失败
4000003 不存在的评论，可能已经删除
4000004 无评论权限
4000005 一级评论已经删除
4000006 评论查询数量失败
4000007 评论屏蔽配置失败
4000008 无该评论的删除权限
4000009 评论更新失败
40000010 评论屏蔽查询失败
40000011 评论屏蔽保存失败
40000012 评论已读保存失败
40000013 评论已读更新失败
40000014 评论已读查询失败
40000015 评论关联失败
40000016 评论Base保存失败
40000100 该日程已绑定会议文档
40000101 绑定失败
40000102 Joyspace绑定日程失败
40000103 给参会人授权会议文档失败
4000104 会议文档创建失败
40000105 该会议文档已绑定日程
40000106 获取客户端配置信息失败
50000000 Jsf泛化调用异常
50000001 会议文档议程提醒异常
60000001 第三方接入，fromSystem未记录
50000002 查询日程列表业务异常
50000003 查询日程列表系统异常
50000004 项目列表查询失败
50000005 查询的时间范围超过限制
50000006 服务繁忙，请稍后重试
50000007 正在处理中
70000001 请求中断稍后重试
80000001 注解使用问题
API调用指南/
API权限列表
API权限列表
权限名称 权限说明
消息 以机器人发送消息为主 内有消息发送权限
群聊 以管理群为主 内有群管理，群信息查询，群置顶卡片，群管理（以用户身份）
AI能力 工作流，智能体
任务 任务管理，JoyWork
日程 日程信息查询，日程管理，日程查询，日程查询
文档 空间信息查询，空间管理，
机器人（历史版本）
API列表
汇总 API 名称 API地址 API说明
空间信息查询 查询异步任务进度 /open-api/suite/v1/joyspace/getTaskFinishPercent 查看异步任务进度
获取指定文件夹下的子文件夹列表 /open-api/suite/v1/joyspace/getFolderList 获取指定文件夹下的子文件夹列表
最近打开 /open-api/suite/v1/joyspace/getUserRecentView 最近打开
获取指定文件夹下的子文件列表 /open-api/suite/v1/joyspace/getFileListOfFolder 获取指定文件夹下的子文档列表
搜索 /open-api/suite/v1/joyspace/search 搜索文件或文件夹
消息发送 通过机器人发送消息 /open-api/suite/v1/timline/sendRobotMsg 通过机器人发送消息
发送JUE消息 /open-api/suite/v1/timline/sendJUEMsg 发送互动卡片消息
发送JUE变更消息 /open-api/suite/v1/timline/sendJUEChangeMsg 发送互动卡片变更消息
群管理 创建群 /open-api/suite/v1/timline/createGroup 创建群
更新群信息 open-api/suite/v1/timline/updateGroup 更新群信息
将用户或机器人拉入群聊 open-api/suite/v1/timline/addGroupMember 将用户或机器人拉入群聊
将用户或机器人移出群聊 /open-api/suite/v1/timline/kickOutGroup 将用户或机器人移出群聊
获取机器人所在的群 open-api/suite/v1/timline/getRobotGroup 获取机器人所在的群
添加群管理员 /open-api/suite/v1/timline/addGroupAdmin 添加群管理员
撤回消息 /open-api/suite/v1/timline/withdrawMsg 撤回消息
置顶群公告 /open-api/suite/v1/timline/sendStickyCardMsg 发送置顶卡片消息
取消群公告置顶 /open-api/suite/v1/timline/sendUnpinCardMsg 发送取消置顶卡片消息
日程信息查询 获取日程详情 /open-api/suite/v1/calendar/getScheduleDetail 获取日程详情
获取日历列表 /open-api/suite/v1/calendar/getCalendarList 获取日历
获取日程信息 /open-api/suite/v1/calendar/getAppointmentInfo 查询日程详情-第三版
查询日程列表-三方 /open-api/suite/v1/calendar/findAppointmentListForThirdParty 查询日程列表-三方
获取日程列表 /open-api/suite/v1/calendar/getAppontmentInfoList 获取日程列表
日程管理 创建日程 /open-api/suite/v1/calendar/createSchedule https://me.jd.com/openplatform/docs?docs=%2Fdocs%2F7HVfrbOWhceS4Xasq50I%2Fdf5I6m1judf73dRfRtmQ%2FR5UyAeuzViWxqg3AZnzC%2FrUUyPKiiHcRlRo9NCaQh&activeTab=server
变更日程 /open-api/suite/v1/calendar/alterationSchedule https://me.jd.com/openplatform/docs?docs=%2Fdocs%2F7HVfrbOWhceS4Xasq50I%2Fdf5I6m1judf73dRfRtmQ%2FR5UyAeuzViWxqg3AZnzC%2F3DmJd0N8WajUX2vax7nl&activeTab=server
取消日程 /open-api/suite/v1/calendar/cancelAppointment 取消日程
删除日程 /open-api/suite/v1/calendar/removeSchedule 删除日程
修改日程 /open-api/suite/v1/calendar/alterationAppointment 修改日程
空间管理 移除成员 /open-api/suite/v1/joyspace/removeTeamMembers 移除成员
修改安全设置 /open-api/suite/v1/joyspace/modifyBizSettings 修改安全配置
修改协作人权限 /open-api/suite/v1/joyspace/changeCooperatorPermission 修改协作人权限
创建文件夹 /open-api/suite/v1/joyspace/createFolder 创建文件夹
添加空间成员 /open-api/suite/v1/joyspace/addTeamMembers 添加成员
修改空间成员权限 /open-api/suite/v1/joyspace/modifyMembersPermission 修改成员权限
文档管理 分享 /open-api/suite/v1/joyspace/share 分享
创建文档 /open-api/suite/v1/joyspace/createPage 创建文档
任务管理 完成JoyWork任务 /open-api/suite/v2/joywork/updateTaskStatus 更新待办状态
更新JoyWork任务 /open-api/suite/v1/joywork/updateTask 更新待办
同步JoyWork任务 /open-api/suite/v1/joywork/syncTask 创建待办
工作流 执行工作流 /open-api/suite/v1/autobots/runWorkflow 执行工作流
工作流异步获取结果 /open-api/suite/v1/autobots/getWorkflowResult 工作流异步获取结果
智能体问答请求 /open-api/suite/v1/autobots/searchAiRequest 智能体问答请求
智能体 智能体会话推荐 /open-api/suite/v1/autobots/suggestionQuery 智能体会话推荐
获取智能体基本信息 /open-api/suite/v1/autobots/getAgentBaseInfo 获取智能体基本信息
群信息查询 查询群信息 /open-api/suite/v1/timline/getGroupInfo 查询群信息
群是否存在 /open-api/suite/v1/timline/isGroupExist 群是否存在（专用）
获取群成员详情 /open-api/suite/v1/timline/getGroupMembers 查询群成员
群置顶卡片 发送卡片置顶消息 /open-api/suite/v1/timline/sendStickyCardMsg 发送置顶卡片消息
发送取消置顶卡片消息 /open-api/suite/v1/timline/sendUnpinCardMsg 发送取消置顶卡片消息
发送置顶卡片变更消息 /open-api/suite/v1/timline/sendStickyCardChangesMsg 发送置顶卡片变更消息
获取文档位置 /open-api/suite/v1/joyspace/getLocation 文档位置查询
查询文档信息 /open-api/suite/v1/joyspace/getPageInfos 文档信息查询
导出 /open-api/suite/v1/joyspace/export 导出
获取文档内容 获取文档内容 /open-api/suite/v1/joyspace/getPageContent 文档内容查询
群管理（以用户身份） 以用户身份转让群主 /open-api/suite/v1/timline/transferGroupOwner 用户身份转让群主
以用户身份设置管理员 /open-api/suite/v1/timline/userAddGroupMember 用户设置群管理员
以用户身份添加群成员 /open-api/suite/v1/timline/userAddGroupMember 用户身份添加群成员

事件订阅/
简介
简介
基本信息：
用户操作互动卡片上的按钮、文本等交互，需要把数据回传给第三方应用，会调用第三方在机器人消息里面配置的http回调地址进行数据交互.
触发场景：
客户端操作主动触发
HTTP回调接口
回调地址： 机器人信息里面配置的卡片消息地址
交互协议
请求头：
请求方式 post
Content-Type: application/json
回传参数
{
"reqType":1, //请求类型 1:更新卡片消息 2：回传交互数据
"from":{ //操作用户
"app":"ee", //租户app
"pin":"xxx", //用户erp
"clientType":"pc" //客户端类型
},
"to":{
"app":"ee", //机器人app
"pin":"xxx" //机器人pin
},
"gid":"10233333", //群号，群聊会话携带
"datetime":10144124124121, //当前时间戳
"token":"xxxxxx", //机器人设置的效验token
"lang":"zh_cn", //客户端语言
"body":{
"templateId":"",
//互动卡片模板ID
"cardMsgId":"adfs123213",
//卡片消息ID
"sessionType":2,
//会话类型 1：单聊，2：群聊
"sessionId":"1028620378",
//会话ID
"callbackData":{
//卡片回传数据， 非必填，如果有此属性，则透传给第三方应用
},
"actionData":{
//卡片当前动交互回传数据，互动卡片里面各元素定义的回传数据
}
}
}
返回参数
返回类型
json格式字符串
公共协议头
名称 数据类型 描述
code int 1: 表示成功， 非1 表示失败
msg string 成功或者失败的提示消息
data object 返回的数据内容
更新卡片消息 返回协议 reqType=1
{
"msg":"操作成功！",
"code":1,
"data":{
"cardMsgId":"adfs123213", //卡片消息ID
"cardData":{
//卡片数据，需要更新到互动卡片模板的数据
},
"forward":{ //转发数据，如果此字段则更新当前卡片的forward
"reload":true,
"cardData":{}
},
"callbackData":{
//回传数据，如有此字段则更新当前卡片的callbackData
}
}
}
回传交互数据 返回协议 reqType=2
{
"msg":"操作成功！",
"code":1,
"data":{
"promptInfo":{//可选参数，用户客户端消息提示的样式和内容显示
"type":"toast",
"style":"success|info|error|warn",
"content":"优先取此处信息，如无取外出的msg, 如再无客户端默认"
},
"action":{//可选参数，用户客户端收到交互结果的时候下一步执行动作.
"type":"link",
"linkInfo":{
"default":"jdme://",
"pc":"http://www.jd.com",
"ios":"http://www.jd.com",
"android":"http://www.jd.com",
"mac":"http://www.jd.com",
"ipad":"http://www.jd.com",
"apad":"http://www.jd.com"
}
}
}
}
事件订阅/
事件类型
事件类型
一旦有订阅的事件发生，京ME会向机器人应用中配置的url推送事件。事件类型和请求body内容如下：
事件类型列表
事件类型 说明
chat_message 聊天消息
chat_add_member 群添加人员
chat_remove_member 群删除人员
chat_quit 群用户主动退群
chat_update_owner 群更换群主
chat_update_title 群更换群名称
chat_disband 群解散
income_robot_session 机器人进线
app_label_change 应用标签变更
enter_robot_session 用户进入与机器人的会话
robot_enter_group 机器人进入群
chat_message_record 聊天消息轨迹
content_do_top 群消息置顶
content_do_cancel 取消群消息置顶
message_summary 消息智能总结
消息（单聊和群聊）
示例：
{
"eventId":"sh77ad7a8dchhxgdd",
"eventType":"chat_message",
"timeStamp":1621930353703,
"event":{
"sender":{
"app":"xxxxx",
"pin":"xxxxx"
},
"chatType":"2",
"msgId":"xxxxx",
"groupId":"xxxxx",
"body":{
"type":"text",
"content":"xxxxxx"
}
}
}
参数说明：
名称 描述
eventId 事件id，应用最好根据此id保持幂等
eventType 事件类型
timeStamp 时间戳
event 事件消息体
—sender 发送人
—chatType 聊天类型 1:单聊，2：群里
—msgId 消息id
—groupId 群id（当为群聊的时候有值）
—body 聊天消息体（下面的字段以文本消息举例）
——type 消息类型，例如："text", "image"
——content 消息内容（这里是以文本消息举例）
聊天消息体body，更多消息类型请参考 发送机器人消息API接口 里面body参数类型。
群添加人员
示例：
{
"eventId":"sh77ad7a8dchhxgdd",
"eventType":"chat_add_member",
"timeStamp":1621930353703,
"event":{
"operator":{
"app":"xxxxx",
"pin":"xxxxx"
},
"groupId":"xxxxx",
"users":[
{
"app":"xxxxx",
"pin":"xxxxx"
}
]
}
}
参数说明：
名称 描述
eventId 事件id，应用最好根据此id保持幂等
eventType 事件类型
timeStamp 时间戳
event 事件消息体
—operator 操作人
—groupId 群id
—users 新增加的成员
群删除人员
示例：
{
"eventId":"sh77ad7a8dchhxgdd",
"eventType":"chat_remove_member",
"timeStamp":1621930353703,
"event":{
"operator":{
"app":"xxxxx",
"pin":"xxxxx"
},
"groupId":"xxxxx",
"users":[
{
"app":"xxxxx",
"pin":"xxxxx"
}
]
}
}
参数说明：
名称 描述
eventId 事件id，应用最好根据此id保持幂等
eventType 事件类型
timeStamp 时间戳
event 事件消息体
—operator 操作人
—groupId 群id
—users 删除的人员
用户主动退群
示例：
{
"eventId":"sh77ad7a8dchhxgdd",
"eventType":"chat_quit",
"timeStamp":1621930353703,
"event":{
"operator":{
"app":"xxxxx",
"pin":"xxxxx"
},
"groupId":"xxxxx"
}
}
参数说明：
名称 描述
eventId 事件id，应用最好根据此id保持幂等
eventType 事件类型
timeStamp 时间戳
event 事件消息体
—operator 操作人
—groupId 群id
更换群主
示例：
{
"eventId":"sh77ad7a8dchhxgdd",
"eventType":"chat_update_owner",
"timeStamp":1621930353703,
"event":{
"operator":{
"app":"xxxxx",
"pin":"xxxxx"
},
"groupId":"xxxxx",
"owner":{
"app":"xxxxx",
"pin":"xxxxx"
}
}
}
参数说明：
名称 描述
eventId 事件id，应用最好根据此id保持幂等
eventType 事件类型
timeStamp 时间戳
event 事件消息体
—operator 操作人
—groupId 群id
—owner 新的群主
更换群名称
示例：
{
"eventId":"sh77ad7a8dchhxgdd",
"eventType":"chat_update_title",
"timeStamp":1621930353703,
"event":{
"operator":{
"app":"xxxxx",
"pin":"xxxxx"
},
"groupId":"xxxxx",
"title":"xxxxx"
}
}
参数说明：
名称 描述
eventId 事件id，应用最好根据此id保持幂等
eventType 事件类型
timeStamp 时间戳
event 事件消息体
—operator 操作人
—groupId 群id
—title 群名称
群解散
示例：
{
"eventId":"sh77ad7a8dchhxgdd",
"eventType":"chat_disband",
"timeStamp":1621930353703,
"event":{
"operator":{
"app":"xxxxx",
"pin":"xxxxx"
},
"groupId":"xxxxx"
}
}
参数说明：
名称 描述
eventId 事件id，应用最好根据此id保持幂等
eventType 事件类型
timeStamp 时间戳
event 事件消息体
—operator 操作人
—groupId 群id
欢迎语
示例：
{
"event":{
"sender":{
"app":"ee",
"pin":"xxxxxx"
},
"body":{
"uid":{
"app":"robot.dd",
"pin":"app.xvmvsmzw"
},
"gid":"",
"sessionType":1,
"sessionGroup":1
}
},
"eventId":"65e11b6254f94560c8f33190",
"eventType":"income_robot_session",
"timeStamp":1709251426527
}
参数说明：
名称 描述
eventId 事件id
eventType 事件类型
timeStamp 时间戳
event 事件消息体
—sender 发送人
—body 聊天消息体（下面的字段以文本消息举例）
——uid 机器人账号
——gid 群id（当为群聊的时候有值）
——sessionType 会话类型：单聊为1；群聊为2
——sessionGroup 会话分组，一般情况为1
群消息置顶
{
"eventId":"sh77ad7a8dchhxgdd", //事件ID
"eventType":"content_do_top", //事件类型
"timeStamp":1703163969242, //时间戳
"event":{
"sessionType":2, //会话类型 1 单聊,2群聊
"detail":{
"resId":432539, //置顶ID
"cid":"00_4b397570ab764ba9-001", //JUE模板卡片ID (子类型为5的时候有值)
"resType":1, //置顶类型 1.消息 2.公告
"subType":2, //置顶消息子类型 2.消息 3.外链分享 4.机器人卡片 5.JUE模板卡片
"tid":315941574 //消息ID(子类型为2，3,4时候有值)
},
"sessionId":"10206725369", //会话ID
"operator":{ //操作人
"app":"ee", //租户app
"pin":"ext.luyuyu1" //erp
}
},
"robots":[ //机器人
{
"app":"robot.dd",
"pin":"app.ishgzt7c"
}
]
}
群消息取消置顶
{
"eventId":"sh77ad7a8dchhxgdd", //事件ID
"eventType":"content_do_cancel", //事件协议
"timeStamp":1703163969242
"event":{
"sessionType":2, //会话类型 1 单聊,2群聊
"sessionId":"10206725369", //会话ID
"detail":{
"resId":432539, //置顶ID
"cid":"00_4b397570ab764ba9-001", //JUE模板卡片ID (子类型为5的时候有值)
"resType":1, //置顶类型 1.消息 2.公告
"subType":2, //置顶消息子类型 2.消息 3.外链分享 4.机器人卡片 5.JUE模板卡片
"tid":315941574 //消息ID(子类型为2，3,4时候有值)
},
"operator":{ //操作者
"app":"ee", //租户app
"pin":"ext.luyuyu1" //erp
}
},
"robots":[
{
"app":"robot.dd",
"pin":"app.ishgzt7c"
}
]
}
智能总结消息
{
"eventId":"sh77ad7a8dchhxgdd", //事件ID
"eventType":"message_summary", //事件协议
"timeStamp":1703163969242,
"event":{
"sessionType":2, //会话类型 1 单聊,2群聊
"sessionId":"10206725369", //会话ID
"detail":{
"bid": "sdfgwertwrg45", //置顶ID
"planId":"00_4b397570ab764ba9-001", //JUE模板卡片ID (子类型为5的时候有值)
"status": "running", // 状态
"result": {}, // 结果对象
"output":"" // 结果
},
"operator":{ //操作者
"app":"ee", //租户app
"pin":"ext.luyuyu1" //erp
}
},
"robots":[
{
"app":"robot.dd",
"pin":"app.ishgzt7c"
}
]
}
事件订阅/
事件订阅流程
事件订阅流程
1. 操作流程
1、第一步在开放平台添加订阅回调地址
2、第二步在下方选择订阅的事件类型
3、添加完成后发布上线。
4、订阅完成后，例如发送消息 你在跟机器人聊天或者@机器人的时候 会根据第一步的订阅地址进行调用，参数类型如下
{
"timeStamp": 1741334871107,
"eventId": "67caa957824f470342ca56af",
"robotApp": "robot.dd",
"eventType": "chat_message",
"event": {
"sender": {
"app": "ee",
"clientType": "pc",
"pin": "ext.liudi31"
},
"groupId": "10211998422",
"msgId": "352829272",
"body": {
"param": {
"pushContent": ""
},
"atUsers": [{
"app": "robot.dd",
"pin": "app.j7xsj5ew",
"nickname": "AAAA测试机器人"
}],
"requestData": {
"sessionId": "10211998422"
},
"type": "text",
"content": "@AAAA测试机器人  111"
},
"chatType": 2
},
"robotPin": "app.j7xsj5ew",
"token": "dnOdktJtTxibRMDqAfCo1KtawojSDzT6Ak5UNJcyNC0="
}
5、以上是订阅回调的入参 可以根据次参数做逻辑处理
2. 响应说明
订阅的事件发生时，咚咚将会通过HTTP POST请求发送Json格式的事件数据到你预先配置的请求网址URL。具体的事件消息json参数可参加： [事件订阅列表](https://joyspace.jd.com/page/T3MknSgiK6aowEbRqlTE)
收到此请求后，需要在5秒内以http200状态码响应该请求，否则开放平台会对此推送失败进行重试，间隔10秒
重试一次，最多重试3次
为了避免同一个事件处理了多次，你需要使用event_id对事件的唯一性进行检查。
如果你填写了Encrypt Key，在进行业务逻辑处理前进行解密。
你可以检查 token (设置了Encrypt Key需要先解密，才能获取token)是否与应用后台的 Verification Token 相同以确保这个事件的来源是咚咚开放平台，而不是恶意的第三方伪造的事件。注： 订阅事件变更后，需要下一个版本发布才生效.
3. 安全验证和数据加密
如何使用Verification Token： 如果设置了verification token不为空，以上所有推送请求报文体中会多一个token字段，token是由机器人应用接入时配置的verification token加换行符"\n"，加timeStamp后的字符串加密生成。例如：添加群添加人员设置了verification token，body请求体会变成：
{
"token":"YpHIdS/j8r/+0JGdzrDyjFAhotK+jcsndLouWB3WwS0=",
"eventId":"sh77ad7a8dchhxgdd",
"eventType":"chat_add_member",
"timeStamp":1621930353703,
"event":{
"operator":{
"app":"xxxxx",
"pin":"xxxxx"
},
"groupId":"xxxxx",
"users":[
{
"app":"xxxxx",
"pin":"xxxxx"
}
]
}
}
机器人应用方收到推送请求后，可用Dongtalk工具包中的加密算法**DongTalkSignatureUtil.encrypt** 进行加密比对，是否和参数中的token一致，防止恶意请求。工具包的maven依赖为：
com.jd
dongtalk
1.0-SNAPSHOT
如何使用Encrypt Key： 如果你对消息内容的安全级别要求较高，可以通过与开放平台约定密钥的方式进行消息加密。开放平台推送事件时会使用该密钥对消息内容做对称加密。
如果设置了Encrypt Key（不为空），事件推送的请求体将会变成：
{ "encrypt": "FIAfJPGRmFZWkaxPQ1XrJZVbv2JwdjfLk4jx0k/U1deAqYK3AXOZ5zcHt/cC4ZNTqYwWUW/EoL+b2hW/C4zoAQQ5CeMtbxX2zHjm+E4nX/Aww+FHUL6iuIMaeL2KLxqdtbHRC50vgC2YI7xohnb3KuCNBMUzLiPeNIpVdnYaeteCmSaESb+AZpJB9PExzTpRDzCRv+T6o5vlzaE8UgIneC1sYu85BnPBEMTSuj1ZZzfdQi7ZW992Z4dmJxn9e8FL2VArNm99f5Io3c2O4AcNsQENNKtfAAxVjCqc3mg5jF0nKabA+u/5vrUD76flX1UOF5fzJ0sApG2OEn9wfyPDRBsApn9o+fceF9hNrYBGsdtZrZYyGG387CGOtKsuj8e2E8SNp+Pn4E9oYejOTR+ZNLNi+twxaXVlJhr6l+RXYwEiMGQE9zGFBD6h2dOhKh3W84p1GEYnSRIz1+9/Hp66arjC7RCrhuW5OjCj4QFEQJiwgL45XryxHtiZ7JdAlPmjVsL03CxxFZarzxzffryrWUG3VkRdHRHbTsC34+ScoL5MTDU1QAWdqUC1T7xT0lCvQELaIhBTXAYrznJl6PlA83oqlMxpHh0gZBB1jFbfoUr7OQbBs1xqzpYK6Yjux6diwpQB1zlZErYJUfCqK7G/zI9yK/60b4HW0k3M+AvzMcw=" }
encrypt的加密和解密参看或使用Dongtalk工具包中的加密、解密算法，NotifyDataEncrypter和NotifyDataDecrypter。
python代码解密：
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import hashlib
def decrypt(base64_str, key_str):
# Decode Base64 string
decoded = base64.b64decode(base64_str)
# Extract IV from decoded data
iv = decoded[:16]
# Extract encrypted data
encrypted_data = decoded[16:]
# Create AES cipher
key = hashlib.sha256(key_str.encode()).digest()
cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
decryptor = cipher.decryptor()
# Decrypt data
padded_data = decryptor.update(encrypted_data) + decryptor.finalize()
# Remove PKCS5 padding
padding = padded_data[-1]
if padding > 0 and padding <= 16:
padded_data = padded_data[:-padding]
return padded_data.decode()
key_str = "mySecretKey"
base64_str = "your_base64_encoded_string_here"
print(decrypt(base64_str,



简介
京ME提供了一系列即时通讯场景的API。通过创建京ME机器人并调用消息与群组API，你可以实现多种功能，例如：
通过机器人发送不同类型的消息，如文本、富文本、图片、文件、互动消息卡片、群置顶卡片等等。
如果当前的开放能力仍不满足你的业务诉求，可以添加社区群反馈申请开放。点击加入京ME开放平台社区群
即时通讯/
通过机器人发送消息
尝试一下
通过机器人发送消息
通过此接口可发送文本、@人等消息。
说明：需要先在开放平台上创建应用，并申请机器人能力以及发送接口 权限申请 。
限制：20 QPS/秒，1000 次/分
请求URL
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/sendRobotMsg
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
请求体
普通消息
名称 类型 必填 描述
appId string 是 开放平台注册的应用appKey，创建应用后获得
erp string 否 目的地ERP，erp和tenantId是一组信息。目的地要么是erp要么是咚咚群号，必须二选一
tenantId string 否 枚举类型（CN.JD.GROUP，TH.JD.GROUP，ID.JD.GROUP，SF.JD.GROUP），分别为（国内、泰国、印尼、赛夫）租户
groupId string 否 目的地群号，咚咚群号
params object 是 发送内容
--robotId string 是 发送机器人
--body object 是 内容
--type string 是 消息类型
--content string 是 消息内容
requestId string 是 请求UUID，不能重复
dateTime long 否 请求时间戳
示例：
// 发送群
{
"appId": "xxxxx",
"requestId": "42134213123213123114114",
"dateTime": 1701742782616,
"groupId":"群id",
"params": {
"robotId": "机器人id",
"body": {
"type": "text",
"content":"您好，我是机器人"
}
}
}
// 发送个人
{
"appId": "xxxxx",
"erp": "用户erp",
"tenantId":"CN.JD.GROUP",
"requestId": "421342131232131231141",
"dateTime": 1701742782616,
"params": {
"robotId": "机器人id",
"body": {
"type": "text",
"content": "早上好"
}
}
}
群@用户消息
名称 类型 必填 描述
appId string 是 开放平台注册的应用appKey，创建应用后获得
erp string 否 目的地ERP，erp和tenantId是一组信息。目的地要么是erp要么是咚咚群号，必须二选一
tenantId string 否 枚举类型（CN.JD.GROUP，TH.JD.GROUP，ID.JD.GROUP，SF.JD.GROUP），分别为（国内、泰国、印尼、赛夫）租户
groupId string 否 目的地群号，咚咚群号
params object 是 发送内容
--robotId string 是 发送机器人
--body object 是
--type string 是 消息类型：text
--content string 是 消息内容（需增加@用户前缀）中间为特殊字符请复制
--atUsers object[] 是 数组
--app string 是 用户app, 国内:ee 泰国:th.ee 印尼:id.ee
--pin string 是 用户erp
--nickname string 是 用户昵称
dateTime long 否 请求时间戳
以上@人员之间间隔并非空格，而是（\u2005）编码，可以用如下代码生成
String interval =newString(newbyte[]{(byte)0xe2,(byte)0x80,(byte)0x85},Charset.forName("UTF-8"));
示例：
// @群内用户
{
"appId": "xxxxx",
"requestId": "42134213123213123114114",
"dateTime": 1701742782616,
"groupId": "群id",
"params": {
"robotId": "机器人id",
"body": {
"atUsers": [
{
"app": "ee",
"pin": "erp1",
"nickname": "用户1"
},
{
"app": "ee",
"pin": "erp2",
"nickname": "用户2"
}
],
"type": "text",
"content": "@用户1 @用户2 iOS和Android预发都连不上RTC"
}
}
}
// @群内全员
{
"appId": "xxxxx",
"requestId": "42134213123213123114114",
"dateTime": 1701742782616,
"groupId": "群id",
"params": {
"robotId": "机器人id",
"body": {
"atUsers": [
{
"app": "ee",
"pin": "all",
"nickname": "全体成员"
}
],
"type": "text",
"content": "@全体成员 早会了"
}
}
}
响应
响应体
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
—packetId string 消息唯一id
响应体示例
{
"code":0,
"msg":"成功",
"data":{
"packetId":"213das213dsa"
},
"success":true
}
即时通讯/
发送互动卡片消息
尝试一下
发送互动卡片消息
通过此接口可发送互动卡片消息。
说明：需要先在开放平台上创建应用，开通酷应用能力，并申请机器人能力以及发送接口 权限申请 。
限制：20 QPS/秒，1000 次/分
host信息见《API访问凭证》
京ME开放平台提供了可视化的互动卡片搭建工具，你不需要裸写卡片的 JSON 代码，通过拖拉拽的方式即可构建一张卡片。
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/sendJUEMsg
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
新版接口协议
通过此接口可发送京ME卡片平台搭建的卡片消息。
请求体
名称 类型 必填 描述
appId string 是 开放平台注册的应用appkey，创建应用后获得
erp string 否 目的地ERP，erp和tenantId是一组信息。目的地要么是erp要么是群号，必须二选一
tenantId string 否 枚举类型（CN.JD.GROUP，TH.JD.GROUP，ID.JD.GROUP，SF.JD.GROUP），分别为（国内、泰国、印尼、赛夫）租户
groupId string 否 目的地群号，京ME群号
requestId string 是 请求UUID，不能重复
dateTime long 否 请求时间戳
params object 是 发送内容
∟robotId string 是 机器人ID，创建机器人后获得
∟data object 是 消息体
∟∟reload bool 否 是否需要重新加载卡片数据，默认false。（卡片数据如果是千人千面的，则需要为true）
∟∟cardData object 否 卡片数据，业务自行定义，接口透传
∟∟∟templateCardId string 是 模版卡片ID，京ME卡片平台创建卡片后获得
∟∟∟templateCardVersion string 是 模版卡片版本号，京ME卡片平台创建的卡片，在卡片平台发布卡片后获得，卡片平台发布后需要在开放平台进行应用的发布上线才可
∟∟∟templateCardVariable object 是 业务参数，卡片平台搭建卡片时如果卡片绑定了变量，需要传对应变量值，如果没有绑定变量传{}
∟∟forward object 否 卡片转发配置，卡片消息转发时携带此字段，可以处理业务参数
∟∟∟reload bool 是 卡片转发后，是否需要重新从业务请求数据。（卡片数据如果是千人千面的，则需要为true）
∟∟∟cardData object 是 卡片转发后的卡片数据，如果reload为false，则直接使用cardData渲染卡片
∟∟callbackData object 否 卡片上按钮点击等doAction操作后，回传给业务服务端的数据，便于业务逻辑处理
∟∟at object 否 卡片中如果需要at群成员，则需要使用此字段
∟∟∟atAll bool 是 是否是at全体成员
∟∟∟users object[] 否 需要at的人员列表
∟∟∟∟app string 是 人员的租户，集团内为ee
∟∟∟∟pin string 是 人员的erp账号，例如huangzhen122
变量使用方式可参考：变量使用
请求体示例
{
"appId": "I70487c4SOnQDiptwdmC",
"dateTime": 1713787005940,
"erp": "qiuqi12",
"tenantId": "CN.JD.GROUP",
"params": {
"data": {
"cardData": {
"templateCardId": "chXYPq06H6LKAGeSXchkW",
"templateCardVersion": "0.0.15",
"templateCardVariable": {
"aiteren": "[我是超链接](https://me.jd.com/)",
"jiacu": "第二个加粗",
"title": "xiaxieed",
"hangneigaoliang": "`我是行内高亮`"
}
},
"forward": {
"reload": false
},
"reload": false
},
"robotId": "00_0b825d0f14c44e02"
},
"requestId": "11dc68d7-acc9-4aac-b3e4-3451adc86ece1"
}
响应
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
data
名称 类型 描述
cardMsgId string 消息id
datetime string 时间戳
响应体
{
"msg": "成功",
"code": 0,
"data": {
"packetId": "00_0b825d0f14c44e02-00000336-69e5317",
"datetime": 1751365745619,
"cardMsgId": "00_0b825d0f14c44e02-00000336-69e5317"
}
}
老版接口协议
请求体
名称 类型 必填 描述
appId string 是 开放平台注册的应用appkey，创建应用后获得
erp string 否 目的地ERP，erp和tenantId是一组信息。目的地要么是erp要么是群号，必须二选一
tenantId string 否 枚举类型（CN.JD.GROUP，TH.JD.GROUP，ID.JD.GROUP，SF.JD.GROUP），分别为（国内、泰国、印尼、赛夫）租户
groupId string 否 目的地群号，京ME群号
requestId string 是 请求UUID，不能重复
dateTime long 否 请求时间戳
params object 是 发送内容
∟robotId string 是 机器人ID，创建机器人后获得
∟data object 是 消息体
∟∟templateId string 是 预配置好的JUE模板ID，如果使用标准模板，使用templateMsgCard ；
如果是自己写JUE代码开发的话，从开发者后台创建卡片后获得。
∟∟templateType int 是 模板类型 1:普通
∟∟width_mode string 否 "width_mode":"wide", //卡片宽度类型，compact-最窄230px最宽360px,standard-最窄230px最宽600px,wide-最窄230px最宽780px
∟∟reload bool 否 是否需要重新加载卡片数据，默认false。（卡片数据如果是千人千面的，则需要为true）
∟∟summary string 否 摘要信息，如果为空，消息列表里展示： [卡片消息]
∟∟cardData object 否 卡片数据，业务自行定义，接口透传
∟∟forward object 否 卡片转发配置，卡片消息转发时携带此字段，可以处理业务参数
∟∟∟reload bool 是 卡片转发后，是否需要重新从业务请求数据。（卡片数据如果是千人千面的，则需要为true）
∟∟∟cardData object 是 卡片转发后的卡片数据，如果reload为false，则直接使用cardData渲染卡片
∟∟callbackData object 否 卡片上按钮点击等doAction操作后，回传给业务服务端的数据，便于业务逻辑处理
∟∟at object 否 卡片中如果需要at群成员，则需要使用此字段
∟∟∟atAll bool 是 是否是at全体成员
∟∟∟users object[] 否 需要at的人员列表
∟∟∟∟app string 是 人员的租户，集团内为ee
∟∟∟∟pin string 是 人员的erp账号，例如huangzhen122
示例：
{
"appId":"",
"erp":"",
"tenantId":"",
"groupId":"",
"params":{
"robotId":"",
"data":{
"templateId":"",
"templateType":1,
"width_mode":"wide", //卡片宽度类型，compact-最窄230px最宽360px,standard-最窄230px最宽600px,wide-最窄230px最宽780px
"reload":false,
"summary":"",
"params":"",
"cardData":{
},
"forward":{
"reload":false,
"cardData":{
}
},
"callbackData":{
"text":"hello JDME"
},
"at":{
"atAll":true,// at所有人
"users":[// at指定用户（atAll == false时使用）
{
"app":"ee",
"pin":"user1"
},
{
"app":"ee",
"pin":"user2"
}
]
}
}
},
"requestId":"",
"dateTime":1234567
}
请求体示例
以给huangzhen122发送消息为例：
{
"appId":"应用id",
"erp":"huangzhen122",
"tenantId":"CN.JD.GROUP",
"requestId":"uuid",
"dateTime":1688558656000,
"params":{
"robotId":"机器人id",
"data":{
"templateId":"template1234567",
"templateType":1,
"reload":false,
"summary":"",
"cardData":{
"key":"value"
},
"forward":{
"reload":false,
"cardData":{
"key":"value"
}
},
"callbackData":{
"key":"value"
}
}
}
}
响应
响应体
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
data
名称 类型 描述
cardMsgId string 消息id
datetime string 时间戳
响应体示例
{
"msg":"成功",
"code":0,
"data":{
"cardMsgId":"00_59fa6334ebec4783-00117244-be56c99",
"datetime":1688018930733
}
}
即时通讯/
发送互动卡片变更消息
尝试一下
发送互动卡片变更消息
通过此接口可发送互动卡片变更消息。
说明：需要先在开放平台上创建应用，并申请机器人能力。
限制：20 QPS/秒，1000 次/分
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/sendJUEChangeMsg
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
请求体
名称 类型 必填 描述
appId string 是 开放平台注册的应用(App Key)，创建应用后，查看"凭证与基础信息"
erp string 否 目的地ERP，erp和tenantId是一组信息。目的地要么是erp要么是咚咚群号，必须二选一
tenantId string 否 枚举类型（CN.JD.GROUP，TH.JD.GROUP，ID.JD.GROUP，SF.JD.GROUP），分别为（国内、泰国、印尼、赛夫）租户
groupId string 否 目的地群号，咚咚群号
params object 是 发送内容
requestId string 是 请求UUID，不能重复
dateTime long 否 请求时间戳
示例：
{
"appId":"",
"erp":"",
"tenantId":"",
"groupId":"",
"params":{
},
"requestId":"",
"dateTime":123456
}
params
名称 类型 必填 描述
robotId string 是 机器人ID，创建机器人后获得
sessionType int 是 会话类型
templateType int 是 模板类型
cardMsgId string 是 卡片消息ID
timestamp long 是 时间戳
to obj 否 单聊
—app string 否 用户app, 国内:ee 泰国:th.ee 印尼:id.ee
—pin string 否 用户erp
gid string 否 群聊id
groupUsers list 否 群聊，仅通知部分群成员， 不传默认通知全部群成员
cardId int 否 挂件卡片ID
示例：
{
"robotId":"00_adf12312312", //机器人ID 由应用发起的卡片变更可以不填
"to":{ //单聊传
"app":"ee",
"pin":"yangbo144"
},
"gid":"11102333", //群聊传
"groupUsers":[{ //仅通知部分群成员， 不传默认通知全部群成员
"app":"ee",
"pin":"liaoqianchuan"
}],
"sessionType":1, //会话类型
"templateType":1, //模板类型 1:消息卡片,3：消息挂件 （旧版使用）
"cardMsgId":"agsdfs123", //卡片原消息ID
"cardType":1, //模板类型 1:消息卡片，3：消息挂件
"cardId":1, //挂件卡片ID
"timestamp":11111111 //时间戳
}
完整请求体示例
以给huangzhen122发送消息为例：
{
"appId":"应用id",
"erp":"huangzhen122",
"tenantId":"CN.JD.GROUP",
"requestId":"uuid",
"dateTime":1688558656000,
"params":{
"robotId":"00_adf12312312", //机器人ID
"sessionType":1, //会话类型
"templateType:1, //模板类型
"cardMsgId":"agsdfs123", //卡片消息ID
"timestamp":11111111 //时间戳
}
}
响应
响应体
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
data
名称 类型 描述
cardMsgId string 消息id
datetime string 时间戳
响应体示例
{
"msg":"成功",
"code":0,
"data":{
}
}
变更的内容如何传递给卡片？
首先，需要在开发者后台配置回调服务地址，发送卡片变更消息之后，会触发卡片请求数据的回调，具体回调的协议参考文档京ME消息卡片交互事件回传。
即时通讯/
发送置顶卡片消息
尝试一下
发送置顶卡片消息
通过此接口可发送置顶卡片消息。
说明：需要先在开放平台上创建应用，并申请机器人能力。
限制：20 QPS/秒，1000 次/分
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/sendStickyCardMsg
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
请求体
名称 类型 必填 描述
appId string 是 开放平台注册的应用appkey，创建应用后获得
erp string 否 目的地ERP，erp和tenantId是一组信息。目的地要么是erp要么是咚咚群号，必须二选一
tenantId string 否 枚举类型（CN.JD.GROUP，TH.JD.GROUP，ID.JD.GROUP，SF.JD.GROUP），分别为（国内、泰国、印尼、赛夫）租户
groupId string 否 目的地群号，咚咚群号
params object 是 发送内容
requestId string 是 请求UUID，不能重复
dateTime long 否 请求时间戳
示例：
{
"appId":"",
"erp":"",
"tenantId":"",
"groupId":"",
"params":{
},
"requestId":"",
"dateTime":1234567
}
params
名称 类型 必填 描述
robotId string 是 机器人ID，创建机器人后获得
data object 是 消息体
示例：
{
"robotId":"00_adf12312312", //机器人ID 必传
"data":{
"templateId":"模板ID", //模板ID 必传
"reload":false, //重新加载卡片标识 可选
"cardData":{ //卡片数据 必传
"key":"value",
},
"forward":{ //转发信息 可选
"reload":true, //重新加载卡片标识
"cardData":{} //转发数据
},
"callbackData":{ //回传数据 可选
"xxx":"xxx",
}
}
}
完整请求体示例
{
"appId":"应用id",
"groupId":"10203909241",
"requestId":"uuid",
"dateTime":1688558656000,
"params":{
"robotId":"00_adf12312312", //机器人ID 必传
"data":{
"templateId":"模板ID", //模板ID 必传
"reload":false, //重新加载卡片标识 可选
"cardData":{ //卡片数据 必传
"key":"value",
},
"forward":{ //转发信息 可选
"reload":true, //重新加载卡片标识
"cardData":{} //转发数据
},
"callbackData":{ //回传数据 可选
"xxx":"xxx",
}
}
}
}
响应
响应体
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
data
名称 类型 描述
gid string 群id
cardMsgId string 消息id
resId int
响应体示例
{
"msg":"成功",
"code":0,
"data":{
"gid":"10203909241",
"cardMsgId":"00_59fa6334ebec4783-00117258-7764707",
"resId":253975
}
}
即时通讯/
发送置顶卡片变更消息
尝试一下
发送置顶卡片变更消息
通过此接口可发送置顶卡片变更消息。
说明：需要先在开放平台上创建应用，并申请机器人能力。
限制：20 QPS/秒，1000 次/分
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/sendStickyCardChangesMsg
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
请求体
名称 类型 必填 描述
appId string 是 开放平台注册的应用appkey，创建应用后获得
erp string 否 目的地ERP，erp和tenantId是一组信息。目的地要么是erp要么是咚咚群号，必须二选一
tenantId string 否 枚举类型（CN.JD.GROUP，TH.JD.GROUP，ID.JD.GROUP，SF.JD.GROUP），分别为（国内、泰国、印尼、赛夫）租户
groupId string 否 目的地群号，咚咚群号
params object 是 发送内容
requestId string 是 请求UUID，不能重复
dateTime long 否 请求时间戳
示例：
{
"appId":"",
"erp":"",
"tenantId":"",
"groupId":"",
"params":{
},
"requestId":"",
"dateTime":1234567
}
params
名称 类型 必填 描述
robotId string 是 机器人ID，创建机器人后获得
cardMsgId string 是 卡片ID 必传
resId string 是 置顶资源ID 必传
top bool 否 是否设置到首位显示 true:是，false:否 可选
示例：
{
"robotId":"00_adf12312312", //机器人ID 必传
"cardMsgId":"agsdfs123", //卡片ID 必传
"resId":12345, //置顶资源ID 必传
"top":false //是否设置到首位显示 true:是，false:否 可选
}
完整请求体示例
{
"appId":"应用id",
"groupId":"10203909241",
"requestId":"uuid",
"dateTime":1688558656000,
"params":{
"robotId":"00_adf12312312", //机器人ID 必传
"cardMsgId":"agsdfs123", //卡片ID 必传
"resId":12345, //置顶资源ID 必传
"top":false //是否设置到首位显示 true:是，false:否 可选
}
}
响应
响应体
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
响应体示例
{
"msg":"成功",
"code":0,
"data":{
}
}
即时通讯/
发送取消置顶卡片消息
尝试一下
发送取消置顶卡片消息
通过此接口可发送取消置顶卡片消息。
说明：需要先在开放平台上创建应用，并申请机器人能力。
限制：20 QPS/秒，1000 次/分
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/sendUnpinCardMsg
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
请求体
名称 类型 必填 描述
appId string 是 开放平台注册的应用appkey，创建应用后获得
erp string 否 目的地ERP，erp和tenantId是一组信息。目的地要么是erp要么是咚咚群号，必须二选一
tenantId string 否 枚举类型（CN.JD.GROUP，TH.JD.GROUP，ID.JD.GROUP，SF.JD.GROUP），分别为（国内、泰国、印尼、赛夫）租户
groupId string 否 目的地群号，咚咚群号
params object 是 发送内容
requestId string 是 请求UUID，不能重复
dateTime long 否 请求时间戳
示例：
{
"appId":"",
"erp":"",
"tenantId":"",
"groupId":"",
"params":{
},
"requestId":"",
"dateTime":1234567
}
params
名称 类型 必填 描述
robotId string 是 机器人ID，创建机器人后获得
cardMsgId string 是 卡片ID 必传
resId string 是 置顶资源ID 必传
top bool 否 是否设置到首位显示 true:是，false:否 可选
示例：
{
"robotId":"00_adf12312312", //机器人ID 必传
"cardMsgId":"agsdfs123", //卡片ID 必传
"resId":12345, //置顶资源ID 必传
"top":false //是否设置到首位显示 true:是，false:否 可选
}
完整请求体示例
{
"appId":"应用id",
"groupId":"10203909241",
"requestId":"uuid",
"dateTime":1688558656000,
"params":{
"robotId":"00_adf12312312", //机器人ID 必传
"cardMsgId":"agsdfs123", //卡片ID 必传
"resId":12345, //置顶资源ID 必传
"top":false //是否设置到首位显示 true:是，false:否 可选
}
}
创建群
机器人通过此接口创建群，此接口需要申请权限
备注: 单个应用每天创建上限 不超过100个
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/createGroup
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
参数
名称 类型 是否必须 长度 备注
name string 必须 40 群名称
notice string 非必须 3000 群公告
avatar string 非必须 300 群头像icon url只支持360buyimg.com
如：https://ddimg10.360buyimg.com/ee/jfs/t1/97010/17/48728/37779/65fab5b7F44819408/7960f4bef78aa4fa.jpg
intro string 非必须 200 群简介
owner object 必须 群主
—app string 必须 32 用户app ，国内:ee 泰国:th.ee 印尼:id.ee ，机器人: robot.dd
—pin string 必须 64 用户erp
members array 必须 群人数上限100，机器人上限5个 群成员，接口创建群时，会进行erp是否可被邀请的权限检查，如果设置的群主owner或者群成员members，不在邀请的范围内会返回错误
—app string 必须 32 用户app ，国内:ee 泰国:th.ee 印尼:id.ee
—pin string 必须 64 用户erp
uniqueKey string 必须 64 建群唯一key，如果相同则是重复群，拒绝创建
{
"appId": "oa",
"robotId":"00_8382034ad81f4761", // 机器人id
"erp": "zhangjiawei78",
"tenantId": "CN.JD.GROUP",
"params": {
"intro": "群简介",
"members": [
{
"app": "ee",
"pin": "xxxxxxx"
}
],
"name": "创建群测试5 ",
"notice": "群公告 ",
"owner": {
"app": "ee",
"pin": "xxxxxx"
},
"uniqueKey": "234r21fdasgfweagfads21321326"
},
"requestId": "13",
"dateTime": 1234567
}
返回
{
"code":0,
"data":{
"groupId":"10205099984",
"invalidMembers":[
]
},
"msg":"成功",
"success":true
}
即时通讯/
更新群信息
更新群信息
机器人通过此接口修改群信息
备注: 只级修改同一应用自己创建的群
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/updateGroup
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
参数
名称 类型 是否必须 长度 备注
groupId string 必须 40 群ID
name string 非必须 40 群名称
notice string 非必须 3000 群公告
avatar string 非必须 300 群头像iconurl地址
intro string 非必须 200 群简介
{
"appId": "xxxxappId",
"robotId":"00_8382034ad81f4761", // 机器人id
"params": {
"groupId": "10205099984",
"avatar": "群头像iconurl地址",
"intro": "群简介",
"name": "群名称 ",
"notice": "群公告 "
},
"requestId": "13",
"dateTime": 1234567
}
返回
{
"code":0,
"data": {
"groupId": "12345678"
}
"msg":"成功",
"success":true
}
即时通讯/
将用户或机器人拉入群聊
将用户或机器人拉入群聊
机器人通过此接口将用户或机器人拉入群聊
备注: 只能是app对应的机器人创建的群，才能拉人入群。被邀请的人需在app对应的消息发送范围内。
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/addGroupMember
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
参数
名称 类型 是否必须 长度 备注
robotId string 必须 32 机器人ID
groupId string 必须 40 群号
members array 必须 添加群成员上限100，机器人上限5个 邀请的群成员
—app string 必须 32 用户app ，国内:ee 泰国:th.ee 印尼:id.ee
—pin string 必须 64 用户erp
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"robotId":"00_8382034ad81f4761", // 机器人id
"params": {
"robotId":"00_8382034ad81f4761", // 机器人id
"groupId": "10208627771", // 群id
"members": [ // 新增成员
{
"app": "ee",
"pin": "zhaojun37"
}
]
},
"requestId": "234234234234342348",
"dateTime": 1321231231
}
返回
{
"code":0,
"data":{
"invalidMembers":[
]
},
"msg":"成功",
"success":true
}
即时通讯/
将用户或机器人移出群聊
将用户或机器人移出群聊
机器人通过此接口将用户或机器人移出群聊
备注: 只能是app对应的机器人创建的群，才能删除群成员。
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/kickOutGroup
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
参数
名称 类型 是否必须 长度 备注
robotId string 必须 32 机器人ID
groupId string 必须 40 群号
members array 必须 添加群成员上限100，机器人上限5个 邀请的群成员
—app string 必须 32 用户app ，国内:ee 泰国:th.ee 印尼:id.ee
—pin string 必须 64 用户erp
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"params": {
"robotId":"00_8382034ad81f4761",
"groupId": "10208632910",
"members": [
{
"app": "ee",
"pin": "zhangzhibin36"
}
]
},
"requestId": "234234234234342348",
"dateTime": 1321231231
}
返回
{
"code":0,
"data":{
"invalidMembers":[
]
},
"msg":"成功",
"success":true
}
即时通讯/
获取机器人所在的群
获取机器人所在的群
注：每个app查询频率不得大于10次/秒
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/getRobotGroup
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
参数
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"params": {
"pageNo": 1, //页号
"pageSize": 10, //分页大小，最大支持200
"robotId":"00_adf12312312" //机器人ID
},
"requestId": "234234234234342348",
"dateTime": 1321231231
}
返回
名称 类型 是否必须 默认值 备注
code number 必须 状态码
msg string 非必须 状态消息
data object 非必须 响应数据
—pageNo number 必须 页数，可能会与请求参数不一致，不建议使用。
—has_more boolean 必须 是否还有群未读取完
—groups object 非必须 群列表
——owner object 必须 群主
————app string 必须 用户app
————pin string 必须 用户pin
————name string 非必须 用户名称
——onlyOwnerAdd boolean 必须 是否仅群主可以添加人
——groupId string 必须 群号
——intro string 非必须 群简介
——name string 非必须 群名称
——avatar string 非必须 群头像
——canSearch boolean 非必须 是否可以被搜索
——notice string 非必须 群公告
{
"msg": "成功",
"code": 0,
"data": {
"pageNo": 2,
"hasMore": true,
"groups": [
{
"owner": {
"app": "robot.dd",
"pin": "app.ronklpqt"
},
"onlyOwnerAdd": false,
"groupId": "10208363463",
"intro": "",
"name": "黄震的开发者小助手",
"avatar": "https://eefs.jd.com/res/download/MrBQxWScF7qRwAEs6zofcsz0K.png?appKey=469ceef73b89853d",
"canSearch": false,
"notice": ""
}
]
}
}
即时通讯/
添加群管理员
添加群管理员
注：设置频率不得大于10次/秒。 不能设置群主为管理员；只能操作app自己创建的群，或该群的群主为app对应的机器人；设置的群管理员需为群成员；只支持10个管理员
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/addGroupAdmin
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
参数
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"robotId": "00_8382034ad81f4761",
"params": {
"groupId": "10211111", //群ID
"adminMember": { //管理员
"app": "ee", //国内erp为ee,机器人为robot.dd
"pin": "wanghaojie21"
}
},
"requestId": "234234234234342349123123123214",
"dateTime": 1321231231
}
返回
{
"code": 0, //返回码 0:成功，非0失败
"msg": "成功",
"data": {
"groupId": "12345678"
}
"success": true, //true:成功，false:失败
}
即时通讯/
撤回消息
撤回消息
注：每个app查询频率不得大于10次/秒
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/withdrawMsg
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
参数
名称 类型 是否必须 默认值 备注
packetId string 必须 传发送消息时返回的packetId
robotId string 必须 机器人id
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"robotId":"00_8382034ad81f4761",
"requestId": "42134213123213123116",
"dateTime": 1701742782616,
"params": {
"robotId": "00_8382034ad81f4761",
"packetId": "00_8382034ad81f4761-00020551-bd136ca"
}
}
返回
{
"code": 0, //返回码 0:成功，非0失败
"msg": "成功",
}
即时通讯/
以用户身份置顶群公告
以用户身份置顶群公告
注：每个app查询频率不得大于10次/秒
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/doTopNotice
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${user_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上UserAccessToken变量值。
参数
名称 类型 是否必须 默认值 备注
packetId string 必须 传发送消息时返回的packetId
robotId string 必须 机器人id
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"robotId":"00_8382034ad81f4761",
"requestId": "42134213123213123116",
"dateTime": 1701742782616,
"params": {
"content": "这是一条公告信息", //公告内容
"groupId":"10222222" //群号 必传
}
}
返回
字段 描述 类型 长度 是否必填 备注
code 返回码 int 16 是 0:成功
非0： 失败
msg 返回信息 String
success 成功标识 boolean true:成功
false:失败
data 返回数据 Object
--resId 置顶资源ID long 16 是 取消置顶的时候需要次参数
--ver 置顶的版本号 String 3000 content为空ongoing则置顶当前群的公告信息
{
"code": 0,
"msg": "成功",
"data":{
"resId": 1234, //置顶资源ID
"ver": 1 //置顶的版本号
}
}
即时通讯/
取消群公告置顶
取消群公告置顶
1.应用拥有取消群公告置顶的API接口权限。
2.必须是应用自己创建的群或者操作人是群主或者管理员.
注：每个app查询频率不得大于10次/秒
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/cancelTopNotice
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${user_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上UserAccessToken变量值。
参数
名称 类型 是否必须 默认值 备注
packetId string 必须 传发送消息时返回的packetId
robotId string 必须 机器人id
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"robotId":"00_8382034ad81f4761",
"requestId": "42134213123213123116",
"dateTime": 1701742782616,
"params": {
"resId": 13333, //置顶资源ID 必传
"groupId":"10222222" //群号 必传
}
}
返回
{
"code": 0,
"msg": "成功",
"success": true
}
即时通讯/
查询群信息
查询群信息
机器人通过此接口查询群信息
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/getGroupInfo
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
参数
名称 类型 是否必须 长度 备注
groupId string 必须 40 群ID
operator object 必须 操作者
-app string 必须 32 用户app ，国内:ee 泰国:th.ee 印尼:id.ee ，机器人: robot.dd
—pin string 必须 64 用户erp
mode int 非必须 模式类型，0：默认，1：包含群成员人数，2：基本信息
{
"appId": "xxxxxxxxxxx",
"robotId": "xxxxxxxxxxxxxx",
"requestId": "42134213123213123114",
"dateTime": 1701742782616,
"params": {
"groupId":"10211111", //群ID
"operator":{ //操作者
"app":"ee", //租户app
"pin":"yangbo144" //用户erp
},
"mode": 2 //模式类型，非必填 0：默认，1：包含群成员人数，2：基本信息
}
}
返回
{
"code":0,
"msg":"成功",
"data":{
"groupId":"1022332425", //群ID
"name":"杨波、孙铎春、王浩杰", //群名称
"intro":"群简介", //群简介
"notice":"群公共", //群公共
"avatar":"http://img30.360buyimg.com/f3dE7f44dcda/d454c616128cfb79.png",
"onlyOwnerAdd":true, //是否仅群组和管理者邀请入群
"canSearch":false, //是否能被搜索
"groupMember": true, //是否群成员
"identity": 0, //群成员身份 0：非群成员,1:群主，2：管理员，3：成员
"total":100, //群人数
"busType": 1, //群业务类型
"owner":{ //群主
"app":"ee", //群主租户app
"pin":"sunduochun", //群主erp
"name":"孙铎春" //群主名称
}
},
"success":true
}
即时通讯/
查询成员
查询成员
机器人通过此接口查询群成员
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/getGroupMembers
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
参数
名称 类型 是否必须 长度 备注
groupId string 必须 40 群ID
operator object 必须 操作者
-app string 必须 32 用户app ，国内:ee 泰国:th.ee 印尼:id.ee ，机器人: robot.dd
—pin string 必须 64 用户erp
mode int 非必须 模式类型，0：默认，1：包含群成员人数，2：基本信息
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"robotId":"00_8382034ad81f4761", // 机器人id
"params": {
"groupId": "10208363463",
"pageNo": 1,
"pageSize": 10,
"robotId": "00_8382034ad81f4761"
},
"requestId": "234234234234342347",
"dateTime": 132123123123213
}
返回
{
"msg": "成功",
"code": 0,
"data": {
"pageNo": 2,
"groupId": "10208363463",
"members": [
{
"app": "ee",
"pin": "ext.huangzhen6",
"identity": 3,
"name": "ext.huangzhen6"
},
{
"app": "robot.dd",
"pin": "app.ronklpqt",
"identity": 1,
"name": "app.ronklpqt"
}
],
"hasMore": false
}
}
即时通讯/
群是否存在
群是否存在
机器人通过此接口查询群是否存在
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/isGroupExist
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
参数
名称 类型 是否必须 长度 备注
groupId string 必须 40 群ID
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"params": {
"groupId": "10208363463"
},
"requestId": "234234234234342347",
"dateTime": 132123123123213
}
返回
{
"msg": "成功",
"code": 0,
"data": {
"exist": true,
"groupId": "10208363463"
}
}
即时通讯/
判断用户是否在群里
判断用户是否在群里
机器人通过此接口判断用户是否在群里
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/getEffectiveGroupId
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
参数
名称 类型 是否必须 长度 备注
groupIds list 必须 群ID列表
app string 必须 32 用户app ，国内:ee 泰国:th.ee 印尼:id.ee ，机器人: robot.dd
pin string 必须 64 用户erp
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"params": {
"app": "ee",
"pin": "ext.huangzhen6",
"groupIds": [
"10208363463"
]
},
"requestId": "234234234234342347",
"dateTime": 132123123123213
}
返回
{
"msg": "成功",
"code": 0,
"data": {
"app": "ee",
"pin": "ext.huangzhen6",
"groupIds": [
"10208363463"
]
}
}
即时通讯/
以用户身份添加群成员
以用户身份添加群成员
机器人通过此接口以用户身份添加群成员
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/transferGroupOwner
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${user_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上UserAccessToken变量值。
参数
名称 类型 是否必须 长度 备注
robotId string 必须 32 机器人ID
groupId string 必须 40 群ID
members list 必须 新群主
-app string 必须 32 用户app ，国内:ee 泰国:th.ee 印尼:id.ee ，机器人: robot.dd
-pin string 必须 64 用户erp
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"robotId": "00_8382034ad81f4761",
"erp": "liangjuntao.6",
"params": {
"robotId": "00_8382034ad81f4761",
"groupId": "10219969103", //群ID
"members": [
{
"app": "ee", //国内erp为ee,机器人为robot.dd
"pin": "yutao193"
}
]
},
"requestId": "123r12ge1gfe1fe12f12e1",
"dateTime": 1321231231
}
返回
{
"msg": "成功",
"code": 0,
"data": {
"invalidMembers": []
}
}
即时通讯/
以用户身份转让群主
以用户身份转让群主
机器人通过此接口以用户身份转让群主
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/transferGroupOwner
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${user_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上UserAccessToken变量值。
参数
名称 类型 是否必须 长度 备注
groupId string 必须 40 群ID
newOwner object 必须 新群主
-app string 必须 32 用户app ，国内:ee 泰国:th.ee 印尼:id.ee ，机器人: robot.dd
-pin string 必须 64 用户erp
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"robotId": "00_8382034ad81f4761",
"params": {
"groupId": "10219860974",
"newOwner": {
"app": "ee",
"pin": "xxxxxxx"
}
},
"requestId": "234234234234343123123215",
"dateTime": 1321231231
}
返回
{
"msg": "成功",
"code": 0,
"data": {
"groupId": "10219860974"
}
}
即时通讯/
以用户身份设置管理员
以用户身份设置管理员
机器人通过此接口以用户身份转让群主
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/userAddGroupAdmin
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${user_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上UserAccessToken变量值。
参数
名称 类型 是否必须 长度 备注
groupId string 必须 40 群ID
adminMember object 必须 群管理员
-app string 必须 32 用户app ，国内:ee 泰国:th.ee 印尼:id.ee ，机器人: robot.dd
-pin string 必须 64 用户erp
{
"appId": "Tb5Qx36pI1jugt0MxzbgJ",
"robotId": "00_8382034ad81f4761",
"params": {
"groupId": "10219969103", //群ID
"adminMember": { //管理员
"app": "ee", //国内erp为ee,机器人为robot.dd
"pin": "wujunhong.2"
}
},
"requestId": "234234234234342349123123123214",
"dateTime": 1321231231
}
返回
{
"msg": "成功",
"code": 0,
"data": {
"groupId": "10219969103"
}
}

鉴权管理/
API访问凭证
API访问凭证
API调用流程
业务系统调用开放平台的开放接口大致流程如下：
申请应用
在调用开放能力之前，首先需要在开放平台上创建一个应用，获得AppKey和AppSecret等信息。
申请权限
创建应用后，可申请需要的开放能力调用权限，审批通过后，获得openTeamId。
鉴权流程
鉴权参数
名称 类型 相关API 描述
appKey string getInnerCode
getAppAccessToken 应用标识，创建应用后获得
appSecret string getAppAccessToken 应用密钥，创建应用后获得
openTeamId string getTeamAccessToken 开放teamId， "凭证与基础信息" 查看，申请API调用权限或上线机器人后 自动分配
鉴权管理/
获取AppAccessToken
尝试一下
获取AppAccessToken
通过此接口获取appAccessToken。
说明：appAccessToken的最大有效期是 30 天。如果在有效期小于 10 分钟的情况下调用，会返回一个新的appAccessToken，此时两个appAccessToken都是有效的
注意：不需要每次请求，推荐缓存，缓存时间参考返回的expireIn字段。业务方如果频繁调用此接口，平台通知业务方后，会限制访问
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/auth/v1/app_access_token
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
请求体
名称 类型 必填 描述
appKey string 是 应用Key，创建应用后，查看 "凭证与基础信息"
appSecret string 是 应用秘钥，创建应用后，查看 "凭证与基础信息"
请求体示例
{
"appKey":"ngATnOTV3L0TOGA4y6ZGc",
"appSecret":"abcdefgHIJKLMN",
}
响应
响应体
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
data
名称 类型 描述
appAccessToken string appAccessToken
expireIn int appAccessToken有效时间，单位是秒
响应体示例
{
"code":0,
"msg":"success",
"data":{
"appAccessToken":"xxxx",
"expireIn":2592000
}
}
鉴权管理/
获取TeamAccessToken
尝试一下
获取TeamAccessToken
通过此接口获取teamAccessToken。
说明：teamAccessToken的最大有效期是 2 小时。如果在有效期小于 10 分钟的情况下调用，会返回一个新的teamAccessToken，此时两个teamAccessToken都是有效的。
注意：不需要每次请求，推荐缓存，缓存时间参考返回的expireIn字段。业务方如果频繁调用此接口，平台通知业务方后，会限制访问
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/auth/v1/team_access_token
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
请求体
名称 类型 必填 描述
appAccessToken string 是 通过getAppAccessToken接口获得
openTeamId string 是 开放teamId，"凭证与基础信息" 查看，申请API调用权限或上线机器人后 自动分配
请求体示例
{
"appAccessToken":"ngATnOTV3L0TOGA4y6ZGc",
"openTeamId":"abcdefgHIJKLMN",
}
响应
响应体
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
data
名称 类型 描述
teamAccessToken string teamAccessToken
expireIn int teamAccessToken有效时间，单位是秒
响应体示例
{
"code":0,
"msg":"success",
"data":{
"teamAccessToken":"xxxx",
"expireIn":2592000
}
}
鉴权管理/
获取当前登录人信息
尝试一下
获取当前登录人信息
服务端获取到当前登录人信息后， 自行生成token下发给前端， 也可以自行确定token的有效期， 这些逻辑业务方自行设计, 京 ME 平台不做限制。
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/auth/v1/access_token
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
请求体
名称 类型 必填 描述
appAccessToken string 是 通过获取AppAccessToken获取
code string 是 预授权码，前端通过requestAuthCode获取
请求体示例
//请求体：
{
"appAccessToken":"步骤3获取的appAccessToken",
"code":"步骤2获取的code，5分钟有效期，且只能使用一次"
}
响应
响应体
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
data
名称 类型 描述
thirdUserId string 用户thirdUserId
openTeamId string
avatarUrl string 用户头像
accessTokenExpireIn string 用户的accessToken过期时间
openUserId string 用户在应用内的唯一标识
accessToken string 用户的userToken
userId string
userCode string 用户Code
emplAccount string 用户账户（erp）， 如需进行erp比较，需要转成全小写
teamId string 租户id
name string 用户姓名
refreshTokenExpireIn string 用户的refreshToken过期时间
refreshToken string 用户的refreshToken
响应体示例
//返回结果：
{
"msg":"success",
"code":0,
"data":{
"thirdUserId":null,
"openTeamId":"5fb62ff8ff****83620723e46",
"avatarUrl":"https://img12.360buyimg.com/ee/jfs***fc05c2.jpg",
"accessTokenExpireIn":7200,
"openUserId":"d7356b36781b*****da0b5d2191",
"accessToken":"e747d117546****c01d23626ea71",
"userId":"3GPVi*****BHaA057",
"userCode":"006**461",
"emplAccount":"chen****8",//` 如需进行erp比较，需要转成全小写 `
"teamId":"00046419",
"name":"中文名字****",
"refreshTokenExpireIn":172800,
"refreshToken":"3236bfd64*****56ec412459ff5"
}
}
鉴权管理/
获取UserAccessToken
获取UserAccessToken
1. 概述
京ME内用户身份鉴权需使用UserAccessToken，受信息安全约束，该Token获取必须由用户在京ME体系内，在与京ME端或者入驻应用有交互行为时获取，并且有时效限制。京ME不提供无用户交互或者跳过京ME鉴权的用户身份获取方式，请您知晓。
如需使用用户身份鉴权，请按照本文档下述方式，分场景获取。
UserAccessToken用于以用户身份，调用开放api，mcp接口
userToken的最大有效期是 2 小时。如果在有效期小于 10 分钟的情况下调用，会返回一个新的userToken，此时两个userToken都是有效的。
注意：不需要每次请求，都走全流程，推荐缓存UserAccessToken值，缓存时间参考返回的expireIn字段。业务方如果频繁调获取接口，平台通知业务方后，会限制访问 获取UserAccessToken有以下场景：京ME客户端应用、MCP 。根据不同的业务场景，选择相应的获取方式
2. 京ME客户端-应用
通过应用入住方式（h5，小程序，消息快捷等），入住到京me客户端内部的业务
1. 通过JSSDK获取code
sdk参考文档：https://me.jd.com/openplatform/docs?docs=%2Fdocs%2FsfvUosbP4iu6iw8p6p9w%2FvDr2HmYHN0emzuxoBzyb%2F9RSroHYX7Mjr5RMW21sU%2Fb1jpMgtoGbJ4PGkj84qK&activeTab=native
2. 通过code获取 UserAccessToken
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/auth/v1/access_token
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
请求体
名称 类型 必填 描述
appAccessToken string 是 通过获取AppAccessToken获取
code string 是 预授权码，前端通过requestAuthCode获取
请求体示例
//请求体：
{
"appAccessToken":"步骤3获取的appAccessToken",
"code":"步骤2获取的code，5分钟有效期，且只能使用一次"
}
响应
响应体
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
data
名称 类型 描述
emplAccount string 用户账户（erp）， 如需进行erp比较，需要转成全小写
accessTokenExpireIn string 用户的UserAccessToken过期时间
accessToken string 用户的UserAccessToken
refreshTokenExpireIn string 用户的refreshToken过期时间
refreshToken string 用户的refreshToken
响应体示例
//返回结果：
{
"msg":"success",
"code":0,
"data":{
"emplAccount":"chen****8",//` 如需进行erp比较，需要转成全小写 `
"accessToken":"e747d117546****c01d23626ea71",
"accessTokenExpireIn":7200,
"refreshTokenExpireIn":172800,
"refreshToken":"3236bfd64*****56ec412459ff5"
}
}
3. 京ME客户端-MCP
在IM场域中，用户通过机器人交互，无业务前端接入，服务端直接使用mcp、api
1. 调用开放api获取code
说明
基本 说明
HTTP URL http://openme.jd.local/open-api/suite/v1/timline/userTokenAuthorize
HTTP Method POST
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
请求
参数名 必选 类型 说明
appId 是 String 应用ID
erp 是 String erp，例如："huangzhen122"
tenantId 是 String 租户ID，例如："CN.JD.GROUP"
requestId 是 String 请求ID，
dateTime 是 Long 请求时间戳（毫秒）
robotId 是 String 机器人ID
params 是 Object 参数对象，包含body和to两个子对象
params.body 对象
参数名 必选 类型 说明
data 是 Object 授权数据对象
pushType 是 String 推送类型，固定值："authorization"
params.body.data 对象
参数名 必选 类型 说明
appKey 是 String 应用密钥
eventId 是 String 事件ID
scopeList 是 Array 授权范围列表，例如：["im.sendMessageCard", "im.autobots", "joyspace"]
callbackParam 否 String 业务自定义参数，会推送给机器人回调地址
params.to 对象
参数名 必选 类型 说明
app 是 String 应用标识，例如："ee"
pin 是 String 用户标识
clientType 否 String 客户端类型
请求示例
{
"dateTime": 1754466724614,
"erp": "用户erp",
"requestId": "1754466724614",
"appId": "DSya5glhEBKFUS1N7sdH",
"tenantId": "CN.JD.GROUP",
"params": {
"to": {
"app": "ee",
"clientType": "mac",
"pin": "xn_taas_023"
},
"body": {
"data": {
"eventId": "689309a41aa5cd42c74df205",
"callbackParam": "call data test",
"appKey": "DSya5glhEBKFUS1N7sdH",
"scopeList": [
"im.sendMessageCard",
"joyspace",
"im.autobots",
"new.scope.test"
]
},
"pushType": "authorization"
}
},
"robotId": "机器人id"
}
响应
响应体
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
响应示例
{
"code": 0,
"data": {
"packetId": "19d65ebc-37b1-4abb-8058-99bae14fe565"
},
"msg": "成功"
}
2. 推送业务方code
用户确认授权后，京me服务会向开发者的机器人回调url推送 预授权码。消息格式如下：
{
"timeStamp": 1754382925359,
"eventId": "10195659418-100067-1754382925243", // 唯一请求标识，类似traceId
"appId": "DSya5glhEBKFUS1N7sdH", // 开发者的appKey
"client": "iPhone", // 授权人京me client端类型
"eventType": "im_robot_authorize", // 机器人usertoken授权事件
"clientVersion": "7.10.29", // 授权人京me客户端版本
"lang": "zh_CN",
"event": {
"sender": "chenxiaolong132",
"lang": "zh_CN",
"body": {
"actionData": {
"eventId": "6891c24cead5c2286f12d95e", // eventId,在事件订阅地址里会有这个
"code": "9b639b0e52a4475fa5d1b0a3a7031e74", // 预授权码code，可通过code换取usertoken
"action": "authorize", // 用户动作，点击授权同意 authorize,拒绝 reject
"callbackParam":"test text" // 开发者在事件订阅地址里给端上推送的自定义参数，在这里会透传给开发者的回调地址里
"expireIn": 300 // code的有效事件，单位秒
}
},
"operator": {
"app": "ee",
"pin": "chenxiaolong132" // 授权人erp
}
}
}
3. 通过code获取userToken
请求
基本 说明
HTTP URL http://openme.jd.local/open-api/auth/v1/access_token
HTTP Method POST
请求头
名称 类型 必填 描述
Content-Type string 是 固定值："application/json; charset=utf-8"
authorization string 是 Bearer ${team_access_token}其中，'Bearer' 是固定值，中间空一格，后面带上team_access_token变量值。
请求体
名称 类型 必填 描述
appAccessToken string 是 通过获取AppAccessToken获取
code string 是 预授权码，前端通过requestAuthCode获取
请求体示例
//请求体：
{
"appAccessToken":"步骤3获取的appAccessToken",
"code":"步骤2获取的code，5分钟有效期，且只能使用一次"
}
响应
响应体
名称 类型 描述
code int 错误码，非0取值表示失败
msg string 错误信息描述
data object 业务数据信息
data
名称 类型 描述
emplAccount string 用户账户（erp）， 如需进行erp比较，需要转成全小写
accessTokenExpireIn string 用户的UserAccessToken过期时间
accessToken string 用户的UserAccessToken
refreshTokenExpireIn string 用户的refreshToken过期时间
refreshToken string 用户的refreshToken
响应体示例
//返回结果：
{
"msg":"success",
"code":0,
"data":{
"emplAccount":"chen****8",//` 如需进行erp比较，需要转成全小写 `
"accessToken":"e747d117546****c01d23626ea71",
"accessTokenExpireIn":7200,
"refreshTokenExpireIn":172800,
"refreshToken":"3236bfd64*****56ec412459ff5"
}
}

## 代码示例1
```
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import {
  MessageResponse,
  SendMessageDto,
  AppAccessTokenResponse,
  TeamAccessTokenResponse,
} from './dto/send-message.dto';
import * as crypto from 'crypto';

interface TokenCache {
  token: string;
  expiresAt: number;
}

@Injectable()
export class MeRobotService {
  private readonly logger = new Logger(MeRobotService.name);
  private readonly baseUrl: string;
  private readonly authBaseUrl: string;
  private readonly appId: string;
  private readonly appKey: string;
  private readonly appSecret: string;
  private readonly openTeamId: string;
  private readonly robotId: string;
  private readonly isLocalDebug: boolean;

  // Token 缓存
  private appAccessTokenCache: TokenCache | null = null;
  private teamAccessTokenCache: TokenCache | null = null;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = 'http://openme.jd.local/open-api/suite/v1/timline/';
    this.authBaseUrl = 'http://openme.jd.local/open-api/auth/v1/';
    this.appId = 'w1jUTFZvmRfzp0v2dXTJ';
    this.appKey = 'w1jUTFZvmRfzp0v2dXTJ';
    this.appSecret = 'AB14yntTdnD1j0CQtKoU';
    this.openTeamId = '5f84e5947fc69caf6b7f1dcaca1d4b07';
    this.robotId = '00_6432a87fc90e4619';
    // 本地调试模式：设置环境变量 ME_ROBOT_LOCAL_DEBUG=true 来绕过实际发送消息
    this.isLocalDebug = process.env.ME_ROBOT_LOCAL_DEBUG === 'true';
    if (this.isLocalDebug) {
      this.logger.warn('⚠️ 本地调试模式已启用，消息将不会实际发送');
    }
  }

  /**
   * 发送机器人消息
   * https://me.jd.com/openplatform/docs?docs=%2Fdocs%2F7HVfrbOWhceS4Xasq50I%2F8QPvtQudnyw6eFHAiNDz%2FDHQgGtDpQbfBrIf5mvmC&activeTab=server
   */
  async sendMessage(dto: SendMessageDto): Promise<MessageResponse> {
    const url = `${this.baseUrl}${dto.type}`;

    // 如果 data.params 存在但没有 robotId，自动填充默认 robotId
    const data = dto.data as Record<string, unknown>;
    if (data.params && typeof data.params === 'object') {
      const params = data.params as Record<string, unknown>;
      if (!params.robotId) {
        params.robotId = this.robotId;
      }
    }

    // 构造完整的请求数据
    const sentData = {
      appId: this.appId,
      tenantId: 'CN.JD.GROUP',
      requestId: crypto.randomUUID(),
      dateTime: Date.now(),
      ...data,
    };

    this.logger.log(`请求 URL: ${url}`);
    this.logger.log(`请求数据: ${JSON.stringify(sentData)}`);
    this.logger.log(`原始 dto: ${JSON.stringify(dto)}`);

    // 本地调试模式：绕过实际发送，只打印日志
    if (this.isLocalDebug) {
      this.logger.warn('🔧 [本地调试模式] 跳过实际消息发送');
      this.logger.log(
        `📤 [本地调试模式] 消息内容:\n${JSON.stringify(sentData, null, 2)}`,
      );

      // 返回模拟的成功响应
      const mockResponse: MessageResponse = {
        success: true,
        message: 'success (local debug mode)',
        data: {
          messageId: `mock-${crypto.randomUUID()}`,
        },
      };
      this.logger.log(
        `✅ [本地调试模式] 模拟响应: ${JSON.stringify(mockResponse)}`,
      );
      return mockResponse;
    }

    const token = await this.getAuthToken();
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: token,
      };

      // 发送构造后的数据而不是原始 dto
      const response = await lastValueFrom(
        this.httpService.post<MessageResponse>(url, sentData, { headers }),
      );

      this.logger.log(`消息发送成功: ${JSON.stringify(response.data)}`);

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`发送机器人消息失败: ${errorMessage}`, errorStack);

      throw new Error(`机器人消息发送失败: ${errorMessage}`);
    }
  }

  /**
   * 获取授权 Token
   */
  private async getAuthToken(): Promise<string> {
    const teamAccessToken = await this.getTeamAccessToken();
    return `Bearer ${teamAccessToken}`;
  }

  /**
   * 获取 Team Access Token
   */
  private async getTeamAccessToken(): Promise<string> {
    // 检查缓存是否有效
    if (
      this.teamAccessTokenCache &&
      Date.now() < this.teamAccessTokenCache.expiresAt
    ) {
      this.logger.debug('使用缓存的 team_access_token');
      return this.teamAccessTokenCache.token;
    }

    try {
      const appAccessToken = await this.getAppAccessToken();
      const url = `${this.authBaseUrl}team_access_token`;

      const requestData = {
        appAccessToken,
        openTeamId: this.openTeamId,
      };

      this.logger.log('获取 team_access_token...');

      const response = await lastValueFrom(
        this.httpService.post<TeamAccessTokenResponse>(url, requestData),
      );

      // 检查响应状态
      if (response.data.code !== 0) {
        throw new Error(`获取 team_access_token 失败: ${response.data.msg}`);
      }

      const { teamAccessToken, expireIn } = response.data.data;

      if (!teamAccessToken) {
        throw new Error('获取 team_access_token 失败：响应中无 token');
      }

      // 缓存 token，使用 API 返回的过期时间，提前5分钟过期
      const expiresAt = Date.now() + (expireIn - 300) * 1000; // 提前5分钟过期
      this.teamAccessTokenCache = {
        token: teamAccessToken,
        expiresAt,
      };

      this.logger.log('team_access_token 获取成功并已缓存');
      return teamAccessToken;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`获取 team_access_token 失败: ${errorMessage}`);
      throw new Error(`获取 team_access_token 失败: ${errorMessage}`);
    }
  }

  /**
   * 获取 App Access Token
   */
  private async getAppAccessToken(): Promise<string> {
    // 检查缓存是否有效
    if (
      this.appAccessTokenCache &&
      Date.now() < this.appAccessTokenCache.expiresAt
    ) {
      this.logger.debug('使用缓存的 app_access_token');
      return this.appAccessTokenCache.token;
    }

    try {
      const url = `${this.authBaseUrl}app_access_token`;

      const requestData = {
        appKey: this.appKey,
        appSecret: this.appSecret,
      };

      this.logger.log('获取 app_access_token...');

      const response = await lastValueFrom(
        this.httpService.post<AppAccessTokenResponse>(url, requestData),
      );

      // 检查响应状态
      if (response.data.code !== 0) {
        throw new Error(`获取 app_access_token 失败: ${response.data.msg}`);
      }

      const { appAccessToken, expireIn } = response.data.data;

      if (!appAccessToken) {
        throw new Error('获取 app_access_token 失败：响应中无 token');
      }

      // 缓存 token，使用 API 返回的过期时间，提前1小时过期
      const expiresAt = Date.now() + (expireIn - 3600) * 1000; // 提前1小时过期
      this.appAccessTokenCache = {
        token: appAccessToken,
        expiresAt,
      };

      this.logger.log('app_access_token 获取成功并已缓存');
      return appAccessToken;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`获取 app_access_token 失败: ${errorMessage}`);
      throw new Error(`获取 app_access_token 失败: ${errorMessage}`);
    }
  }
}

```

## 代码示例2
```
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosResponse, AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { ApiRequestError } from 'src/utils/error';
import { CacheService } from './cache.service';
import { CustomLogger } from '../customLogger';

interface TokenResponse {
  code: number;
  msg: string;
  data: {
    appAccessToken?: string;
    teamAccessToken?: string;
    expireIn: number;
  };
}

// 缓存键常量
const APP_TOKEN_KEY = 'me_app_access_token';
const TEAM_TOKEN_KEY = 'me_team_access_token';

@Injectable()
export class MeService {
  private readonly meServer: string;
  private readonly appKey: string;
  private readonly appSecret: string;
  private readonly openTeamId: string;
  private readonly robotId: string;
  private logger = new CustomLogger();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {
    this.meServer = this.configService.get<string>('ME_SERVER') ?? '';
    this.appKey = this.configService.get<string>('ME_APPKEY') ?? '';
    this.appSecret = this.configService.get<string>('ME_APPSCRET') ?? '';
    this.openTeamId = this.configService.get<string>('ME_OPENTEAMID') ?? '';
    this.robotId = this.configService.get<string>('ME_ROBOTID') ?? '';

    if (!this.meServer || !this.appKey || !this.appSecret || !this.openTeamId) {
      throw new ApiRequestError('Missing required ME configuration');
    }
  }

  private async requestAppToken(): Promise<string> {
    const url = `${this.meServer}/open-api/auth/v1/app_access_token`;
    const { data } = await firstValueFrom<AxiosResponse<TokenResponse>>(
      this.httpService
        .post<TokenResponse>(url, {
          appKey: this.appKey,
          appSecret: this.appSecret,
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new ApiRequestError(`Failed to get AppAccessToken: ${error.message}`);
          }),
        ),
    );

    if (data.code !== 0 || !data.data.appAccessToken) {
      throw new ApiRequestError(`Failed to get AppAccessToken: ${data.code}-${data.msg}`);
    }

    return data.data.appAccessToken;
  }

  private async requestTeamToken(appAccessToken: string): Promise<string> {
    const url = `${this.meServer}/open-api/auth/v1/team_access_token`;
    const { data } = await firstValueFrom<AxiosResponse<TokenResponse>>(
      this.httpService
        .post<TokenResponse>(url, {
          appAccessToken,
          openTeamId: this.openTeamId,
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new ApiRequestError(`Failed to get TeamAccessToken: ${error.message}`);
          }),
        ),
    );

    if (data.code !== 0 || !data.data.teamAccessToken) {
      throw new ApiRequestError(`Failed to get TeamAccessToken:${data.code} - ${data.msg}`);
    }

    return data.data.teamAccessToken;
  }

  /**
   * 获取 App Access Token
   * @returns App Access Token
   */
  async getAppAccessToken(): Promise<string> {
    // 尝试从缓存获取
    const cachedToken = await this.cacheService.get(APP_TOKEN_KEY);
    if (cachedToken) {
      return cachedToken;
    }

    // 缓存中不存在或已过期，重新获取
    await this.refreshTokens();
    const newToken = await this.cacheService.get(APP_TOKEN_KEY);
    if (!newToken) {
      throw new ApiRequestError('Failed to get AppAccessToken after refresh');
    }
    return newToken;
  }

  /**
   * 获取 Team Access Token
   * @returns Team Access Token
   */
  async getTeamToken(): Promise<string> {
    // 尝试从缓存获取
    const cachedToken = await this.cacheService.get(TEAM_TOKEN_KEY);
    if (cachedToken) {
      return cachedToken;
    }

    // 缓存中不存在或已过期，重新获取
    await this.refreshTokens();
    const newToken = await this.cacheService.get(TEAM_TOKEN_KEY);
    if (!newToken) {
      throw new ApiRequestError('Failed to get TeamAccessToken after refresh');
    }
    return newToken;
  }

  /**
   * 刷新 App 和 Team Access Token
   */
  private async refreshTokens(): Promise<void> {
    this.logger.log(`Refreshing tokens`);

    // 获取 App Access Token
    const appTokenResponse = await firstValueFrom<AxiosResponse<TokenResponse>>(
      this.httpService
        .post<TokenResponse>(`${this.meServer}/open-api/auth/v1/app_access_token`, {
          appKey: this.appKey,
          appSecret: this.appSecret,
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new ApiRequestError(`Failed to get AppAccessToken: ${error.message}`);
          }),
        ),
    );

    if (appTokenResponse.data.code !== 0 || !appTokenResponse.data.data.appAccessToken) {
      throw new ApiRequestError(
        `Failed to get AppAccessToken: ${appTokenResponse.data.code}-${appTokenResponse.data.msg}`,
      );
    }

    const appAccessToken = appTokenResponse.data.data.appAccessToken;
    const appTokenExpireDate = new Date(Date.now() + appTokenResponse.data.data.expireIn * 1000);

    // 保存 App Access Token 到缓存
    await this.cacheService.set(APP_TOKEN_KEY, appAccessToken, appTokenExpireDate);

    // 获取 Team Access Token
    const teamTokenResponse = await firstValueFrom<AxiosResponse<TokenResponse>>(
      this.httpService
        .post<TokenResponse>(`${this.meServer}/open-api/auth/v1/team_access_token`, {
          appAccessToken,
          openTeamId: this.openTeamId,
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new ApiRequestError(`Failed to get TeamAccessToken: ${error.message}`);
          }),
        ),
    );

    if (teamTokenResponse.data.code !== 0 || !teamTokenResponse.data.data.teamAccessToken) {
      throw new ApiRequestError(
        `Failed to get TeamAccessToken:${teamTokenResponse.data.code} - ${teamTokenResponse.data.msg}`,
      );
    }

    const teamAccessToken = teamTokenResponse.data.data.teamAccessToken;
    const teamTokenExpireDate = new Date(Date.now() + teamTokenResponse.data.data.expireIn * 1000);

    // 保存 Team Access Token 到缓存
    await this.cacheService.set(TEAM_TOKEN_KEY, teamAccessToken, teamTokenExpireDate);
  }

  async sendMessage(erp: string, content: string): Promise<void> {
    const teamAccessToken = await this.getTeamToken();
    this.logger.log('eamAccessToken', teamAccessToken);
    const requestId = crypto.randomUUID();
    const dateTime = Date.now();
    const payload = {
      appId: this.appKey,
      erp,
      tenantId: 'CN.JD.GROUP',
      requestId,
      dateTime,
      params: {
        robotId: this.robotId, // 假设robotId与appKey相同
        body: {
          type: 'text',
          content,
        },
      },
    };
    this.logger.log('Sending message', payload);
    const url = `${this.meServer}/open-api/suite/v1/timline/sendRobotMsg`;
    const { data } = await firstValueFrom<AxiosResponse<TokenResponse>>(
      this.httpService
        .post<TokenResponse>(url, payload, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${teamAccessToken}`,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new ApiRequestError(`京ME发送消息失败: ${error.message}`);
          }),
        ),
    );

    if (data.code !== 0) {
      throw new ApiRequestError(`京ME发送消息失败:${data.code} - ${data.msg}`);
    }
  }

  /**
   * 发送消息给多个用户
   * @param recipients 接收消息的用户列表，多个用户使用逗号分隔
   * @param content 消息内容
   */
  async sendMessages(recipients: string, content: string): Promise<void> {
    const teamAccessToken = await this.getTeamToken();
    this.logger.log('teamAccessToken', teamAccessToken);

    // 解析接收用户列表
    const recipientList = recipients.split(',').map(erp => erp.trim());

    // 为每个用户发送消息
    for (const erp of recipientList) {
      const requestId = crypto.randomUUID();
      const dateTime = Date.now();
      const payload = {
        appId: this.appKey,
        erp,
        tenantId: 'CN.JD.GROUP',
        requestId,
        dateTime,
        params: {
          robotId: this.robotId,
          body: {
            type: 'text',
            content,
          },
        },
      };

      this.logger.log('Sending message to', erp, payload);

      const url = `${this.meServer}/open-api/suite/v1/timline/sendRobotMsg`;
      const { data } = await firstValueFrom<AxiosResponse<TokenResponse>>(
        this.httpService
          .post<TokenResponse>(url, payload, {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              Authorization: `Bearer ${teamAccessToken}`,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw new ApiRequestError(`京ME发送消息失败: ${error.message}`);
            }),
          ),
      );

      if (data.code !== 0) {
        throw new ApiRequestError(`京ME发送消息失败:${data.code} - ${data.msg}`);
      }

      this.logger.log(`Message sent successfully to ${erp}`);
    }
  }

  /**
   * 发送互动卡片消息
   * @param recipients 接收消息的用户列表，多个用户使用逗号分隔
   * @param cardData 卡片数据
   */
  async sendCardMessage(recipients: string, cardData: any): Promise<void> {
    const teamAccessToken = await this.getTeamToken();
    this.logger.log('teamAccessToken', teamAccessToken);

    // 解析接收用户列表
    const recipientList = recipients.split(',').map(erp => erp.trim());

    // 为每个用户发送卡片消息
    for (const erp of recipientList) {
      const requestId = crypto.randomUUID();
      const dateTime = Date.now();

      const payload = {
        appId: this.appKey,
        erp,
        tenantId: 'CN.JD.GROUP',
        requestId,
        dateTime,
        params: {
          robotId: this.robotId,
          data: {
            templateId: cardData.templateId || 'templateMsgCard',
            templateType: cardData.templateType || 1,
            width_mode: cardData.width_mode || 'wide',
            reload: cardData.reload || false,
            summary: cardData.summary || '[卡片消息]',
            cardData: cardData.cardData || {},
            forward: cardData.forward || {
              reload: false,
              cardData: {},
            },
            callbackData: cardData.callbackData || {},
            at: cardData.at || undefined,
          },
        },
      };

      this.logger.log('Sending card message to', erp, payload);

      const url = `${this.meServer}/open-api/suite/v1/timline/sendJUEMsg`;
      const { data } = await firstValueFrom<AxiosResponse<any>>(
        this.httpService
          .post<any>(url, payload, {
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              Authorization: `Bearer ${teamAccessToken}`,
            },
          })
          .pipe(
            catchError((error: AxiosError) => {
              throw new ApiRequestError(`京ME发送卡片消息失败: ${error.message}`);
            }),
          ),
      );

      if (data.code !== 0) {
        throw new ApiRequestError(`京ME发送卡片消息失败:${data.code} - ${data.msg}`);
      }

      this.logger.log(`Card message sent successfully to ${erp}, cardMsgId: ${data.data?.cardMsgId}`);
    }
  }
}

```