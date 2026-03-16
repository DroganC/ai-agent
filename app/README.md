# 消防安全训练平台 API（NestJS）

后端技术方案见仓库 `docs/后端技术方案-NestJS.md`。

## 开发

1. 创建 MySQL 数据库（例如）：`CREATE DATABASE ehs_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. 复制 `.env.example` 为 `.env`，填写 `MYSQL_*`、`JWT_SECRET` 等。
3. 安装并启动：

```bash
cd app
npm install
npm run start:dev
```

接口基址：`http://localhost:3000/api/v1`。

开发环境下 TypeORM 会按实体自动同步表结构（`synchronize: true`）；生产环境请关闭 synchronize，使用迁移维护表结构。

## 环境变量

| 变量 | 说明 |
|------|------|
| MYSQL_HOST | MySQL 主机，默认 localhost |
| MYSQL_PORT | 端口，默认 3306 |
| MYSQL_USERNAME | 用户名 |
| MYSQL_PASSWORD | 密码 |
| MYSQL_DATABASE | 数据库名，默认 ehs_platform |
| JWT_SECRET | 生产环境务必更换 |
| JWT_EXPIRES_IN | 可选，默认 7d |

## 已实现接口（数据库，RESTful）

- **认证**：`POST /api/v1/auth/sessions` — Body: `{ "code": "string" }`，返回 `{ token, user }` 或 `{ failed, code, message }`。
- **用户**：`GET /api/v1/users/me`、`GET /api/v1/users/me/point-transactions`、`GET /api/v1/users/me/life`、`POST /api/v1/users/me/revives`（Body: `{ type: "task"|"points" }`，头 `x-idempotency-key`）、`GET /api/v1/users/me/orders`、`POST /api/v1/users/me/orders`（Body: `{ item_id }`，头 `x-idempotency-key`）、`POST /api/v1/users/me/learning-records`（Body: `{ material_id, status: "viewed"|"completed" }`）。
- **场景**：`GET /api/v1/scenes`、`GET /api/v1/scenes/:id/modules`。
- **关卡**：`GET /api/v1/modules/:id/levels`、`GET /api/v1/levels/:id`（返回含 `unlocked`、`best_score`、`best_duration_ms`）。
- **挑战**：`POST /api/v1/attempts`（Body: `{ level_id }`，头 `x-idempotency-key`）、`POST /api/v1/attempts/:id/events`（Body: `{ events: [...] }`）、`PATCH /api/v1/attempts/:id`（结算，头 `x-idempotency-key`）、`GET /api/v1/attempts/:id/review`。
- **排行榜**：`GET /api/v1/leaderboards`（query: `scope`、`game_id`、`department_id`、`page`、`page_size`）。
- **学习**：`GET /api/v1/learning/categories`、`GET /api/v1/learning/materials`（query: `category_id`）。
- **商城**：`GET /api/v1/store/items`（query: `status`）。

除 `POST /auth/sessions` 外，其余接口均需 Header `Authorization: Bearer <token>`。
