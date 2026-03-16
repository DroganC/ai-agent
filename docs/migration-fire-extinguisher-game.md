# 迁移计划：ai-fe-dashboard `/game/fire-extinguisher` → ai-agent 按 type 渲染连连看

## 一、目标

1. 将 **ai-fe-dashboard** 中的 `/game/fire-extinguisher`（灭火器连连看）迁移到 **ai-agent** 工程。
2. 在本工程中实现：**点「开始挑战」后，根据关卡/游戏的 `type`（如 `type="llk"` 或 `game_type="link-match"`）渲染不同游戏**；迁移完成后，可通过 `type="llk"` 或 `game_type="link-match"` 渲染该连连看游戏。
3. **迁移产物必须符合本工程的目录、导入、组件、样式与命名规范**（见第二节）。

---

## 二、本工程规范与约定（必须遵守）

以下为 ai-agent 当前约定，迁移时所有新增/修改文件均需符合。

### 2.1 目录与文件

- **页面**：每页独立目录，入口为 `index.tsx`（如 `src/pages/LevelPrepare/index.tsx`）。页面内若有子组件，放在该页目录下 `components/` 中。
- **通用组件**：`src/components/common/`（Page、Button、Loading、ErrorView 等）；**游戏组件**：`src/components/games/`，按玩法分子目录（如 `link-match/`），每玩法一个主组件文件（如 `LinkMatchGame.tsx`）。
- **不采用**：游戏子目录下无 `index.ts` 再导出；`renderGame` 通过 `lazy(() => import('./link-match/LinkMatchGame'))` 直接引用主组件文件。
- **服务/类型/状态**：`src/services/`、`src/types/`、`src/stores/`；若为某游戏独有，可放在该游戏目录下（如 `link-match/gameStore.ts`、`link-match/types.ts`）。

### 2.2 导入路径

- **一律使用相对路径**，不使用 `@/` 别名（本工程代码中未使用 path alias）。
- 从 `src/components/games/link-match/` 内引用时示例：
  - `Page`、`Button`、`Loading`：`../../common/Page`、`../../common/Button`
  - 游戏容器类型：`../renderGame`
  - 业务类型：`../../../types/api`
  - 图标：`../../../icons`
- Less 中 `@import` 也使用相对路径，指向本工程已有样式（如 `../../styles/variable.less` 或 `global.less` 已引入的变量）。

### 2.3 组件与 UI

- **布局**：游戏页必须使用本工程 `Page` 包裹（`<Page showTab={false}>`），与 StepsGame、QuizGame 一致。
- **按钮**：优先使用本工程封装的 `Button`（`src/components/common/Button.tsx`），支持 `variant="primary" | "secondary" | "ghost"`、`full`、`onClick`、`disabled`。若需 antd-mobile 原生能力（如 Toast、Modal、Card、Space），可继续使用 antd-mobile。
- **游戏组件接口**：必须实现 `GameRenderProps`（`level: Level`、`onExit: () => void`），**default export** 一个函数组件，供 `renderGame` 的 lazy 引用。
- **退出与返回**：提供「返回」或「退出」时调用 `onExit()`，由上层决定跳转（如回到 `level/:id/prepare`）。

### 2.4 样式

- **设计变量**：仅使用本工程 `src/styles/variable.less` 中已定义的 CSS 变量（`:root` 下的 `--color-*`、`--space-*`、`--font-*`、`--radius-*`、`--page-padding` 等）。不在本工程引入 ai-fe-dashboard 的 `@fe-*` 或单独 theme 文件。
- **类名**：尽量复用 global.less 中的工具类与区块类：`.screen`、`.stack`、`.row`、`.title`、`.subtle`、`.sectionTitle`、`.sectionCard`、`.actionPill` 等；游戏内联样式使用 `var(--font-body)`、`var(--color-text)`、`var(--space-2)` 等。
- **游戏专用样式**：若连连看有本工程变量无法覆盖的样式（如连线颜色、网格边框），可在 `variable.less` 的 `:root` 中**新增少量**语义化变量（如 `--game-link-line-stroke`、`--game-grid-border`），避免整份拷贝 `@fe-*` 主题。
- **作用域**：连连看专属样式放在 `link-match/` 下的 `.less` 文件中，使用带前缀的类名（如 `.link-match-game`、`.link-match-grid`）避免污染全局；该 less 在游戏入口组件中 `import './LinkMatchGame.less'`（或 `styles.less`）。

### 2.5 命名与 TypeScript

- **文件名**：组件 PascalCase（如 `LinkMatchGame.tsx`）；子模块小写（如 `gameStore.ts`、`types.ts`、`utils.ts`、`constants.ts`），与 stores/services 命名风格一致。
- **类型**：使用 `import type { ... }` 引入类型；导出类型用 `export type`。
- **严格模式**：保持 strict，无 `any`，函数有显式返回类型（如 `: void`、`: boolean`）。

---

## 三、两工程现状对比

### 3.1 ai-fe-dashboard（源）

| 项目 | 说明 |
|------|------|
| **路由** | `/` → 重定向 `/game/fire-extinguisher`；`/game/fire-extinguisher`、`/game/fire-equipment-rally` 各对应一个游戏组件 |
| **连连看模块** | `src/games/fire-extinguisher/`：`Game.tsx`、`gameStore.ts`、`types.ts`、`utils.ts`、`constants.ts`、`styles.less`、`index.ts` |
| **状态** | MobX `gameStore`（screen、grid、selected、pairsDone 等），`observer` 包裹组件 |
| **UI** | antd-mobile（Button、Toast），自管开始页/进行中/结束页，无「关卡/尝试」概念 |
| **样式** | `styles.less` 使用 `@import '../../theme/colors.less'`，依赖 `@fe-*` 变量（见 `src/theme/colors.less`） |
| **依赖** | react、react-router-dom、antd-mobile、mobx、mobx-react-lite、less |

### 3.2 ai-agent（目标）

| 项目 | 说明 |
|------|------|
| **路由** | `game/:gameId` → 重定向到 `level/:gameId/prepare`；`game/:gameId/play` → **GamePlay**（按 `level.game_type` 调用 `renderGame`）；`level/:id/prepare` → **LevelPrepare**（「开始挑战」→ `createAttempt` → 跳转 `level/:id/play`）；`level/:id/play` → **LevelPlay**（当前为步骤类 demo，写死 UI） |
| **游戏类型** | `GameType = 'steps' | 'quiz' | 'link-match' | 'challenge'`；`renderGame(type, { level, onExit })` 已存在，对 `link-match` 渲染占位组件 **LinkMatchGame** |
| **入口** | `LevelPrepare` 点「开始挑战」→ **level/:id/play**（未按 type 分支）；`GamePlay` 仅在 **game/:gameId/play** 使用，按 type 渲染 |
| **依赖** | 已有 antd-mobile、mobx、mobx-react-lite、less，无需新增包 |

**结论**：  
- 连连看逻辑可直接迁入 ai-agent，替换现有 **LinkMatchGame** 占位实现，并**按第二节规范**调整目录、导入、组件与样式。  
- 若希望「在关卡准备页点开始挑战后按 type 渲染不同游戏」，需要让 **level/:id/play** 也按 `level.game_type` 走统一游戏容器（见下文「入口与路由」）。

---

## 四、迁移范围清单（符合本工程规范）

### 4.1 需要拷贝并适配的文件（来自 ai-fe-dashboard → ai-agent）

| 源路径（dashboard） | 目标路径（本工程） | 规范要求 |
|---------------------|--------------------|----------|
| `fire-extinguisher/Game.tsx` | `src/components/games/link-match/LinkMatchGame.tsx` | 合并进现有入口文件：实现改为 fire-extinguisher 的 Game 逻辑，**default export**，接收 `GameRenderProps`；用 **相对路径** 引用 `../../common/Page`、`../../common/Button`、`../renderGame`、`../../../icons`；用 `<Page showTab={false}>` 包裹，按钮用本工程 `Button`；内部可继续用 antd-mobile 的 Toast、Card、Space。 |
| `fire-extinguisher/gameStore.ts` | `src/components/games/link-match/gameStore.ts` | 保持 MobX 单例；内部 `import` 使用相对路径引用同目录 `./types`。 |
| `fire-extinguisher/types.ts` | `src/components/games/link-match/types.ts` | 类型与常量；使用 `export type` / `export interface`，无 `@fe-*` 依赖。 |
| `fire-extinguisher/utils.ts` | `src/components/games/link-match/utils.ts` | 网格尺寸、可连判定、路径计算；`import type` 引用同目录 `./types`。 |
| `fire-extinguisher/constants.ts` | `src/components/games/link-match/constants.ts` | 动画/交互时长常量，纯数据。 |
| `fire-extinguisher/styles.less` | `src/components/games/link-match/LinkMatchGame.less` | **不引入** dashboard 的 `theme/colors.less`；改为 `@import '../../../styles/variable.less'`（从 link-match 到 src/styles 的相对路径）。将所有 `@fe-*` 替换为本工程变量（见 4.2）。类名加前缀如 `.link-match-game`、`.link-match-grid`，避免全局污染。 |

**不迁移**：  
- dashboard 的 `fire-extinguisher/index.ts`（本工程无游戏子目录 index 再导出习惯）。  
- dashboard 的 `src/theme/colors.less`（本工程不新增 `@fe-*` 主题，见第二节 2.4）。

### 4.2 样式变量映射（@fe-* → 本工程）

迁移后的 `LinkMatchGame.less` 中，将 dashboard 的 `@fe-*` 替换为本工程已有或新增变量（下表）。若本工程 `variable.less` 暂无对应语义，可在 `:root` 中**新增少量** `--game-*` 变量，避免整份拷贝主题。

| 原 @fe-*（dashboard） | 本工程用法 |
|------------------------|------------|
| `@fe-bg-base` / `@fe-bg-gradient` | `var(--color-bg)` 或 `var(--color-card)`；渐变可用 `var(--color-bg)` 单色或新增 `--game-bg-gradient` |
| `@fe-text-primary` | `var(--color-text)` |
| `@fe-text-secondary` / `@fe-text-muted` / `@fe-text-tip` | `var(--color-text-muted)` |
| `@fe-accent` / `@fe-accent-hover` / `@fe-accent-bg` | `var(--color-primary)` 及 rgba 变体，或新增 `--game-accent`、`--game-accent-bg` |
| `@fe-success` / `@fe-success-glow` | `var(--color-success)` |
| `@fe-border-subtle` / `@fe-border-cell` | `var(--wire-soft)` / `var(--hairline)` 或新增 `--game-border-cell` |
| `@fe-surface-overlay` / `@fe-surface-cell` | `var(--color-card)` 或 `var(--color-bg)` |
| `@fe-line-stroke` / `@fe-line-width` | 在 `variable.less` 新增 `--game-link-line-stroke`、`--game-link-line-width`（仅此游戏用） |

### 4.3 本工程需修改的已有文件

| 文件 | 修改内容 |
|------|----------|
| `src/types/api.ts` | 如需支持 `type="llk"`，在 `GameType` 中增加 `'llk'`（可选）。 |
| `src/components/games/renderGame.tsx` | 确认 `case 'link-match'` 渲染的为迁移后的 `LinkMatchGame`；若增加 `llk`，则 `case 'llk'` 渲染同一组件。 |
| `src/styles/variable.less` | 若采用 4.2 中「新增少量变量」，在 `:root` 中增加 `--game-link-line-stroke`、`--game-link-line-width`（及可选 `--game-accent-bg`、`--game-border-cell` 等）。 |
| （可选）`level/:id/play` 对应页面 | 若希望从关卡准备页「开始挑战」后按 type 渲染，见下文「入口与路由」。 |

---

## 五、type 与 game_type 约定

- **推荐**：继续使用现有 `GameType` 中的 **`link-match`** 表示连连看。后端/关卡配置中 `level.game_type === 'link-match'` 时，即渲染灭火器连连看。
- **可选**：若产品希望用 `type="llk"` 作为别名，可：
  - 在 `GameType` 中增加 `'llk'`；
  - 在 `renderGame` 中 `case 'llk'`: 与 `case 'link-match'` 渲染同一连连看组件。

迁移完成后，**通过 `game_type="link-match"` 或 `game_type="llk"`（若已加）即可渲染该连连看游戏**。

---

## 六、实现要点（对齐本工程规范）

### 6.1 组件适配 GameRenderProps（见 2.3）

- **入参**：`LinkMatchGame.tsx` 唯一默认导出组件，接收 `GameRenderProps`：`{ level: Level; onExit: () => void }`。
- **布局**：整页用 `<Page showTab={false}>` 包裹；开始页/进行中/结束页的按钮优先使用本工程 `Button`（`import { Button } from '../../common/Button'`），与 StepsGame 一致。
- **退出**：结束页提供「再玩一局」与「返回」；「返回」调用 `onExit()`。进行中若需退出，可提供头部返回按钮并调用 `onExit()`。
- **导入**：全部相对路径，例如 `import { Page } from '../../common/Page'`、`import { Button } from '../../common/Button'`、`import type { GameRenderProps } from '../renderGame'`、`import { Icon } from '../../../icons'`。

### 6.2 样式（见 2.4、4.2）

- **不引入** ai-fe-dashboard 的 `theme/colors.less` 或任何 `@fe-*` 文件。
- 迁移后的 `LinkMatchGame.less`：`@import '../../../styles/variable.less'`（从 `src/components/games/link-match/` 到 `src/styles/` 的相对路径）。类名使用前缀 `.link-match-game`、`.link-match-grid`、`.link-match-cell` 等；所有色/间距/圆角使用本工程 `var(--color-*)`、`var(--space-*)`、`var(--radius-*)` 或 4.2 表中新增的 `--game-*`。
- 若在 `variable.less` 新增 `--game-link-line-stroke` 等，仅新增游戏必需且本工程现有变量无法表达的项。

### 6.3 状态与生命周期

- **gameStore**：保持单例，放在 `link-match/gameStore.ts`；组件内 `import { gameStore } from './gameStore'`。每次进入游戏时由组件调用 `gameStore.restart()` 或 `startGame()` 重置。
- **卸载清理**：保留原 Game 中的 `useEffect` 清理 `timeoutIdsRef`/`intervalIdsRef`，避免内存泄漏。

### 6.4 入口与路由（「开始挑战」后按 type 渲染）

- **当前**：LevelPrepare → `level/:id/play`（LevelPlay 写死步骤 UI）；GamePlay 仅在 `game/:gameId/play` 按 `game_type` 渲染。
- **建议**：将 **level/:id/play** 改为游戏容器——拉取 `level`，若存在 `level.game_type`，则 `renderGame(level.game_type, { level, onExit })`，onExit 跳回 `level/:id/prepare`；否则保留现有 LevelPlay 步骤 demo。这样「开始挑战」后即按 type 显示连连看等游戏，且符合本工程单页入口 `index.tsx` 的约定。

---

## 七、迁移步骤建议（顺序执行，符合本工程规范）

1. **样式变量（可选）**  
   - 在 `src/styles/variable.less` 的 `:root` 中，按 4.2 表新增本工程暂无的变量（如 `--game-link-line-stroke`、`--game-link-line-width`）。若全部用现有 `--color-*` 等可表达则跳过。

2. **拷贝并放置子模块**  
   - 将 dashboard 的 `gameStore.ts`、`types.ts`、`utils.ts`、`constants.ts` 拷贝到 `src/components/games/link-match/`。  
   - 修改内部 import：统一改为相对路径，如 `from './types'`、`from './constants'`，不引用 dashboard 的 theme。

3. **样式文件**  
   - 将 dashboard 的 `styles.less` 拷贝为 `src/components/games/link-match/LinkMatchGame.less`。  
   - 第一行改为 `@import '../../../styles/variable.less'`（自 `link-match/` 到 `src/styles/` 的相对路径）。  
   - 根类名改为 `.link-match-game` 等带前缀类名；所有 `@fe-*` 按 4.2 表替换为 `var(--color-*)` / `var(--game-*)`。

4. **主组件**  
   - 用 fire-extinguisher 的 Game 逻辑替换 `LinkMatchGame.tsx` 内容；保留文件名与 default export。  
   - 增加 `GameRenderProps`（level、onExit）；用 `<Page showTab={false}>` 包裹；按钮改用本工程 `Button`；导入全部相对路径；在结束页/头部提供「返回」并调用 `onExit()`。  
   - 文件顶部 `import './LinkMatchGame.less'`（或 `./LinkMatchGame.less` 与当前命名一致）。  
   - 用 `observer` 包裹默认导出的组件。

5. **type 与 renderGame**  
   - 确认 `renderGame` 中 `case 'link-match'` 指向迁移后的 `LinkMatchGame`。  
   - 若需 `type="llk"`：在 `GameType` 中加 `'llk'`，在 `renderGame` 中 `case 'llk'` 渲染同一组件。

6. **（可选）统一 level/:id/play**  
   - 将 level/:id/play 对应页改为：拉取 level → 若 `level.game_type` 存在则 `renderGame(level.game_type, { level, onExit })`，onExit 跳回 `level/:id/prepare`；否则保留原步骤 UI。

7. **自测与回归**  
   - `game/:gameId/play` 且该关卡 `game_type` 为 `link-match`（或 `llk`）时，出现灭火器连连看；开始、消除、提示、重排、结束、退出正常。  
   - 若做了第 6 步：从 `level/:id/prepare` 点「开始挑战」进入 `level/:id/play`，对应关卡 `game_type` 为 `link-match` 时也应显示连连看。

---

## 八、风险与注意点

- **相对路径**：本工程统一使用相对路径，Less 中 `@import` 也使用相对路径指向 `../../styles/variable.less`，不依赖 `@/`。  
- **antd-mobile**：两工程版本接近，Toast/Modal/Card/Space 可继续使用；Button 对外统一用本工程 `Button`，与 StepsGame 一致。  
- **MobX**：本工程已有，直接使用；store 单例即可，无需 Context。  
- **关卡与尝试**：若后续需在游戏结束后上报 `settleAttempt`，需在 onExit 或结束页逻辑中接入 `attempts` 服务，并传入 level/:id/play 通过 state 带来的 `attemptId`（届时游戏容器需从 location.state 取 attemptId 并下传或用于 onExit）。

---

## 九、总结

- **迁移内容**：将 ai-fe-dashboard 的 fire-extinguisher 游戏逻辑与样式迁入 ai-agent 的 `link-match` 模块，**严格按本工程规范**：相对路径、Page/Button、variable.less 变量、带前缀类名、无 @fe-* 主题、default export GameRenderProps。  
- **type 约定**：`game_type="link-match"` 渲染连连看；可选 `game_type="llk"` 别名。  
- **「开始挑战」后按 type 渲染**：建议 level/:id/play 统一为按 `level.game_type` 调用 `renderGame`，实现从关卡准备页点「开始挑战」即按 type 显示不同游戏（如连连看）。

按上述步骤与第二节规范执行即可完成符合本工程约定的迁移。
