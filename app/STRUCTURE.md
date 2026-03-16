# app 目录结构说明（NestJS 最佳实践）

```
src/
├── main.ts                 # 应用入口：数据库初始化 → 创建 Nest 应用 → 全局管道/过滤器 → 监听端口
├── app.module.ts           # 根模块，仅聚合 Config / Database / modules 下各领域模块
├── config/                 # 统一配置（Nest 推荐：单一配置入口）
│   ├── configuration.ts   # 从 process.env 读取并返回 port、database、jwt、nodeEnv
│   └── index.ts
├── common/                 # 跨模块共享能力
│   ├── decorators/         # 如 @CurrentUser()
│   ├── dto/                # 如 FailedResponseDto
│   ├── filters/            # 全局 HTTP 异常过滤器
│   ├── guards/             # 如 JwtAuthGuard
│   └── utils/              # 如 parse-query
├── database/               # 数据层
│   ├── database.module.ts  # TypeORM 连接与实体注册
│   ├── bootstrap-database.ts  # 启动前建库（供 main 调用）
│   └── ensure-database.ts  # CREATE DATABASE IF NOT EXISTS
├── entities/               # TypeORM 实体（多模块共享，集中放置）
│   ├── index.ts
│   └── *.entity.ts
└── modules/                # 领域模块（统一放在同一父目录下）
    ├── auth/               # 认证：会话、JWT
    ├── users/              # 当前用户、积分、生命、订单、学习记录
    ├── scenes/             # 场景列表
    ├── levels/             # 关卡与模块（含 modules.controller）
    ├── attempts/           # 挑战创建 / 事件 / 结算 / 回放
    ├── leaderboards/        # 排行榜
    ├── learning/           # 学习分类与资料
    └── store/              # 商品列表（下单在 users）
```

## 约定

- **领域模块**：全部置于 `modules/` 下，每模块一个子文件夹，内含 `*.module.ts`、`*.controller.ts`、`*.service.ts`，可选 `dto/`、`strategies/` 等；模块内引用 `entities`、`common` 使用 `../../entities`、`../../common`。
- **配置**：环境变量与默认值集中在 `config/configuration.ts`，通过 `ConfigService.get('key')` 或 `get('database.port')` 使用；`database/bootstrap-database` 在 Nest 创建前执行，仍直接读 `process.env`。
- **实体**：多模块共用的实体放在 `entities/`，由 `DatabaseModule` 统一注册。
- **共享逻辑**：过滤器、守卫、装饰器、公共 DTO、工具函数放在 `common/`。
