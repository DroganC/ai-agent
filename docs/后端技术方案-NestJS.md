# 后端技术方案（NestJS）— 消防安全训练平台

**版本**：v1.0  
**日期**：2026-03-13  
**状态**：初稿  
**依据**：《产品需求文档》《前端技术方案》、现有前端 API 路径与类型定义

---

## 一、方案概述

基于产品需求与前端技术方案中的接口约定，采用 **NestJS + TypeScript** 实现消防安全训练平台后端。提供认证、用户与积分、场景/关卡、排行榜、挑战（attempts）、学习中心、积分商城等能力，与前端 `VITE_API_BASE=/api/v1` 及现有 service 调用保持一致，便于联调与扩展。

---

## 二、技术选型

| 类别         | 选择                    | 说明 |
|--------------|-------------------------|------|
| 运行时       | Node.js 18+             | LTS，与 NestJS 推荐一致 |
| 框架         | NestJS 10+              | 模块化、依赖注入、与 TypeScript 深度集成 |
| 语言         | TypeScript（strict）    | 与前端类型对齐、接口契约清晰 |
| 数据库       | 关系型（推荐 PostgreSQL） | 用户、关卡、成绩、排行榜、事务需求 |
| ORM          | TypeORM 或 Prisma       | 迁移、关联、事务；可按团队习惯二选一 |
| 缓存         | Redis（可选）           | 排行榜热点、会话/限流、日/周榜聚合 |
| 认证         | JWT（Bearer）           | 与前端 `Authorization: Bearer <token>` 一致 |
| 校验         | class-validator + class-transformer | DTO 校验与转换 |
| 文档         | Swagger/OpenAPI         | 与前端联调、契约先行 |
| 配置         | @nestjs/config          | 环境变量、多环境 |
| 日志         | 内置 Logger + 可选 Pino | 请求日志、错误追踪 |

---

## 三、整体架构

### 3.1 分层与模块

```
┌─────────────────────────────────────────────────────────────────┐
│                     HTTP / API Gateway (NestJS)                  │
│  Guard(JWT) / Interceptor(日志) / ExceptionFilter(响应约定)       │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│  Controllers (按领域划分)                                         │
│  Auth | Users | Scenes | Levels | Attempts | Leaderboards |      │
│  Learning | Store | Life | Revives                              │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│  Services (业务逻辑)                                              │
│  用户/积分/生命值 | 场景/关卡/解锁 | 挑战/结算/事件 | 排行榜 | ...   │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│  Repositories / Data Access (TypeORM/Prisma)                     │
│  Entity 定义、查询、事务                                          │
└─────────────────────────────────────────────────────────────────┘
                                    │
┌─────────────────────────────────────────────────────────────────┐
│  Database (PostgreSQL)  |  Redis (可选)                          │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 模块划分

| 模块           | 职责概要                         | 主要接口（与前端对齐） |
|----------------|----------------------------------|------------------------|
| **AuthModule** | 第三方 code 换 token、JWT 签发   | POST /auth/sessions（Body: code） |
| **UsersModule**| 当前用户信息、积分流水、复活、订单 | GET /users/me, /users/me/point-transactions, /users/me/life, POST /users/me/revives, GET/POST /users/me/orders |
| **ScenesModule** | 场景列表、模块列表             | GET /scenes, GET /scenes/:id/modules |
| **LevelsModule** | 关卡列表、关卡详情、解锁逻辑   | GET /modules/:id/levels, GET /levels/:id |
| **AttemptsModule** | 创建挑战、上报事件、结算、复盘 | POST /attempts, POST /attempts/:id/events, PATCH /attempts/:id, GET /attempts/:id/review |
| **LeaderboardsModule** | 排行榜（个人/全局/部门）     | GET /leaderboards?scope=personal&game_id&department_id&page&page_size |
| **LearningModule** | 学习分类、资料、学习记录       | GET /learning/categories, /learning/materials, POST /users/me/learning-records |
| **StoreModule** | 商品、订单（订单归属 users/me） | GET /store/items, GET/POST /users/me/orders |

---

## 四、统一响应与错误

### 4.1 成功响应：直接返回业务结果

**不**再包一层 `data`/`meta`，HTTP 状态码为 **200**（创建类接口可用 **201**），响应 body **直接为业务数据**。

示例：

- `GET /users/me` 成功 → `200`，body 即 `UserInfo` 对象（如 `{ id, name, department_name, ... }`）。
- `GET /scenes` 成功 → `200`，body 即 `Scene[]` 数组。
- `POST /auth/sessions` 成功 → `200`，body 即 `{ token, user }`。
- 列表类接口若需分页信息，可在 body 中直接带 `total`/`limit`/`offset` 等字段（与列表数据同级或约定固定结构），不强制 `meta` 包装。

Controller 层直接 `return` 业务对象或数组，**不要**用 Interceptor 再包成 `{ data, meta }`。

### 4.2 业务失败：含 `failed: true` 的对象

可预期、由业务规则或参数校验导致的失败（如 code 无效、今日复活已达上限、积分不足、关卡未解锁等），**HTTP 状态码仍为 200**，body 为统一结构：

```ts
{
  "failed": true,
  "code": "string",    // 业务错误码，如 LEVEL_NOT_FOUND、REVIVE_LIMIT_REACHED
  "message": "string"  // 可展示给用户的提示
}
```

前端通过判断 `response.failed === true` 识别业务失败并展示 `message`（或根据 `code` 做多语言/定制文案）。**不**使用 4xx 表示此类业务失败。

### 4.3 服务器错误：通过 HTTP 状态码返回

未预期的异常、依赖故障、超时等视为**服务器错误**，**直接使用 HTTP 状态码**表示，不依赖 body 中的 `failed`：

- **401 Unauthorized**：未登录或 token 无效/过期。
- **403 Forbidden**：无权限访问该资源。
- **404 Not Found**：资源不存在（也可用于“未找到”类业务，由前后端约定是否与 4.2 二选一）。
- **409 Conflict**：幂等冲突等。
- **422 Unprocessable Entity**：请求体/参数格式错误（可选，或与 4.2 合并为 200 + failed）。
- **500 / 502 / 503**：服务器内部错误、网关错误、服务不可用等。

此类响应可返回简单 JSON（如 `{ "message": "Internal Server Error" }`）或空 body，**以状态码为准**；前端根据状态码做跳转登录、重试或通用错误提示。

### 4.4 全局管道与守卫

- **ValidationPipe**：对 DTO 使用 class-validator，白名单过滤，避免多余字段。
- **JWT AuthGuard**：除 `POST /auth/sessions` 等白名单外，要求 `Authorization: Bearer <token>`，解析后注入 `user`（或 userId）供下游使用。
- **Idempotency**：对 POST /attempts、PATCH /attempts/:id、POST /users/me/revives、POST /users/me/orders 等使用 `x-idempotency-key` 头防重（可选中间件或 Guard 读 key 并配合 Redis/DB 去重）。

### 4.5 RESTful API 规范

所有接口遵循 REST 风格，约定如下：

- **资源即名词、集合用复数**：URL 表示资源，如 `/users`、`/scenes`、`/levels`、`/attempts`、`/leaderboards`，不使用动词。
- **HTTP 方法语义**：GET 查询、POST 创建、PATCH 部分更新、PUT 全量替换（按需）、DELETE 删除。
- **层级与从属**：子资源挂在父资源下，如 `/scenes/:id/modules`、`/modules/:id/levels`、`/users/me/point-transactions`、`/attempts/:id/events`；当前用户相关资源统一在 `/users/me` 下（如 `/users/me/orders`、`/users/me/revives`）。
- **路径参数**：统一使用 `:id`（必要时在文档中注明 id 含义，如「id：场景 id」）；层级中可写为 `/scenes/:id/modules`、`/attempts/:id/review`。
- **Query / Body 命名**：查询参数与请求体 JSON 字段使用 **snake_case**（如 `level_id`、`item_id`、`scope`、`page`、`page_size`）；响应体 JSON 同样建议 snake_case，与数据库/常见 REST 习惯一致。
- **过滤与分页**：列表类接口用 query 参数过滤（如 `scope=personal`、`game_id`、`department_id`、`page`、`page_size`），不把「个人榜」等写成路径段外的唯一入口，便于扩展。

---

## 五、API 与前端路径对照（RESTful）

前端 baseURL 为 `VITE_API_BASE || '/api/v1'`，以下路径均相对于 `/api/v1`。路径参数统一为 `:id`，请求/响应体字段使用 **snake_case**。

### 5.1 认证（会话资源）

| 方法 | 路径 | 说明 | 请求/响应要点 |
|------|------|------|----------------|
| POST | /auth/sessions | 用 code 创建会话（换 token） | Body: `{ code: string }`；成功 body 直接为 `{ token, user }`，user 含 id, name, department_name?, base_name?, total_score?, best_duration_ms?, points?, life? |

### 5.2 用户与当前用户子资源

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | /users/me | 当前用户信息（同上 user 结构） |
| GET  | /users/me/point-transactions | 当前用户积分流水列表；query: `limit?`, `offset?` |
| GET  | /users/me/life | 当前用户生命值信息，body: LifeInfo |
| POST | /users/me/revives | 创建一次复活（消耗任务或积分）；Body: `{ type: 'task' \| 'points' }`，头 x-idempotency-key |

### 5.3 场景与关卡（层级资源）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | /scenes | 场景列表，body: Scene[]（id, code, name, cover_url?） |
| GET  | /scenes/:id/modules | 指定场景下的模块列表，id 为场景 id；body: LevelModule[] |
| GET  | /modules/:id/levels | 指定模块下的关卡列表，id 为模块 id；body: Level[]（含 unlocked 等，由后端计算） |
| GET  | /levels/:id | 关卡详情，id 为关卡 id；body: Level |

### 5.4 挑战（attempts）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /attempts | 创建挑战；Body: `{ level_id: number }`，头 x-idempotency-key；成功 body: Attempt |
| POST | /attempts/:id/events | 上报某次挑战的事件；id 为 attempt id；Body: `{ events: AttemptEvent[] }` |
| PATCH| /attempts/:id | 结算/更新某次挑战；Body: Partial&lt;Attempt&gt;（含 status, end_at, duration_ms, score, fail_reason 等），头 x-idempotency-key |
| GET  | /attempts/:id/review | 某次挑战的复盘；body: AttemptReview（timeline） |

### 5.5 排行榜

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | /leaderboards | 排行榜列表；query: `scope?`（如 personal）、`game_id?`、`department_id?`、`page?`、`page_size?`；body: `{ items: LeaderboardItem[]; updated_at: string }` |

默认或 `scope=personal` 表示当前用户维度的个人榜；扩展支持单游戏/部门/分页。

### 5.6 学习中心

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | /learning/categories | 学习分类列表，body: LearningCategory[] |
| GET  | /learning/materials | 学习资料列表；query: `category_id?`；body: LearningMaterial[] |
| POST | /users/me/learning-records | 创建当前用户的学习记录；Body: `{ material_id, status: 'viewed' \| 'completed' }` |

### 5.7 积分商城

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | /store/items | 商品列表；query: `status?`（如 on）；body: StoreItem[] |
| POST | /users/me/orders | 当前用户下单（创建订单）；Body: `{ item_id: number }`，头 x-idempotency-key；成功 body: StoreOrder |
| GET  | /users/me/orders | 当前用户订单列表；query: `limit?`, `offset?`；body: StoreOrder[] |

---

## 六、数据模型（核心实体建议）

以下为与产品需求、前端类型一致的实体设计要点；**完整表结构、字段类型、索引与外键见第十三节「数据库表设计」**。

### 6.1 用户与组织

- **User**：id, external_id（第三方唯一标识）, name, department_id?, base_id?, created_at, updated_at。  
- **Department**：id, name, code?。  
- **Base**：id, name（基地）。  
- **UserStat**（或冗余在 User）：total_score, best_duration_ms, points, 以及生命值相关（见下）。

### 6.2 生命值与积分

- **Life**：与用户绑定，可存 user_id, life_count, daily_reset_date, today_revive_used, today_revive_limit；或通过配置表 + 日重置任务维护。  
- **PointTransaction**：id, user_id, change, balance_after, reason（如 level_pass, redeem）, created_at。  
- 积分变动：关卡通过时写入 PointTransaction 并更新 User 的 points；兑换时扣减并写流水。

### 6.3 场景与关卡

- **Scene**：id, code, name, cover_url?, order_no?。  
- **LevelModule**：id, scene_id, name, order_no。  
- **Level**：id, module_id, name, difficulty, game_type（steps \| quiz \| link-match \| llk \| challenge \| classify-challenge）, unlock_prev_level_id?, estimated_seconds?, reward_points, status。  
- 关卡解锁：根据用户在该关卡之前的关卡 best_score / 完成记录计算 unlocked，在 GET /modules/:id/levels 与 GET /levels/:id 的响应中返回。

### 6.4 挑战与成绩

- **Attempt**：id, user_id, level_id, status（in_progress \| passed \| failed \| aborted）, start_at, end_at?, duration_ms?, score?, fail_reason?, error_count?, key_error_count?, created_at。  
- **AttemptEvent**：可存 attempt_id, 事件 JSON 或拆表（event_type, step_id, knowledge_point, error_type, is_key_error, ts），用于复盘与统计。  
- 结算时：更新 Attempt；若 status=passed，更新或插入用户在该 level 的 best_score、best_duration_ms，并写 PointTransaction（reward_points）、更新 User 的 total_score/points。

### 6.5 排行榜

- 可基于 **Attempt** 与 **User** 聚合：按用户汇总 total_score、best_duration_ms（或按 game/level 维度）。  
- 入榜规则与需求一致：同分按用时更短排前，再按达成时间先后。  
- 部门榜：JOIN User.department_id / Department。  
- 若 QPS 高，可用 Redis 有序集合或定时任务将排行榜聚合结果写入缓存/汇总表。

### 6.6 学习与商城

- **LearningCategory**：id, parent_id?, name。  
- **LearningMaterial**：id, title, type（doc \| video \| image \| link）, category_id, url, status。  
- **LearningRecord**：user_id, material_id, status, created_at。  
- **StoreItem**：id, name, type（virtual \| physical）, cost_points, stock, status, cover_url?。  
- **StoreOrder**：id, user_id, item_id, status, cost_points, created_at。  
- 下单：校验库存与积分、扣减、写订单与 PointTransaction。

---

## 七、业务规则摘要

### 7.1 积分与成绩（与 PRD 5.1、5.2 一致）

- 基础分：关卡完成、题目正确、关键操作等累加。  
- 成绩记录：每局结束一条 Attempt，含 score、duration_ms 等。  
- 入榜：单局最高分或累计积分，周期可为日/周/月/总；并列时用时更短优先，再按达成时间。  
- 部门字段：部门名称必填展示（无则“未分配部门”），与个人主页、排行榜同一来源。

### 7.2 挑战与结算（与前端 classify-challenge、link-match 文档一致）

- fail_reason 枚举：timeout \| key_error \| manual_abort \| other。  
- 结算 PATCH 幂等：通过 x-idempotency-key 或 attempt.status 已终态则拒绝重复结算。  
- 通过时：更新用户在该关卡的 best_score / best_duration_ms、解锁下一关、发放 reward_points、写 PointTransaction。

### 7.3 生命值与复活

- 每日生命值重置、今日复活次数上限（如 3）与前端 mock 一致；复活接口按 type（task/points）扣减或完成任务校验。

---

## 八、目录结构建议（NestJS）

本项目后端代码置于**仓库根目录 `app/`** 下，与前端 `src/` 并列。结构建议如下：

```
app/
  src/
    app.module.ts
    main.ts
    common/                 # 公共
      decorators/           # @CurrentUser、@IdempotencyKey 等
      filters/              # 统一异常 Filter
      interceptors/         # 统一响应 Interceptor、logging
      guards/               # JwtAuthGuard、IdempotencyGuard
    config/                 # 配置模块
    auth/
      auth.module.ts
      auth.controller.ts
      auth.service.ts
      strategies/           # JWT、可选第三方 OAuth
    users/
      users.module.ts
      users.controller.ts
      users.service.ts
      dto/
      entities/
    life/                   # 或合并到 users
    scenes/
    levels/
    attempts/
    leaderboards/
    learning/
    store/
  test/
  package.json
  tsconfig.json
  .env.example
```

**文档审阅要点**（与产品需求、前端方案一致性）：接口与 PRD 功能模块对应；响应约定（成功直接返回、业务失败 200+failed、服务器错误 HTTP 状态码）与 RESTful 路径、snake_case、完整接口清单及数据库表设计已对齐；实现时以本方案与第十三节表结构为准。

---

## 九、安全与运维

### 9.1 安全

- 所有写操作与敏感读操作需 JWT 校验；token 过期返回 401，前端跳转登录。  
- 敏感接口（复活、下单、结算）建议限流（如 NestJS Throttler）。  
- 幂等：POST /attempts、PATCH /attempts/:id、POST /users/me/revives、POST /users/me/orders 使用 x-idempotency-key 防重复提交。  
- 部门/基地等敏感信息按权限过滤，与需求“部门口径一致”一致即可。

### 9.2 部署与扩展

- 无状态应用，可水平扩展；Session 若用 JWT 则无需共享 Session 存储。  
- 数据库连接池、慢查询与索引（如 attempts(user_id, level_id, status)、leaderboard 聚合所需索引）。  
- 日志与监控：请求 ID 贯穿日志，便于排查；可选 APM。  
- 后续扩展：培训管理端（班级、场次、报表）、多语言、更多游戏类型时，仅增模块与表，与现有 API 风格保持一致。

---

## 十、与前端联调约定

1. **Base URL**：前端 `VITE_API_BASE=/api/v1`，后端路由前缀 `api/v1`（或 Nginx 转发到 Nest 时保留前缀）。  
2. **RESTful**：所有接口按第四节 4.5 与第五节路径规范；路径参数统一 `:id`，请求体/查询参数与响应体字段使用 **snake_case**（如 `level_id`、`item_id`、`page_size`、`updated_at`）。  
3. **响应结构**：成功直接返回业务结果（无 data/meta 包装）；业务失败为 200 + `{ failed: true, code, message }`；服务器错误以 HTTP 状态码（401/403/404/5xx 等）表示。  
4. **类型**：核心 DTO 与前端 `types/api.ts` 中类型字段对齐（前端若沿用 camelCase 可在请求前做一层转换，或与后端约定统一 snake_case）。  
5. **认证**：登录调用 `POST /auth/sessions`，Body `{ code }`，成功后请求头带 `Authorization: Bearer <token>`。  
6. **幂等**：POST /attempts、PATCH /attempts/:id、POST /users/me/revives、POST /users/me/orders 需传 `x-idempotency-key`，后端识别并防重。

---

## 十一、实现顺序建议

1. **基础**：NestJS 工程、统一响应/异常、JWT Guard、Config、Logger。  
2. **Auth**：POST /auth/sessions（Body: code）与用户信息拉取（可先 mock 第三方或内建测试用户）。
3. **Users + Life**：GET /users/me、/users/me/point-transactions、/users/me/life，POST /users/me/revives。
4. **Scenes + Levels**：GET /scenes、/scenes/:id/modules、/modules/:id/levels、/levels/:id（含解锁逻辑）。
5. **Attempts**：POST /attempts（Body: level_id）、POST /attempts/:id/events、PATCH /attempts/:id、GET /attempts/:id/review，与结算、积分、解锁联动。
6. **Leaderboards**：GET /leaderboards?scope=personal，扩展 game_id、department_id、分页。
7. **Learning + Store**：GET /learning/categories、/learning/materials，POST /users/me/learning-records；GET /store/items，GET/POST /users/me/orders。
8. **文档与联调**：Swagger、与前端接口与类型对齐、错误码文档。

---

## 十二、完整接口清单

以下为相对 Base URL `/api/v1` 的完整接口规范，包含请求/响应结构与错误约定。除特别说明外，需在请求头携带 `Authorization: Bearer <access_token>`。

**响应约定**（与第四节一致）：**成功**时 HTTP 200/201，body **直接为业务结果**（无 `data`/`meta` 包装）；**业务失败**时 HTTP 仍为 200，body 为 `{ failed: true, code, message }`；**服务器/鉴权等错误**直接通过 HTTP 状态码（401/403/404/409/5xx）返回，body 可选简单说明。

### 12.1 认证（会话资源，RESTful）

| 项目 | 说明 |
|------|------|
| **方法·路径** | `POST /auth/sessions` |
| **鉴权** | 否（公开，用 code 创建会话换 token） |
| **幂等** | 建议同一 code 短时间内只可兑换一次 |
| **Body** | `{ code: string }` — 第三方/统一登录返回的授权码 |
| **成功 200** | body 直接为 `{ token: string; user: UserInfo }`；`UserInfo`: `id`, `name`, `department_name?`, `base_name?`, `total_score?`, `best_duration_ms?`, `points?`, `life?` |
| **业务失败 200** | body: `{ failed: true, code, message }`，code 如 `INVALID_CODE`、`CODE_EXPIRED`、`USER_NOT_FOUND` |
| **服务器/鉴权错误** | 直接返回 HTTP 状态码（如 401、5xx），body 可选 |

---

### 12.2 用户

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /users/me` |
| **鉴权** | 是 |
| **成功 200** | body 直接为 `UserInfo`（同上，含 `life`） |
| **业务失败** | 200 + `{ failed: true, code, message }`（若约定使用） |
| **鉴权错误** | 401，无 body 或简单 message |

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /users/me/point-transactions` |
| **鉴权** | 是 |
| **Query** | `limit?`、`offset?`（number，snake_case，默认 20/0） |
| **成功 200** | body 直接为 `PointTransaction[]`（单条: `id`, `change`, `balance_after`, `reason`, `created_at`）；分页时可在同层带 `total`/`limit`/`offset` |
| **鉴权错误** | 401 |

---

### 12.3 生命值与复活

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /users/me/life` |
| **鉴权** | 是 |
| **成功 200** | body 直接为 `LifeInfo`：`life_count`, `daily_reset_date` (YYYY-MM-DD), `today_revive_used`, `today_revive_limit` |
| **鉴权错误** | 401 |

| 项目 | 说明 |
|------|------|
| **方法·路径** | `POST /users/me/revives` |
| **鉴权** | 是 |
| **幂等** | 是，需请求头 `x-idempotency-key: <uuid>` |
| **Body** | `{ type: 'task' | 'points' }` |
| **成功 200** | body 直接为 `LifeInfo`（复活后最新状态） |
| **业务失败 200** | `{ failed: true, code, message }`，code 如 `REVIVE_LIMIT_REACHED`、`INSUFFICIENT_POINTS`（type=points 时） |
| **鉴权/冲突** | 401 未登录；409 幂等冲突（可选） |

---

### 12.4 场景与模块

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /scenes` |
| **鉴权** | 是（建议，或允许匿名看列表） |
| **成功 200** | body 直接为 `Scene[]`；单条: `id`, `code`, `name`, `cover_url?` |
| **鉴权错误** | 401 |

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /scenes/:id/modules` |
| **鉴权** | 是 |
| **Path** | `id` (number) — 场景 id |
| **成功 200** | body 直接为 `LevelModule[]`；单条: `id`, `scene_id`, `name`, `order_no` |
| **业务失败 200** | `{ failed: true, code, message }`，code 如 `SCENE_NOT_FOUND`；或 404 直接表示资源不存在 |

---

### 12.5 关卡

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /modules/:id/levels` |
| **鉴权** | 是 |
| **Path** | `id` (number) — 模块 id |
| **成功 200** | body 直接为 `Level[]`；单条含 `id`, `module_id`, `name`, `difficulty`, `game_type?`, `unlock_prev_level_id?`, `estimated_seconds?`, `reward_points`, `status`, `unlocked?`（后端计算）, `best_score?`, `best_duration_ms?` |
| **业务失败 200** | code 如 `MODULE_NOT_FOUND`；或 404 |

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /levels/:id` |
| **鉴权** | 是 |
| **Path** | `id` (number) — 关卡 id |
| **成功 200** | body 直接为 `Level`（同上，单条） |
| **业务失败 200 / 404** | code 如 `LEVEL_NOT_FOUND` 或直接 404 |

---

### 12.6 挑战（Attempts）

| 项目 | 说明 |
|------|------|
| **方法·路径** | `POST /attempts` |
| **鉴权** | 是 |
| **幂等** | 是，需请求头 `x-idempotency-key: <uuid>` |
| **Body** | `{ level_id: number }`（RESTful：snake_case） |
| **成功 201** | body 直接为 `Attempt`：`id`, `level_id`, `status`('in_progress'), `start_at`(ISO8601), `error_count?`, `key_error_count?` |
| **业务失败 200** | `{ failed: true, code, message }`，code 如 `LEVEL_NOT_FOUND`、`LEVEL_LOCKED` |
| **鉴权/冲突** | 401；409 幂等冲突（可选） |

| 项目 | 说明 |
|------|------|
| **方法·路径** | `POST /attempts/:id/events` |
| **鉴权** | 是 |
| **Path** | `id` (number) — attempt id |
| **Body** | `{ events: AttemptEvent[] }`；单条事件: `event_type`('step_ok'|'step_error'), `step_id`, `knowledge_point?`, `error_type?`('mis_touch'|'missed_step'|'wrong_order'|'timeout'|'other'), `is_key_error?`, `ts?`(ISO8601) |
| **成功 200** | 无 body 或空对象 `{}` |
| **业务失败 200** | code 如 `ATTEMPT_NOT_FOUND`、`ATTEMPT_ALREADY_SETTLED`、`VALIDATION_ERROR`；或 404/409 |

| 项目 | 说明 |
|------|------|
| **方法·路径** | `PATCH /attempts/:id` |
| **鉴权** | 是 |
| **幂等** | 是，需请求头 `x-idempotency-key: <uuid>`；若 attempt 已为 passed/failed/aborted 则拒绝重复结算 |
| **Path** | `id` (number) — attempt id |
| **Body** | `Partial<Attempt>`（snake_case）：`status?`, `end_at?`, `duration_ms?`, `score?`, `fail_reason?`, `error_count?`, `key_error_count?` |
| **成功 200** | body 直接为 `Attempt`（更新后完整对象） |
| **业务失败 200** | code 如 `ATTEMPT_NOT_FOUND`、`ATTEMPT_ALREADY_SETTLED`、`VALIDATION_ERROR` |
| **鉴权/冲突** | 401；409 幂等冲突（可选） |

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /attempts/:id/review` |
| **鉴权** | 是 |
| **Path** | `id` (number) — attempt id |
| **成功 200** | body 直接为 `AttemptReview`：`{ timeline: [...] }`；单条: `ts`, `step`, `result`('ok'|'error'), `knowledge_point?` |
| **业务失败 200** | code 如 `ATTEMPT_NOT_FOUND`；或 403/404（非本人/不存在） |

---

### 12.7 排行榜

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /leaderboards` |
| **鉴权** | 是 |
| **Query** | `scope?`（如 personal）、`game_id?`、`department_id?`、`page?`、`page_size?`（RESTful：snake_case） |
| **成功 200** | body 直接为 `{ items: LeaderboardItem[]; updated_at: string }`；单条: `user_id`, `name`, `department_name?`, `total_score`, `best_duration_ms`, `rank`, `is_me?` |
| **鉴权错误** | 401 |

---

### 12.8 学习中心

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /learning/categories` |
| **鉴权** | 是 |
| **成功 200** | body 直接为 `LearningCategory[]`；单条: `id`, `parent_id?`, `name` |
| **鉴权错误** | 401 |

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /learning/materials` |
| **鉴权** | 是 |
| **Query** | `category_id?` (number) — 不传则返回全部（snake_case） |
| **成功 200** | body 直接为 `LearningMaterial[]`；单条: `id`, `title`, `type`, `category_id`, `url`, `status` |
| **鉴权错误** | 401 |

| 项目 | 说明 |
|------|------|
| **方法·路径** | `POST /users/me/learning-records` |
| **鉴权** | 是 |
| **Body** | `{ material_id: number; status: 'viewed' | 'completed' }`（snake_case） |
| **成功 200** | 无 body 或空对象 `{}` |
| **业务失败 200** | code 如 `MATERIAL_NOT_FOUND`、`VALIDATION_ERROR`；或 404 |

---

### 12.9 积分商城

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /store/items` |
| **鉴权** | 是 |
| **Query** | `status?` (string, 默认 'on') — 上架状态筛选 |
| **成功 200** | body 直接为 `StoreItem[]`；单条: `id`, `name`, `type`, `cost_points`, `stock`, `status`, `cover_url?` |
| **鉴权错误** | 401 |

| 项目 | 说明 |
|------|------|
| **方法·路径** | `POST /users/me/orders` |
| **鉴权** | 是 |
| **幂等** | 是，需请求头 `x-idempotency-key: <uuid>` |
| **Body** | `{ item_id: number }`（RESTful：snake_case） |
| **成功 201** | body 直接为 `StoreOrder`：`id`, `item_id`, `status`, `cost_points`, `created_at`(ISO8601) |
| **业务失败 200** | `{ failed: true, code, message }`，code 如 `ITEM_NOT_FOUND`、`OUT_OF_STOCK`、`INSUFFICIENT_POINTS` |
| **鉴权/冲突** | 401；409 幂等冲突（可选） |

| 项目 | 说明 |
|------|------|
| **方法·路径** | `GET /users/me/orders` |
| **鉴权** | 是 |
| **Query** | `limit?`, `offset?`（snake_case） |
| **成功 200** | body 直接为 `StoreOrder[]`；分页时可同层带 `total`/`limit`/`offset` |
| **鉴权错误** | 401 |

---

### 12.10 错误码与 HTTP 状态约定

- **业务失败**：HTTP 仍为 **200**，body 为 `{ failed: true, code, message }`，下表「业务失败 code」用于 `code` 字段。
- **服务器/鉴权错误**：**直接返回 HTTP 状态码**（body 可选简单说明），下表「HTTP 状态」对应此类情况。

| 场景 | 返回方式 | 说明 |
|------|----------|------|
| 未登录 / token 无效 | **401** | 直接 HTTP 状态码 |
| 无权限 | **403** | 直接 HTTP 状态码 |
| 资源不存在（可选 404） | **404** 或 200+failed | 由前后端约定 |
| 幂等冲突等 | **409**（可选） | 直接 HTTP 状态码 |
| 服务器异常 | **500/502/503** | 直接 HTTP 状态码 |

**业务失败 code（200 + failed:true 时使用）**：`INVALID_CODE`、`CODE_EXPIRED`、`USER_NOT_FOUND`、`SCENE_NOT_FOUND`、`MODULE_NOT_FOUND`、`LEVEL_NOT_FOUND`、`LEVEL_LOCKED`、`ATTEMPT_NOT_FOUND`、`ATTEMPT_ALREADY_SETTLED`、`MATERIAL_NOT_FOUND`、`ITEM_NOT_FOUND`、`REVIVE_LIMIT_REACHED`、`INSUFFICIENT_POINTS`、`OUT_OF_STOCK`、`VALIDATION_ERROR` 等；`message` 为可展示给用户的提示文案。

---

## 十三、数据库表设计

以下为 PostgreSQL 风格建表说明，字段采用 **snake_case**；使用 TypeORM 时可用 `@Column({ name: 'xxx' })` 映射，或 ORM 配置统一转 snake_case。

### 13.1 枚举与常量

```sql
-- 若用 PostgreSQL 枚举类型（可选）
-- CREATE TYPE attempt_status AS ENUM ('in_progress', 'passed', 'failed', 'aborted');
-- CREATE TYPE attempt_fail_reason AS ENUM ('timeout', 'key_error', 'manual_abort', 'other');
-- CREATE TYPE game_type AS ENUM ('steps', 'quiz', 'link-match', 'llk', 'challenge', 'classify-challenge');
-- CREATE TYPE store_item_type AS ENUM ('virtual', 'physical');
-- CREATE TYPE learning_material_type AS ENUM ('doc', 'video', 'image', 'link');
```

应用层用 string 枚举即可，与前端 `api.ts` 一致。

---

### 13.2 用户与组织

**departments**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| name | VARCHAR(128) | N | - | 部门名称 |
| code | VARCHAR(64) | Y | - | 部门编码 |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

**bases**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| name | VARCHAR(128) | N | - | 基地名称 |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

**users**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| external_id | VARCHAR(128) | N | - | 第三方唯一标识（如 come 的 open_id），唯一 |
| name | VARCHAR(64) | N | - | 昵称/姓名 |
| department_id | BIGINT | Y | - | 关联 departments.id |
| base_id | BIGINT | Y | - | 关联 bases.id |
| total_score | INT | N | 0 | 累计总积分（排行榜口径） |
| best_duration_ms | BIGINT | Y | - | 全局最佳总用时（毫秒） |
| points | INT | N | 0 | 当前可用积分 |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

- 唯一约束：`UNIQUE(external_id)`
- 外键：`department_id REFERENCES departments(id)`，`base_id REFERENCES bases(id)`
- 索引：`idx_users_department_id`，`idx_users_external_id`

---

### 13.3 生命值与积分

**user_life**（每用户一条或按日一条，以下按“每用户一条”设计）

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| user_id | BIGINT | N | - | 关联 users.id，唯一 |
| life_count | SMALLINT | N | 3 | 当前生命值 |
| daily_reset_date | DATE | N | - | 上次重置日期（用于判断是否跨天重置） |
| today_revive_used | SMALLINT | N | 0 | 今日已用复活次数 |
| today_revive_limit | SMALLINT | N | 3 | 今日复活上限 |
| updated_at | TIMESTAMPTZ | N | now() | |

- 唯一约束：`UNIQUE(user_id)`
- 外键：`user_id REFERENCES users(id) ON DELETE CASCADE`

**point_transactions**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| user_id | BIGINT | N | - | 关联 users.id |
| change | INT | N | - | 变动值（正为增加，负为扣减） |
| balance_after | INT | N | - | 变动后余额 |
| reason | VARCHAR(64) | N | - | 如 level_pass, redeem, revive_points |
| created_at | TIMESTAMPTZ | N | now() | |

- 外键：`user_id REFERENCES users(id) ON DELETE CASCADE`
- 索引：`idx_point_transactions_user_id`，`idx_point_transactions_created_at`

---

### 13.4 场景与关卡

**scenes**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| code | VARCHAR(32) | N | - | 场景编码，唯一 |
| name | VARCHAR(128) | N | - | 场景名称 |
| cover_url | VARCHAR(512) | Y | - | 封面图 URL |
| order_no | INT | N | 0 | 排序 |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

- 唯一约束：`UNIQUE(code)`

**level_modules**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| scene_id | BIGINT | N | - | 关联 scenes.id |
| name | VARCHAR(128) | N | - | 模块名称 |
| order_no | INT | N | 0 | 排序 |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

- 外键：`scene_id REFERENCES scenes(id) ON DELETE CASCADE`
- 索引：`idx_level_modules_scene_id`

**levels**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| module_id | BIGINT | N | - | 关联 level_modules.id |
| name | VARCHAR(256) | N | - | 关卡名称 |
| difficulty | SMALLINT | N | 1 | 难度 1–5 |
| game_type | VARCHAR(32) | Y | - | steps/quiz/link-match/llk/challenge/classify-challenge |
| unlock_prev_level_id | BIGINT | Y | - | 前置关卡 id，NULL 表示无需解锁 |
| estimated_seconds | INT | Y | - | 建议时长（秒） |
| reward_points | INT | N | 0 | 通过奖励积分 |
| status | SMALLINT | N | 1 | 1 启用 0 禁用 |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

- 外键：`module_id REFERENCES level_modules(id) ON DELETE CASCADE`，`unlock_prev_level_id REFERENCES levels(id) ON DELETE SET NULL`
- 索引：`idx_levels_module_id`，`idx_levels_unlock_prev_level_id`，`idx_levels_status`

---

### 13.5 挑战与成绩（用户最佳记录）

**attempts**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| user_id | BIGINT | N | - | 关联 users.id |
| level_id | BIGINT | N | - | 关联 levels.id |
| status | VARCHAR(20) | N | - | in_progress / passed / failed / aborted |
| start_at | TIMESTAMPTZ | N | - | 开始时间 |
| end_at | TIMESTAMPTZ | Y | - | 结束时间 |
| duration_ms | BIGINT | Y | - | 用时（毫秒） |
| score | INT | Y | - | 得分 |
| fail_reason | VARCHAR(20) | Y | - | timeout / key_error / manual_abort / other |
| error_count | INT | N | 0 | 错误次数 |
| key_error_count | INT | N | 0 | 关键错误次数 |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

- 外键：`user_id REFERENCES users(id) ON DELETE CASCADE`，`level_id REFERENCES levels(id) ON DELETE CASCADE`
- 索引：`idx_attempts_user_id`，`idx_attempts_level_id`，`idx_attempts_status`，`idx_attempts_user_level_start (user_id, level_id, start_at)`（用于查询某关记录与排行榜聚合）

**attempt_events**（可选：事件落表便于复盘与统计）

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| attempt_id | BIGINT | N | - | 关联 attempts.id |
| event_type | VARCHAR(20) | N | - | step_ok / step_error |
| step_id | VARCHAR(64) | N | - | |
| knowledge_point | VARCHAR(256) | Y | - | |
| error_type | VARCHAR(32) | Y | - | mis_touch / missed_step / wrong_order / timeout / other |
| is_key_error | BOOLEAN | N | false | |
| ts | TIMESTAMPTZ | Y | - | 事件发生时间 |
| created_at | TIMESTAMPTZ | N | now() | |

- 外键：`attempt_id REFERENCES attempts(id) ON DELETE CASCADE`
- 索引：`idx_attempt_events_attempt_id`

也可将 events 存为 attempt 的 JSONB 列 `events_payload`，按查询与扩展需求二选一。

**user_level_best**（用户在某关卡的最佳成绩，用于解锁与展示 best_score/best_duration_ms）

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| user_id | BIGINT | N | - | 关联 users.id |
| level_id | BIGINT | N | - | 关联 levels.id |
| best_score | INT | Y | - | 该关最高分 |
| best_duration_ms | BIGINT | Y | - | 该关最短用时 |
| achieved_at | TIMESTAMPTZ | N | - | 达成时间（入榜排序用） |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

- 唯一约束：`UNIQUE(user_id, level_id)`
- 外键：`user_id REFERENCES users(id) ON DELETE CASCADE`，`level_id REFERENCES levels(id) ON DELETE CASCADE`
- 索引：`idx_user_level_best_user_id`，`idx_user_level_best_level_id`

---

### 13.6 学习中心

**learning_categories**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| parent_id | BIGINT | Y | - | 父分类 id，NULL 为顶级 |
| name | VARCHAR(128) | N | - | 分类名称 |
| order_no | INT | N | 0 | 排序 |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

- 外键：`parent_id REFERENCES learning_categories(id) ON DELETE SET NULL`

**learning_materials**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| title | VARCHAR(256) | N | - | 标题 |
| type | VARCHAR(16) | N | - | doc / video / image / link |
| category_id | BIGINT | N | - | 关联 learning_categories.id |
| url | VARCHAR(1024) | N | - | 资源链接 |
| status | SMALLINT | N | 1 | 1 上架 0 下架 |
| order_no | INT | N | 0 | 排序 |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

- 外键：`category_id REFERENCES learning_categories(id) ON DELETE CASCADE`
- 索引：`idx_learning_materials_category_id`，`idx_learning_materials_status`

**learning_records**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| user_id | BIGINT | N | - | 关联 users.id |
| material_id | BIGINT | N | - | 关联 learning_materials.id |
| status | VARCHAR(20) | N | - | viewed / completed |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

- 唯一约束：`UNIQUE(user_id, material_id)`（同一资料只保留一条最新状态，或按业务允许多条则去掉唯一）
- 外键：`user_id REFERENCES users(id) ON DELETE CASCADE`，`material_id REFERENCES learning_materials(id) ON DELETE CASCADE`
- 索引：`idx_learning_records_user_id`，`idx_learning_records_material_id`

---

### 13.7 积分商城

**store_items**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| name | VARCHAR(128) | N | - | 商品名称 |
| type | VARCHAR(16) | N | - | virtual / physical |
| cost_points | INT | N | - | 所需积分 |
| stock | INT | N | 0 | 库存 |
| status | SMALLINT | N | 1 | 1 上架 on 0 下架 |
| cover_url | VARCHAR(512) | Y | - | 封面图 |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

- 索引：`idx_store_items_status`

**store_orders**

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| user_id | BIGINT | N | - | 关联 users.id |
| item_id | BIGINT | N | - | 关联 store_items.id |
| status | VARCHAR(32) | N | - | pending / fulfilled / cancelled |
| cost_points | INT | N | - | 下单时扣减积分 |
| created_at | TIMESTAMPTZ | N | now() | |
| updated_at | TIMESTAMPTZ | N | now() | |

- 外键：`user_id REFERENCES users(id) ON DELETE CASCADE`，`item_id REFERENCES store_items(id) ON DELETE RESTRICT`
- 索引：`idx_store_orders_user_id`，`idx_store_orders_created_at`

---

### 13.8 幂等键（可选）

**idempotency_keys**（用于 POST /attempts、PATCH /attempts/:id、POST /users/me/revives、POST /users/me/orders）

| 列名 | 类型 | 可空 | 默认 | 说明 |
|------|------|------|------|------|
| id | BIGSERIAL | N | - | 主键 |
| key | VARCHAR(64) | N | - | x-idempotency-key 的值，唯一 |
| user_id | BIGINT | N | - | 谁发起的请求 |
| scope | VARCHAR(32) | N | - | 如 attempt_create / attempt_settle / revive / store_order |
| resource_id | BIGINT | Y | - | 创建出的资源 id（如 attempt_id、order_id） |
| created_at | TIMESTAMPTZ | N | now() | |

- 唯一约束：`UNIQUE(key)`
- 外键：`user_id REFERENCES users(id) ON DELETE CASCADE`
- 索引：`idx_idempotency_keys_key`；可设 TTL 清理过期 key（如 24 小时）

---

### 13.9 表与模块关系简图

```
departments, bases
       │
       ▼
users ◄──── user_life, point_transactions
  │
  ├── attempts ──► attempt_events
  │        │
  │        └── 结算后更新 user_level_best、users.points/total_score、point_transactions
  │
  ├── learning_records ◄── learning_materials ◄── learning_categories
  │
  └── store_orders ◄── store_items

scenes ──► level_modules ──► levels
                │
                └── unlock 依赖 user_level_best(前置关卡)
```

---

**说明**：本文档与《产品需求文档》《前端技术方案》及现有前端 services/types 对齐，可直接作为 NestJS 后端设计与实现的依据。第十二节为完整接口清单，第十三节为可直接落地的数据库表设计；ORM 实体与 DTO 可按本节字段生成。
