# Role 机制与流程（泳道图）

> 编制与对敲表：[README.md](./README.md) · 岗位元数据：[agents.registry.yaml](./agents.registry.yaml)  
> 泳道 = **谁**在处理；箭头 = **交接**；菱形 = **闸门**（技术评审委员 / 人）。

---

## 1. 机制总览：配置如何变成可委派岗位

说明 **role 机制本身**（不是业务需求流）：人格与花名册如何进入 IDE。

```mermaid
flowchart TB
  subgraph DEV["泳道：人 / 维护者"]
    D1[编辑 souls/SOUL.md]
    D2[编辑 config/agents.registry.yaml<br/>title · adversary_of · readonly]
    D3[pnpm harness compile]
  end

  subgraph REPO["泳道：仓库配置层"]
    S[souls/ 人格 L0]
    R[config/agents.registry.yaml<br/>岗位注册 L2]
    M[templates/mission/ 任务剧本 L1]
  end

  subgraph TOOL["泳道：Harness CLI"]
    C[compile 合并 Soul + Mission + registry]
    V[validate-souls / compile --check]
  end

  subgraph RT["泳道：运行时 · Cursor"]
    A[".cursor/agents/{role_id}.md"]
    T[研发协调员委派 Task/subagent]
  end

  D1 --> S
  D2 --> R
  S --> C
  R --> C
  M --> C
  C --> A
  D3 --> C
  C --> V
  A --> T
  T -->|readonly / adversary_of| A
```

| 泳道 | 职责 |
|------|------|
| 人 / 维护者 | 改 Soul、registry，触发 compile |
| 仓库配置层 | 事实源：人格短、registry 定权限与对敲 |
| Harness CLI | 生成 agent 文件、校验不漂移 |
| 运行时 | 研发协调员按 `role_id` 委派；subagent 加载编译产物 |

`roles/` 下 **README + 本文 + principles** 为人读说明；不参与 compile。

---

## 1.1 SDD 与文字流程

**SDD**（Spec-Driven Development）：规格阶段 **每档文档后** 技术评审委员闸门（GO / REVISE / STOP）；实现阶段再测试与代码审查。评审 **不是** 只在项目末尾做一次。

### 规格阶段

```text
需求分析师 →〔技术评审委员〕→ 系统架构师 →〔技术评审委员〕→ 迭代规划师 →〔技术评审委员〕
```

### 实现阶段

```text
特性开发工程师 → 测试工程师 → 代码审查工程师 ↔ 开发工程师 → 架构治理工程师 → 人
```

### 一览

```text
需求 →[评审]→ 设计 →[评审]→ 任务 →[评审]→ 实现 → 测试 → 代码审查 → 治理检查 → 人
```

| 产物 | 路径 |
|------|------|
| 需求 / 设计 / 任务 | `docs/exec-plans/active/<domain>/<feature>/` 或 `.claude/specs/<feature>/*.md` |
| 契约 | [policy/spec-contract.md](../../policy/spec-contract.md)（Spec 五问） |
| Claude 提示词 | `.claude/agents/sdd/spec-*` |

### 日常开发（简图）

```mermaid
sequenceDiagram
  participant U as 人
  participant M as 研发协调员
  participant O as 技术负责人
  participant I as 开发工程师
  participant R as 代码审查工程师

  U->>M: 需求
  M->>O: 拆 scope
  O-->>M: 五问 + 任务
  M->>I: 开发工程师
  I-->>M: 补丁 + 自测
  M->>R: 代码审查
  R->>I: 对敲
  R-->>M: findings
  M->>U: PR 建议
```

### 其它文字链

| 链 | 顺序 |
|----|------|
| 修 bug | 研发协调员 → 技术调研（可选）→ 开发工程师 → 代码审查工程师 |
| 交付 P2 | 开发工程师 → 测试开发 → 代码审查 ↔ 开发工程师 → 架构治理 → 发布 → CI → 人 |

---

## 2. 端到端：新功能（P1 + 可选 P2）

从模糊需求到可合并 PR 的 **主路径**（纵轴为时间从上到下）。

```mermaid
flowchart TB
  subgraph H["泳道：人"]
    h0([提出需求])
    h1{HITL<br/>批准 scope?}
    h2([合并 PR])
  end

  subgraph M["泳道：研发协调员 · 主会话"]
    m0[接收意图]
    m1[选择路径：SDD / 日常]
    m2[委派 subagent · 汇总]
  end

  subgraph P2A["泳道：产品经理 · P2 可选"]
    p0[澄清需求 · Spec 五问草案]
  end

  subgraph O["泳道：技术负责人"]
    o0[拆 scope · 五问]
    o1[排期：先规格或先调研]
  end

  subgraph SPEC["泳道：规格岗位 · SDD"]
    direction TB
    sr[需求分析师<br/>requirements]
    j1{技术评审委员<br/>GO/REVISE/STOP}
    sd[系统架构师<br/>design]
    j2{技术评审委员}
    st[迭代规划师<br/>tasks]
    j3{技术评审委员}
  end

  subgraph ENG["泳道：工程岗位"]
    e0[技术调研工程师<br/>可选 · 只读]
    i0[开发工程师 / 特性开发工程师]
    tw[测试开发工程师 / 测试工程师]
    r0[代码审查工程师]
    r1{对敲<br/>kill-findings}
    ha[架构治理工程师<br/>harness check]
  end

  subgraph P2B["泳道：交付 · P2 可选"]
    ps[发布工程师]
    ci[CI 工程师]
    mod[评审主席<br/>多审查合成]
  end

  h0 --> m0
  m0 --> m1
  m1 -->|大功能| p0
  p0 --> o0
  m1 -->|小改动| o0
  o0 --> h1
  h1 -->|否 REVISE| sr
  h1 -->|是| sr
  sr --> j1
  j1 -->|REVISE| sr
  j1 -->|GO| sd
  sd --> j2
  j2 -->|GO| st
  st --> j3
  j3 -->|GO| e0
  e0 --> i0
  j3 -->|GO| i0
  i0 --> tw
  tw --> r0
  r0 --> r1
  r1 -->|VALID findings| i0
  r1 -->|通过| ha
  ha --> ps
  ps --> ci
  r0 --> mod
  mod --> m2
  ci --> m2
  m2 --> h2
```

**读图要点**

- **研发协调员** 不写业务代码，只委派与汇总。
- **技术评审委员** 在规格链上出现 3 次闸门（需求 / 设计 / 任务），需求有问题在此 **STOP/REVISE**，不进入架构师。
- **代码审查工程师 ↔ 开发工程师** 在实现后 **对敲**，与规格闸门是两套 `debate_mode`（见 §5）。

---

## 3. SDD 规格泳道（仅文档阶段）

只展开 **requirements → design → tasks**，实现代码不在本图。

```mermaid
flowchart LR
  subgraph 人
    hu([确认/驳回])
  end

  subgraph 研发协调员
    mc[触发 SDD · 传 spec_base_path]
  end

  subgraph 需求分析师
    rq[编写 requirements.md<br/>EARS · 只写需求]
  end

  subgraph 技术评审委员
    jg1{评审 requirements<br/>GO / REVISE / STOP}
    jg2{评审 design}
    jg3{评审 tasks}
  end

  subgraph 系统架构师
    ds[编写 design.md]
  end

  subgraph 迭代规划师
    tk[编写 tasks.md<br/>可执行 coding 步骤]
  end

  subgraph 方案评审工程师_P2["方案评审工程师 · P2"]
    sf[挑战方案合理性]
  end

  mc --> rq
  rq --> jg1
  jg1 -->|REVISE| rq
  jg1 -->|STOP| hu
  jg1 -->|GO| ds
  ds --> sf
  sf --> jg2
  jg2 -->|REVISE| ds
  jg2 -->|GO| tk
  tk --> jg3
  jg3 -->|REVISE| tk
  jg3 -->|GO| mc
  jg1 -.->|adversary_of| rq
```

| 步骤 | 对敲（registry） | 产出 |
|------|------------------|------|
| 需求 | 需求分析师 ↔ **技术评审委员** | `requirements.md` |
| 设计 | 系统架构师 ↔ 技术评审委员、方案评审工程师(P2) | `design.md` |
| 任务 | 迭代规划师 ↔ 技术评审委员、开发工程师(预审) | `tasks.md` |

---

## 4. 实现与审查泳道（对敲 kill-findings）

规格通过后，**开发工程师** 与 **代码审查工程师** 的分工。

```mermaid
flowchart TB
  subgraph 人
    h_ok([接受/要求修改])
  end

  subgraph 研发协调员
    m_impl[委派 implementer / spec-impl]
    m_rev[委派 reviewer readonly]
  end

  subgraph 开发工程师
    impl[读 tasks/design · 小步实现]
    self[自测 · done-when 命令]
    defend[对 findings 举证反驳<br/>VALID / INVALID]
  end

  subgraph 测试开发工程师
    test[补测试 · 行为覆盖]
  end

  subgraph 代码审查工程师
    rev[读 diff · file:line findings]
    block[严重问题 · 禁止合并]
  end

  subgraph 架构治理工程师
    aud[harness check · 边界测试]
  end

  m_impl --> impl
  impl --> self
  self --> test
  test --> m_rev
  m_rev --> rev
  rev -->|提出 finding| defend
  defend -->|INVALID 误报| rev
  defend -->|VALID| impl
  rev -->|仍 VALID| block
  block --> h_ok
  rev -->|无 BLOCK| aud
  aud --> h_ok

  rev -.->|adversary_of implementer| impl
  impl -.->|adversary_of reviewer| rev
```

**规则（principles.md）**

1. 同一岗位 **不得** 既改代码又宣布可合并。  
2. 审查 **readonly**；修复委派回开发工程师。  
3. 架构治理工程师与开发工程师对敲 **分层/CI**，不替代代码审查。

---

## 5. 修 bug 最短泳道

```mermaid
flowchart LR
  subgraph 人
    u1([报 bug])
    u2([合并])
  end

  subgraph 研发协调员
    m1[委派]
  end

  subgraph 技术调研工程师
    ex[只读定位 · 可选]
  end

  subgraph 开发工程师
    fix[最小修复]
  end

  subgraph 代码审查工程师
    cr[审查 diff]
  end

  u1 --> m1
  m1 --> ex
  ex --> fix
  m1 --> fix
  fix --> cr
  cr --> u2
```

---

## 6. 交付泳道（P2）

PR 已创建后的 **发布工程师 / CI 工程师** 循环。

```mermaid
flowchart TB
  subgraph 人
    merge([合并])
  end

  subgraph 研发协调员
    m[委派 pr-shepherd]
  end

  subgraph 发布工程师
    ps[检查 PR 状态 · 评论 · 冲突]
    loop{CI 绿且评论已处理?}
  end

  subgraph CI工程师
    ci[分析失败 job · 根因]
  end

  subgraph 开发工程师
    fix_ci[按建议修复]
  end

  subgraph 代码审查工程师
    rev[未决 BLOCK?]
  end

  m --> ps
  ps --> loop
  loop -->|否| ci
  ci --> fix_ci
  fix_ci --> ps
  loop -->|是| rev
  rev -->|无 BLOCK| merge
  rev -->|有 BLOCK| ps
```

---

## 7. debate_mode 与泳道对应

| debate_mode | 典型泳道组合 | 结果 |
|-------------|--------------|------|
| **judge-verdict** | 需求/设计/任务岗位 → **技术评审委员** | GO / REVISE / STOP |
| **kill-findings** | **代码审查工程师** ↔ **开发工程师** | VALID / INVALID / AMBIGUOUS |
| **cross-exam** | 测试开发 ↔ 审查；发布 ↔ 审查 | 多视角 validate/challenge |
| **judge-verdict** | **产品经理** ↔ **技术负责人** | scope 收敛后人批 |

---

## 8. 何时走哪条泳道

| 场景 | 建议泳道图 |
|------|------------|
| 理解配置与 compile | §1 机制总览 |
| 新功能、怕需求错 | §2 端到端 + §3 SDD |
| 只关心需求审核 | §3（技术评审委员闸门） |
| 实现与 CR | §4 |
| 小修复 | §5 |
| PR 合不进 | §6 |

---

## 9. 相关文档

- [README.md](./README.md) — 编制表、对敲矩阵、场景流水线  
- [principles.md](./principles.md) — Soul / Mission / compile / 内置 subagent  
- [agents.registry.yaml](./agents.registry.yaml) — 岗位单源（同步 `config/agents.registry.yaml`）  
