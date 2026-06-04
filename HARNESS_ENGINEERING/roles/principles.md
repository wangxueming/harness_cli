# Soul 与岗位原则

岗位 **显示名** 与 **对敲** 以 [agents.registry.yaml](./agents.registry.yaml) 的 `title` / `adversary_of` 为准；`role_id` 为编译与 `souls/` 路径标识。

## 约定

| 项 | 约定 |
|----|------|
| **事实源** | 仅 `souls/<role>/SOUL.md`（可选 `IDENTITY.md`、`STYLE.md`） |
| **岗位元数据** | `config/agents.registry.yaml`（蓝图：`HARNESS_ENGINEERING/roles/agents.registry.yaml`） |
| **工具目录** | `.cursor/agents/*.md` 等由 **`harness compile` 生成** |
| **SOUL 上限** | ~400 token；不写 model id、不写任务步骤清单 |
| **纪律** | 放 `policy/`，不放 SOUL |
| **Mission** | 任务步骤在 `templates/mission/<role>.mission.md`，编译进 agent 正文 |
| **编译块** | `<!-- BEGIN SOUL -->` … `<!-- END SOUL -->` + Mission 模板 |

## 对敲原则

1. **写代码 ≠ 放行**：implementer 与 reviewer 不得由同一会话自审自批。
2. **提问题 ≠ 自证**：finding 须由对敲方尝试反驳（VALID / INVALID / AMBIGUOUS）。
3. **合成确定性**：多 critic 结论由 moderator 或 `harness` 脚本合并，避免再用 LLM 做第四轮「总结」。

## 上下文分层（角色相关）

| Tier | 角色加载 |
|------|----------|
| T1 | `AGENTS.md`、`policy/never-do.md` |
| T2 | `policy/domains/*`、当前 role 的 `SOUL.md` + Mission |
| T3 | `docs/exec-plans/`、`docs/design-docs/` |

## compile 产物格式

`harness compile` 将 `souls/` + Mission + registry 合成 `.cursor/agents/*.md`：

```markdown
---
name: reviewer
title: 代码审查工程师
description: 代码审查工程师：…
model: inherit
readonly: true
---

<!-- BEGIN SOUL compiled from souls/reviewer/SOUL.md -->
...
```

- **`name`**：`role_id`（委派用，保持稳定）
- **`title`**：registry `title`
- **`description`**：以岗位名称开头的说明

## Cursor 内置 Subagent

来自 [Cursor Subagents 文档](https://cursor.com/docs/subagents)。自定义角色勿与内置同名。

| 内置 | 用途 | Harness 建议 |
|------|------|--------------|
| **explore** | 快速只读搜索 | 与 `souls/explore` 二选一；registry 注明 `builtin: true` 则跳过 compile |
| **bash** | 命令执行 | 仅 implementer / test-writer；配合 `tools.registry` + hooks |
| **browser** | 页面 E2E | 登录/验证码等人机协同；不替代 test-writer |

## 校验

```bash
pnpm harness validate-souls
pnpm harness compile --check
```
