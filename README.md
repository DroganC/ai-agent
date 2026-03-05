# AI 工程大脑 - 工单智能派单可视化

模拟工厂 IT 运维工单从产生、流入 AI 大脑、智能分析后自动派发给员工坐席的全流程可视化页面。

## 技术栈

- React 18 (Function Component + Hooks)
- Vite 7
- Redux Toolkit
- TypeScript
- 原生 CSS + CSS 变量 + normalize.css

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

## 项目结构

```
src/
├── components/       # 页面组件
│   ├── AIBrain/      # AI 大脑核心区
│   ├── Connections/  # 模块/坐席与大脑连线
│   ├── EngineeringModule/
│   ├── PauseControl/
│   ├── SeatCard/
│   ├── StatsBar/
│   ├── TicketCard/
│   └── TicketLayer/  # 工单飞行层
├── store/            # Redux Toolkit 切片
│   ├── ticketsSlice.ts
│   ├── seatsSlice.ts
│   ├── statsSlice.ts
│   └── uiSlice.ts
├── hooks/
│   └── useGameLoop.ts # 工单生成、移动、派单逻辑
├── App.tsx
├── main.tsx
└── index.css
```

## 功能说明

- **左侧**：生产工程、质检工程、仓储工程、设备工程（按权重 60%/20%/15%/5% 随机生成工单）
- **中央**：AI 大脑呼吸/脉冲与数据流动画，处理中时显示派单逻辑提示
- **右侧**：8～10 个坐席网格，空闲/忙碌状态，工单到达后处理 5～8 秒
- **顶部**：工单总数、已处理数、派单成功率
- **右下角**：暂停/继续
- **悬停**：工单、工程卡片、坐席卡片可悬停查看详情
