# 消防安全训练平台（移动端 H5）

面向企业/学校消防培训场景的互动学习平台，通过多款小游戏（答题、步骤操作、连连看、闯关等）提升消防安全知识与应急能力，内置排行榜与个人成长体系。

## 技术栈

- React 18 + TypeScript
- Vite 7
- MobX（mobx + mobx-react-lite）
- antd-mobile
- Less + CSS 变量（自定义主题，主色 `#0064ff`）
- @antv/f2 + @antv/f2-react（首页个人看板：最近 10 天柱状图+平滑折线图、双 Y 轴左局数右积分，Mock 数据）

## 环境要求

- Node.js ≥ 20.0.0
- npm ≥ 10.0.0

## 开发与构建

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

## 项目结构（简版）

```
src/
  app/
    router.tsx        # createBrowserRouter 路由表
    TabLayout.tsx     # 底部 Tab（首页/排行榜/我的）
    App.tsx
  pages/
    Home/
      index.tsx       # 首页：上半部个人信息 + F2 个人看板，下半部场景训练列表
      components/
        PersonalInfoCard.tsx
        PersonalDashboard.tsx   # @antv/f2 柱状+折线（最近10天、双Y轴、平滑曲线），Mock 数据
        LevelGroup.tsx
        LevelCard.tsx
    Leaderboard/
      index.tsx
      components/RankRow.tsx
    Profile/
      index.tsx
      components/QuickEntryGrid.tsx
    GameIntro/, GamePlay/, Levels/, LevelPrepare/, LevelPlay/, Settlement/,
    Store/, StoreOrders/, Learning/, LoginCallback/, Hall/
  components/
    common/           # Page, Button, BottomTab, Loading, ErrorView, AuthGuard, ...
    games/            # 真实游戏组件（react.lazy 动态加载）
      renderGame.tsx  # renderGame(type, props) 根据 game_type 渲染不同玩法
      steps/StepsGame.tsx
      quiz/QuizGame.tsx
      link-match/LinkMatchGame.tsx
      challenge/ChallengeGame.tsx
  stores/             # MobX RootStore + authStore + levelsStore 等
  services/           # API 调用封装（http 对象形式、按服务加 prefix）
    http.ts           # axios 实例 + 拦截器，请求格式：http.get({ url, params?, headers? })
    prefix.ts         # getApiPrefix(path)：为 ehs-backend 等请求加服务名前缀，其他服务可自建前缀方法
    auth.ts, user.ts, levels.ts, scenes.ts, attempts.ts, learning.ts, store.ts, life.ts, leaderboard.ts
  styles/             # Less 变量 + 全局样式
  mocks/              # Mock 数据与 mock API（VITE_USE_MOCK 开启时使用）
```

## 核心功能

- **首页**
  - 顶部个人信息卡片：头像首字、姓名、部门/基地、总积分/可用积分
  - 个人看板：使用 F2 绘制最近 10 天游戏记录（柱状=局数、折线=总积分平滑曲线，双 Y 轴，图例与标题同行；当前为 Mock 数据，可接入真实接口）
  - 场景训练：按场景/模块分组展示小游戏入口卡片，支持查看详情并进入游戏
- **排行榜**
  - 支持全部榜 & 本部门榜切换，高亮当前用户
- **个人主页**
  - 展示基本信息、成绩统计、快捷入口（学习中心 / 积分商城）、积分明细
- **游戏体系**
  - 游戏首页：展示玩法说明、积分口径示例、历史最佳成绩
  - 游戏内：通过 `game_type` + `renderGame(type)` 动态渲染不同玩法（步骤类、答题类、连连看、闯关等）
  - 关卡准备/结算：统一的 attempt 创建、事件上报与复盘时间线
