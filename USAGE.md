# Harness 使用指南

> 以 **24 点微信小程序（game24 域）** 为完整示例，说明如何用本仓库把「一个想法」收敛为「可验证的代码」。

---

## 目录

1. [这是什么](#1-这是什么)
2. [环境准备](#2-环境准备)
3. [每日命令速查](#3-每日命令速查)
4. [仓库地图](#4-仓库地图)
5. [核心工作流](#5-核心工作流)
6. [示例：24 点游戏从头到尾](#6-示例24-点游戏从头到尾)
7. [Subagent 调用手册](#7-subagent-调用手册)
8. [分层架构（写代码时）](#8-分层架构写代码时)
9. [验收与合并](#9-验收与合并)
10. [常见问题](#10-常见问题)

---

## 1. 这是什么

Harness 是一个 **Agent-First 工程模板**：用机械护栏（分层、测试、CI）约束 AI 写代码的范围，用 Spec 文档约束「这次只做什么」，用 Cursor Subagent 分工（需求、设计、实现、审查）。

两层含义：

| 名称 | 作用 |
|------|------|
| **Repo Harness** | 文档、分层、Spec、测试、CI —— 约束「写什么、怎么合进仓库」 |
| **Runtime Harness** | Cursor Subagent 编排 —— 约束「谁来做、按什么步骤做」 |

成熟度路线（必须按序，不要跳步）：

```text
Rule（护栏） → Spec（范围） → Loop（小步迭代） → Harness（评审 + CI）
```

你现在的仓库处于 **P1 完成**：Cursor compile、25 个 Subagent、`harness check`、基础 CI 均已就绪。

---

## 2. 环境准备

### 2.1 依赖

| 工具 | 版本建议 |
|------|----------|
| Node.js | 22.x |
| pnpm | 9.x |
| Cursor | 最新版（主 IDE） |

### 2.2 一次性初始化

在仓库根目录执行：

```sh
pnpm install
pnpm agents:compile
pnpm harness check
```

全部通过后，用 Cursor 打开本仓库，先读 [`AGENTS.md`](AGENTS.md)（Agent 地图，约 100 行）。

### 2.3 验证安装成功

```sh
pnpm harness check
```

预期输出包含：

```text
validate-souls OK (25 roles)
validate-missions OK (...)
Compile check OK
harness check OK
```

---

## 3. 每日命令速查

| 命令 | 何时用 |
|------|--------|
| `pnpm harness check` | **每次声称「做完了」之前** —— 校验 soul、编译漂移、跑测试 |
| `pnpm agents:compile` | 修改 `souls/` 或 `templates/mission/` 后，重新生成 `.cursor/agents/` |
| `pnpm harness validate-souls` | 只检查 SOUL 格式 |
| `pnpm harness validate-missions` | 只检查 mission 模板与 registry 一致性 |
| `pnpm harness compile -- --check` | 检查 compile 产物是否与源文件漂移 |
| `pnpm test` | 跑全部 Vitest |
| `pnpm test:boundary` | 只跑架构边界测试 |
| `pnpm lint` | ESLint |
| `pnpm check` | lint + test + harness check（根 package.json） |
| `pnpm dev` | 启动 demo-domain 示例（与 game24 无关） |

---

## 4. 仓库地图

```text
Harness/
├── AGENTS.md                    # T1：Agent 入口地图（先读这个）
├── USAGE.md                     # 本文档
├── policy/                      # 纪律：分层、Spec 契约、评审门禁
│   ├── layers.yaml              # 机器可读分层规则 → 边界测试
│   ├── spec-contract.md         # Spec 五问 + SDD 流程
│   └── never-do.md              # 全局禁止项
├── config/
│   ├── agents.registry.yaml     # 25 个 Subagent 注册表
│   └── domains.yaml             # 业务域（demo-domain、game24）
├── souls/<role>/SOUL.md         # 角色人格（源文件，勿改 .cursor/agents/）
├── templates/
│   ├── spec-five-questions.md   # Spec 模板
│   └── mission/*.mission.md     # 各角色任务剧本
├── .cursor/agents/*.md          # 编译产物 —— 用 /role名 调用
├── docs/exec-plans/active/      # 活跃 Spec 放这里
│   └── <domain>/<feature>/      # 例：game24/mvp/
├── packages/
│   ├── demo-domain/             # 参考实现（完整分层样板）
│   └── game24-miniprogram/      # 24 点小程序（进行中）
└── tools/harness-cli/           # compile / check / validate
```

### 已注册的业务域

| 域 ID | 代码路径 | Spec 路径前缀 |
|-------|----------|---------------|
| `demo-domain` | `packages/demo-domain/` | `docs/exec-plans/active/demo-domain/` |
| `game24` | `packages/game24-miniprogram/` | `docs/exec-plans/active/game24/` |

---

## 5. 核心工作流

### 5.1 总览

```text
┌─────────────────────────────────────────────────────────────────┐
│  Phase 0  产品澄清（可选但强烈推荐）                              │
│           /product-clarifier → 问题陈述 + in/out/deferred 表    │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 1  Spec 五问                                               │
│           复制 templates/spec-five-questions.md                  │
│           → docs/exec-plans/active/<domain>/<feature>/           │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 2  SDD 文档链（每步后可 /spec-judge 闸门）                 │
│           requirements → design → tasks                          │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  Phase 3  实现与验证                                              │
│           /spec-impl + /spec-test → /reviewer → harness check    │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Spec 五问（每个 feature 必须有）

1. **Solve** —— 这次交付什么
2. **Do not solve** —— 明确不做什么
3. **Allowed surfaces** —— 允许改哪些路径
4. **Frozen contracts** —— 不能破坏的类型/API
5. **Done when** —— 验收命令（通常是 `pnpm harness check`）

模板：[`templates/spec-five-questions.md`](templates/spec-five-questions.md)

### 5.3 Loop 原则

1. **小步**：每轮只做 tasks.md 里的一两个 task
2. **外置状态**：进度写在 Spec 目录或 `artifacts/progress/`（可选）
3. **红灯停**：CI 或 `harness check` 失败时，先修再继续扩 scope
4. **Done when 即停**：Spec 里写的命令绿了，这一轮结束

---

## 6. 示例：24 点游戏从头到尾

以下假设你要做 **game24 域的 MVP**：微信小程序版 24 点，第一版能出题、能判对错、能记本地分数。

> **当前仓库状态**：`game24` 已在 `config/domains.yaml` 和 `policy/layers.yaml` 注册，代码仅有 `packages/game24-miniprogram/src/providers/score-store.ts`  stub，**尚无 active Spec**。下面是从零开始的完整路径。

---

### Step 0：确认域已注册（已完成，了解即可）

`config/domains.yaml` 中已有：

```yaml
game24:
  paths:
    - "packages/game24-miniprogram/**"
  layers_root: packages/game24-miniprogram/src
  spec_prefix: docs/exec-plans/active/game24
```

分层规则在 `policy/layers.yaml` 的 `game24` 段，与 demo-domain 相同：

```text
types → config → repo → service → runtime → ui
跨切面：providers/（仅可 import types, config）
```

---

### Step 1：产品澄清 —— `/product-clarifier`

在 Cursor 新对话中输入（可复制修改）：

```text
/product-clarifier

我要描绘 game24 域的 24 点微信小程序 MVP。
Spec 路径：docs/exec-plans/active/game24/mvp/

初步想法：
- 经典 4 张牌凑 24，运算符 + - × ÷，可括号
- 用户点选数字和运算符组成算式
- 答对/答错有反馈，本地记录胜率
- 第一版不做：登录、排行榜、分享、音效、后端

请先问我澄清问题，产出：
1. 一句话 problem statement
2. in / out / deferred 范围表
不要写 requirements 或 design。
```

**你要做的**：回答它的问题，直到产出清晰的范围表。**人工确认**后再进入 Step 2。

---

### Step 2：写 Spec 五问

创建目录和文件：

```sh
mkdir -p docs/exec-plans/active/game24/mvp
cp templates/spec-five-questions.md docs/exec-plans/active/game24/mvp/spec.md
```

编辑 `docs/exec-plans/active/game24/mvp/spec.md`，示例内容：

```markdown
# Spec: game24-mvp

## 1. Solve
微信小程序 24 点 MVP：随机 4 张牌（1–13），用户点选组成算式，
系统判定是否等于 24；记录本地胜率（wins/attempts）。

## 2. Do not solve
- 用户登录 / 微信授权
- 排行榜、分享、好友对战
- 后端 API、云存储
- 音效、动画（除简单文字反馈）
- 提示 / 解题 / 保证有解的算法（第一版可换题）

## 3. Allowed surfaces
- docs/exec-plans/active/game24/mvp/**
- packages/game24-miniprogram/**
- policy/domains/game24.md（新建）
- tests/**（若新增 game24 相关测试）

## 4. Frozen contracts
- policy/layers.yaml 中 game24 分层方向不可反转
- ScoreRecord 类型字段：{ wins: number; attempts: number }

## 5. Done when

\`\`\`sh
pnpm harness check
pnpm test:boundary
\`\`\`

附加（人工）：微信开发者工具能打开并玩一局。
```

同时创建域策略文件 `policy/domains/game24.md`：

```markdown
# game24 policy

- 代码在 `packages/game24-miniprogram/src/`，遵守 `policy/layers.yaml` 的 game24 分层。
- 跨切面仅通过 `providers/`（如 score-store、wx storage 适配）。
- Spec：`docs/exec-plans/active/game24/`。
```

---

### Step 3：写需求 —— `/spec-requirements`

```text
/spec-requirements

feature_name: mvp
feature_description: |
  [粘贴 Step 1 的 problem statement 和 Step 2 的 Spec 五问摘要]
spec_base_path: docs/exec-plans/active/game24/mvp
language_preference: 中文
task_type: create
```

产出：`docs/exec-plans/active/game24/mvp/requirements.md`（EARS 格式，含用户故事与验收标准）。

**人工审阅** requirements.md，满意后继续。

---

### Step 4：评审闸门 —— `/spec-judge`

```text
/spec-judge

对照 docs/exec-plans/active/game24/mvp/spec.md 的五问，
评审 docs/exec-plans/active/game24/mvp/requirements.md。
输出：GO / REVISE / STOP，以及具体理由。
```

- **GO** → 继续 Step 5
- **REVISE** → 回到 Step 3 修改
- **STOP** → 范围有根本冲突，先和人讨论

---

### Step 5：写设计 —— `/spec-design`

```text
/spec-design

spec_base_path: docs/exec-plans/active/game24/mvp
language_preference: 中文
```

产出：`design.md` —— 建议包含：

| 层 | game24 MVP 典型内容 |
|----|---------------------|
| `types/` | `Card`, `GameState`, `ScoreRecord`, `Operator` |
| `config/` | 牌面范围、运算符列表 |
| `service/` | 出题、算式校验、判 24 |
| `repo/` | （可选）题库；MVP 可随机生成 |
| `providers/` | `score-store`（已有 stub）、`wx-storage` 适配 |
| `runtime/` | 页面逻辑编排 |
| `ui/` | 小程序页面（wxml/wxss/js 或统一 TS 层） |

再次 `/spec-judge` 评审 design.md → **GO** 后继续。

---

### Step 6：拆任务 —— `/spec-tasks`

```text
/spec-tasks

spec_base_path: docs/exec-plans/active/game24/mvp
language_preference: 中文
```

产出：`tasks.md`，示例 task 拆分：

```markdown
- [ ] T1  types/game.ts — Card, GameState, ScoreRecord
- [ ] T2  service/game-engine.ts — 随机出题、表达式求值
- [ ] T3  service/game-engine.test.ts — 判 24 边界用例
- [ ] T4  providers/score-store.ts — 完善并接 wx storage
- [ ] T5  runtime/game-session.ts — 单局状态机
- [ ] T6  ui/ — 小程序页面与交互
- [ ] T7  pnpm harness check 全绿
```

`/spec-judge` 评审 tasks.md → **GO** 后进入实现。

---

### Step 7：实现 —— `/spec-impl`

**一次只做一个 task**（Loop 原则）：

```text
/spec-impl

spec_base_path: docs/exec-plans/active/game24/mvp
task_id: T1
language_preference: 中文
```

每完成一个 task：

```sh
pnpm harness check
```

若某 task 较大，也可用 ad-hoc 方式：

```text
/implementer

按 docs/exec-plans/active/game24/mvp/tasks.md 的 T2 实现 game-engine。
遵守 policy/layers.yaml 的 game24 分层，不要越界 import。
```

---

### Step 8：补测试 —— `/spec-test`

可与 spec-impl 并行（registry 中 `can_parallel_with`）：

```text
/spec-test

spec_base_path: docs/exec-plans/active/game24/mvp
focus: service/game-engine 边界用例（无解、除零、非 24 结果）
```

或：

```text
/test-writer

为 packages/game24-miniprogram/src/service/ 补充 Vitest 行为测试。
```

---

### Step 9：代码审查 —— `/reviewer`

```text
/reviewer

审查 packages/game24-miniprogram/ 相对 main 的改动。
对照 docs/exec-plans/active/game24/mvp/spec.md 检查 scope 是否越界。
```

game24 域还可选用专审角色：

| 角色 | 何时用 |
|------|--------|
| `/architecture-reviewer` | 分层、模块边界 |
| `/security-reviewer` | 涉及用户数据、wx API |
| `/harness-auditor` | 分层违规、harness 治理 |

---

### Step 10：最终验收

```sh
pnpm harness check
pnpm test:boundary
pnpm lint
```

人工：微信开发者工具导入 `packages/game24-miniprogram`，玩一局。

全部通过后，MVP 完成。后续新功能（如「保证有解」「每日一题」）在 `docs/exec-plans/active/game24/<新 feature>/` 开新 Spec，**不要**在 MVP Spec 里偷偷扩 scope。

---

### 24 点示例：推荐目录结构（实现后）

```text
packages/game24-miniprogram/
├── package.json
├── project.config.json          # 微信小程序工程配置
└── src/
    ├── types/
    │   └── game.ts              # Card, GameState, ScoreRecord
    ├── config/
    │   └── game-config.ts       # 牌面范围、运算符
    ├── service/
    │   ├── game-engine.ts       # 出题、求值、判 24
    │   └── game-engine.test.ts
    ├── providers/
    │   ├── score-store.ts       # 已有 stub
    │   └── wx-storage.ts        # 微信 storage 适配
    ├── runtime/
    │   └── game-session.ts      # 单局流程
    └── ui/                      # 或 miniprogram 页面目录
        └── pages/
            └── game/
```

---

## 7. Subagent 调用手册

### 7.1 怎么调用

在 Cursor 对话中：

- 输入 **`/角色名`**（如 `/reviewer`）
- 或自然语言描述任务，Agent 会按 registry 委派

编译产物在 `.cursor/agents/<role>.md`，**不要手改**；改 `souls/` 后执行 `pnpm agents:compile`。

### 7.2 角色速查

#### 规划与澄清

| 调用 | 职责 | 典型时机 |
|------|------|----------|
| `/product-clarifier` | 产品澄清、范围收敛 | **写 Spec 之前** |
| `/ui-designer` | 视觉设计系统 `ui-design.md` | 有 UI 的 feature **实现前**（可与 Spec 并行） |
| `/orchestrator` | 拆任务、委派岗位 | 需求模糊、跨多域 |

#### SDD 规格链（按序）

| 调用 | 产出 | 下一关 |
|------|------|--------|
| `/spec-requirements` | `requirements.md` | spec-judge |
| `/spec-design` | `design.md` | spec-judge |
| `/spec-tasks` | `tasks.md` | spec-judge |
| `/spec-judge` | GO / REVISE / STOP | 人工决定 |

#### 实现与质量

| 调用 | 职责 |
|------|------|
| `/spec-impl` | 按 tasks.md 实现（有 Spec 时首选） |
| `/implementer` | ad-hoc 实现 / 修 bug（Spec 已明确时） |
| `/spec-test` | 按 Spec 写测试 |
| `/test-writer` | ad-hoc 补测试 |
| `/reviewer` | 代码审查 |
| `/harness-auditor` | 分层 / harness 治理检查 |

#### 调研与探索

| 调用 | 职责 |
|------|------|
| `/explore` | 只读代码库审计（改代码前了解结构） |

#### 设计（P2，可选）

| 调用 | 产出 | 说明 |
|------|------|------|
| `/ui-designer` | `ui-design.md` | 视觉 tokens + 组件规范；与 SDD 的 `design.md`（技术架构）不同 |

规范：`policy/ui-design-contract.md`。模板：`templates/ui-design.md`。域级覆盖：`packages/<domain>/ui-design.md`。

#### 专审（P2，可选）

`/security-reviewer` · `/architecture-reviewer` · `/impact-reviewer` · `/performance-reviewer` · `/documentation-reviewer` · `/solution-fit-challenger`

#### 交付（P2，可选）

`/ci-investigator` · `/pr-shepherd` · `/moderator`

### 7.3 两种开发模式对比

| | **SDD 模式**（推荐新 feature） | **Ad-hoc 模式**（小改/fix） |
|--|-------------------------------|---------------------------|
| 适用 | game24 MVP 等从零功能 | 改 typo、修单测、小 refactor |
| 流程 | 五问 → requirements → design → tasks → impl | 直接 `/implementer` |
| 范围控制 | Spec 五问 + spec-judge | 人工盯 scope |
| 审查 | spec-judge + reviewer | reviewer |

---

## 8. 分层架构（写代码时）

### 8.1 依赖方向

```text
types → config → repo → service → runtime → ui
              ↘ providers ↗（仅 types + config）
```

**禁止向上 import**（如 service import ui）。

### 8.2 违规时怎么办

1. 读 [`docs/architecture/LAYERS.md`](docs/architecture/LAYERS.md)
2. 跑 `pnpm test:boundary` 看具体违规路径
3. 把共享类型下沉到 `types/`，逻辑下沉一层

### 8.3 game24 分层示例

```text
ui/pages/game          → 调用 runtime
runtime/game-session   → 调用 service + providers
service/game-engine    → 调用 types + config（+ repo 若有题库）
providers/score-store  → 调用 types + config
types/game             → 纯类型，无 import
```

---

## 9. 验收与合并

合并前检查清单（见 [`policy/review.md`](policy/review.md)）：

- [ ] Spec 五问已填写，PR 描述中链接 Spec 路径
- [ ] `pnpm harness check` 本地全绿
- [ ] 改动在 Spec **Allowed surfaces** 内
- [ ] 无新增架构边界违规
- [ ] 若改了 `souls/`，已 `pnpm agents:compile` 且无漂移
- [ ] 敏感路径已过 `/reviewer`（或专审角色）

CI（`.github/workflows/ci.yml`）会在 PR 上跑：

```text
agents:validate → agents:compile → compile --check → test → lint
```

---

## 10. 常见问题

### Q: `.cursor/agents/` 和 `souls/` 是什么关系？

`souls/` 是源文件；`pnpm agents:compile` 生成 `.cursor/agents/`。**永远改 souls，不要改 agents。**

### Q: 可以直接让 Agent 写代码，跳过 Spec 吗？

小改动可以（`/implementer`）。**新 feature 不要跳** —— 没有 Spec 五问，scope 几乎必然膨胀。

### Q: `docs/exec-plans/active/` 是空的，正常吗？

正常。每个 feature 由你创建。24 点从 `docs/exec-plans/active/game24/mvp/` 开始。

### Q: game24 的 `score-store.ts` 引用了不存在的 `types/game.ts`？

这是 stub 状态。按 Step 7 的 T1 先创建 `types/game.ts`。

### Q: `pnpm harness check` 失败了怎么办？

| 失败项 | 处理 |
|--------|------|
| validate-souls | 检查 `souls/*/SOUL.md` 格式 |
| validate-missions | 检查 `templates/mission/` 与 registry 一致 |
| Compile check | 运行 `pnpm agents:compile`，提交产物或还原误改 |
| vitest 失败 | 看报错；边界测试失败 → 修正 import 方向 |
| `/ci-investigator` | 粘贴 CI 失败日志，让它定位根因 |

### Q: 想改 Agent 语气 / 行为？

1. 编辑 `souls/<role>/SOUL.md`
2. `pnpm agents:compile`
3. `pnpm harness check`
4. 提交 souls + 生成的 agents

### Q: Claude / Codex 能用吗？

P2 计划。当前仅 Cursor compile 启用（`config/providers.yaml` 中 `cursor.enabled: true`）。SDD 完整提示词暂在 `.claude/agents/sdd/`。

---

## 快速启动卡片（24 点 MVP）

复制到 Cursor，按顺序执行：

```text
1. /product-clarifier     → 澄清范围
2. 人工写 spec.md         → docs/exec-plans/active/game24/mvp/
3. /spec-requirements     → requirements.md
4. /spec-judge            → GO
5. /spec-design           → design.md
6. /spec-judge            → GO
7. /spec-tasks            → tasks.md
8. /spec-judge            → GO
9. /spec-impl (逐 task)   → 代码
10. /spec-test            → 测试
11. /reviewer             → 审查
12. pnpm harness check    → 验收
```

---

## 延伸阅读

| 文档 | 内容 |
|------|------|
| [`AGENTS.md`](AGENTS.md) | Agent 地图 |
| [`docs/guides/getting-started.md`](docs/guides/getting-started.md) | 极简 onboarding |
| [`docs/guides/adoption-path.md`](docs/guides/adoption-path.md) | Rule → Spec → Loop → Harness |
| [`policy/spec-contract.md`](policy/spec-contract.md) | Spec 契约与 SDD |
| [`HARNESS_ENGINEERING/ENGINEER_DOC.md`](HARNESS_ENGINEERING/ENGINEER_DOC.md) | 完整工程蓝图 |
| [`HARNESS_ENGINEERING/roles/swimlanes.md`](HARNESS_ENGINEERING/roles/swimlanes.md) | 角色泳道与 SDD 流程图 |
