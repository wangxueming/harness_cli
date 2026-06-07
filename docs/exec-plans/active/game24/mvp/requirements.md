# Requirements Document: game24 MVP

## Introduction

本需求文档定义微信小程序「24 点」MVP（v1）的功能与非功能要求。目标用户为希望在碎片时间进行轻量脑力训练的成年人。

产品结构：

```text
模式（二选一）
├─ 普通模式（1–10）
└─ 双面牌模式

玩法（二选一，与模式正交）
├─ 自由模式（主线闯关）
└─ 探索模式（附加收集）
```

**自由模式**为主线：找到任意一种正确解法即过关并进入下一关，保证流畅闯关体验。

**探索模式**为附加玩法：找到解法后不自动结束，持续展示「已发现 X / Y」（Y 为题库该题实际解法总数）；玩家可继续探索或随时结束；**不把找齐全部解法作为通关条件**，亦不以此推进主线。

通用机制：点选合并牌面凑 24，运算动画、操作历史回退、音效与计时；合并链仅剩一个最终结果时系统自动判题；结果页可分享至微信好友（**挑战关卡模式**）；本地 `wins/attempts` 持久化；v1 纯前端、无登录。

关卡难度随主线进度分阶段成长（新手→普通→高手）；玩家可无限次重试直至过关；「?」看答案标记 `hintUsed` 并在结果页展示。

本文档仅描述**可验证的需求**，不包含设计或实现细节。冻结契约与 v1 明确排除项作为约束性需求收录。

---

## Requirements

### Requirement 1：进入页与页面导航

**User Story:** 作为玩家，我希望从进入页一键开始游戏并顺畅进入主页，以便在碎片时间快速开局。

#### Acceptance Criteria

1. WHEN 用户首次打开小程序 THEN 系统 SHALL 展示进入页，且 v1 不要求微信登录或授权。
2. WHEN 用户在进入页点击「开始游戏」 THEN 系统 SHALL 导航至主页。
3. WHEN 用户处于 v1 任意页面 THEN 系统 SHALL NOT 展示登录入口或要求 openid。
4. WHEN 用户在自由模式下完成一关并进入结果页 THEN 系统 SHALL 在结果页提供分享入口。
5. WHERE 主页或关卡做题页 THEN 系统 SHALL NOT 常驻展示分享入口（分享入口仅出现在自由模式过关后的结果页）。

---

### Requirement 2：游戏模式选择

**User Story:** 作为玩家，我希望在开局前选择 1–10 普通模式或双面牌模式，以便按个人偏好体验不同牌面规则。

#### Acceptance Criteria

1. WHERE 主页 THEN 系统 SHALL 提供游戏模式选择，且模式为二选一：1–10 普通模式、双面牌模式。
2. WHEN 用户选择一种游戏模式 THEN 系统 SHALL 将该选择作为本局及后续游玩的生效模式，直至用户主动更改。
3. WHEN 用户尚未选择游戏模式并尝试开始 THEN 系统 SHALL 阻止开始并提示用户先选择模式。
4. IF 用户已选择游戏模式 THEN 系统 SHALL 将该模式与玩法选择（Requirement 4）视为正交维度（模式不等于玩法分级）。
5. WHEN 用户选择双面牌模式 THEN 系统 SHALL 适用 Requirement 3 所定义的双面牌规则；关卡选题、成长曲线与自由/探索判题规则 SHALL 与普通模式一致，仅牌面呈现不同。

---

### Requirement 3：双面牌模式

**User Story:** 作为选择双面牌模式的玩家，我希望每张牌有正反两面数字并可翻转选用，以便在经典 24 点规则下获得更高策略深度。

#### Acceptance Criteria

1. WHEN 双面牌模式一关开始时 THEN 系统 SHALL 向用户展示四张物理牌，且每张牌 SHALL 具有正面数字 A 与背面数字 B，A 与 B 均 SHALL 取自 1–10 整数池（与普通模式一致）。
2. WHEN 一关开始时 THEN 系统 SHALL 默认展示每张牌的正面数字 A。
3. WHEN 用户点击一张尚未被合并消耗的牌 THEN 系统 SHALL 以动画翻转该牌，切换当前可见面（A ↔ B）。
4. WHILE 一张牌（或其所属合并子树）尚未参与任何合并运算 THEN 用户 SHALL 可自由翻转该牌任意次数。
5. WHEN 一张牌（或其合并子树）已参与合并并被消耗为中间结果 THEN 系统 SHALL NOT 再允许翻转该牌或其子树内任一原始牌面；翻转锁定状态 SHALL 与合并消耗状态一致。
6. WHEN 用户通过操作历史回退（Requirement 7）撤销一次消耗了牌的合并运算 THEN 被撤销合并所涉及的牌（及其子树）SHALL 恢复为可翻转状态，且 SHALL 恢复至该回退点对应的可见面与运算值。
7. WHEN 用户进行合并运算 THEN 系统 SHALL 使用当前可见面上的数字作为该牌的运算值。
8. WHEN 用户完成本关（自由模式过关、探索模式结束或退出） THEN 系统 SHALL 校验用户最终使用了四张物理牌各一次，且每张牌恰好选用了一个面（正面或背面）参与运算。
9. IF 双面牌模式 THEN 系统 SHALL 适用与普通模式相同的关卡顺序、成长曲线（Requirement 5）及自由/探索玩法规则；双面牌仅改变牌面呈现与翻转交互。

#### Edge Cases（双面牌）

| 场景 | 期望行为 |
|------|----------|
| 翻转后尚未合并即再次翻转 | 允许；动画呈现面切换 |
| 牌已参与合并后尝试翻转 | 拒绝或忽略；保持已消耗状态 |
| 回退至合并前 | 被撤销合并涉及的牌（及子树）恢复可翻转；可见面与运算值恢复至回退点 |
| 双面牌 + 探索模式 | 解法发现进度规则与普通模式相同（「已发现 X / Y」） |
| 双面牌 + 「?」看答案 | 答案展示须标明每张牌选用的面（或等价算式） |

---

### Requirement 4：玩法选择

**User Story:** 作为玩家，我希望在开局前选择自由模式或探索模式，以便选择流畅闯关或解法收集体验。

#### Acceptance Criteria

1. WHERE 主页 THEN 系统 SHALL 提供玩法选择，且玩法为二选一：**自由模式**（主线闯关）、**探索模式**（附加收集）。
2. WHEN 用户选择自由模式 THEN 系统 SHALL 适用 Requirement 8 所定义的主线闯关规则。
3. WHEN 用户选择探索模式 THEN 系统 SHALL 适用 Requirement 9 所定义的探索收集规则。
4. WHEN 用户尚未选择玩法并尝试开始 THEN 系统 SHALL 阻止开始并提示用户先选择玩法。
5. IF 用户已选择玩法 THEN 系统 SHALL 将玩法与游戏模式选择视为正交维度。
6. WHERE v1 THEN 系统 SHALL NOT 提供「难度一 / 难度二」或「找出所有解法方可过关」类选项。

---

### Requirement 5：关卡体系、难度成长曲线与顺序闯关

**User Story:** 作为玩家，我希望在自由模式下按关卡顺序逐关挑战且前期题目更易、后期更具挑战，以便获得清晰的进度感与成就感。

#### Acceptance Criteria

1. WHEN 用户在主页确认模式、玩法为**自由模式**并开始游戏 THEN 系统 SHALL 从当前主线进度关卡开始按序展示题目。
2. WHEN 用户在自由模式下完成当前关卡（找到任意一种正确解法） THEN 系统 SHALL 解锁并允许进入下一关。
3. WHEN 用户尚未在自由模式下完成前置关卡 THEN 系统 SHALL NOT 允许跳关至更后关卡。
4. WHEN 用户在自由模式下未过关且仍在当前关卡 THEN 系统 SHALL 允许用户无限次重试，直至过关。
5. IF 关卡题目生成或选题 THEN 系统 SHALL 保证该题在经典 24 点规则下至少存在一种合法解法。
6. WHEN 系统为关卡 N 生成或选取题目 THEN 系统 SHALL 按下列难度成长曲线约束选题特征（数据来源于 `puzzles.jsonl`）：

| 阶段 | 关卡范围 | 选题特征 |
|------|----------|----------|
| 新手 | 1–20 | 合法解法数量多（建议 ≥ 5 种），易于成功 |
| 普通 | 21–80 | 合法解法数量为 2–4 种（含边界） |
| 高手 | 81+ | 合法解法数量为 1 种（唯一解） |

7. WHEN 关卡处于新手阶段（1–20） THEN 系统 SHALL NOT 选取合法解法数量少于 5 种的题目。
8. WHEN 关卡处于普通阶段（21–80） THEN 系统 SHALL 选取合法解法数量在 2–4 种（含）范围内的题目。
9. WHEN 关卡处于高手阶段（81+） THEN 系统 SHALL 选取唯一解题目。
10. WHEN 用户在探索模式下进入题目 THEN 系统 SHALL 默认使用当前主线进度对应关卡的题目（与自由模式同题同源），且探索过程 SHALL NOT 推进主线关卡序号。
11. WHEN 用户在自由模式下完成可用关卡体系中的最后一关 THEN 系统 SHALL 引导用户进入结果页。
12. WHEN 系统为 **1–10 普通模式**或**双面牌模式**从 `puzzles.jsonl` 选取关卡题目 THEN 系统 SHALL 仅选取 `cards` 各元素均 ∈ [1,10] 的题目（与 spec §4 冻结契约一致；双面牌选题池与普通模式相同）。

---

### Requirement 6：核心 24 点玩法与自动判题

**User Story:** 作为玩家，我希望通过点选合并四张牌组成算式凑 24，并在仅剩最终结果时由系统自动判定对错，以便流畅完成经典 24 点挑战。

#### Acceptance Criteria

1. WHEN 一关开始时 THEN 系统 SHALL 向用户展示四张牌，且每张牌在当题中必须各用且仅用一次。
2. WHEN 用户进行运算合并 THEN 系统 SHALL 仅允许使用运算符 `+`、`-`、`×`、`÷`。
3. WHEN 用户通过点选合并牌面 THEN 系统 SHALL 按用户操作顺序自然形成运算优先级（括号由运算顺序自然形成，不要求用户显式输入括号）。
4. WHEN 用户执行除法运算 THEN 系统 SHALL 允许非整除结果（不要求整除）。
5. WHEN 合并链使场上仅剩一个最终结果 THEN 系统 SHALL NOT 要求用户点击单独的「提交」按钮；系统 SHALL 立即自动评估该结果。
6. WHEN 场上仅剩一个最终结果 AND 该结果等于 24 AND 所用四数各用一次且运算合法 THEN 系统 SHALL 按当前玩法分流：
   - IF **自由模式** THEN 系统 SHALL 立即判定本关过关并进入下一关流程；
   - IF **探索模式** THEN 系统 SHALL 按 Requirement 9 更新「已发现 X / Y」，且 SHALL NOT 因本次正确判题自动结束探索。
7. IF 场上仅剩一个最终结果 AND 该结果不等于 24 THEN 系统 SHALL 立即判定为错误，SHALL 以文字反馈告知用户，且 SHALL NOT 视为过关或增加已发现解法数。
8. IF 场上仍存在多个可合并对象（未形成唯一最终结果） THEN 系统 SHALL NOT 自动结束本关；用户须继续合并直至触发第 5–7 条条件。

---

### Requirement 7：点选合并、操作历史与跳转回退

**User Story:** 作为玩家，我希望合并牌面时有移动动画、可见操作历史，且可跳转到任意历史步骤回退，以便流畅试错并降低误操作成本。

#### Acceptance Criteria

1. WHEN 用户点选两张（或两个可合并对象）进行运算 THEN 系统 SHALL 以移动动画呈现合并过程。
2. WHEN 用户完成一次合并运算 THEN 系统 SHALL 在可见的操作历史列表中追加一条记录，格式须包含序号与可读算式片段（例如：① `1+2=3`、② `3×4=12`、③ `12+6=18`）。
3. WHERE 关卡做题页 THEN 系统 SHALL 持续展示当前题目的操作历史列表（可为空列表）。
4. WHEN 用户点击历史列表中某一序号步骤 THEN 系统 SHALL 将牌面/中间结果状态回退至该步骤完成后的状态，并 SHALL 丢弃该步骤之后的所有操作记录与对应状态。
5. WHEN 用户通过历史跳转回退 THEN 系统 SHALL 同步更新操作历史列表，仅保留至所选步骤（含）为止。
6. WHEN 用户在关卡内执行单步回退（若 UI 提供） THEN 系统 SHALL 等效于回退至最近一条历史记录的前一状态，行为须与第 4–5 条一致。
7. WHEN 用户通过历史跳转回退撤销了合并运算 THEN 系统 SHALL 同步恢复该回退点对应的合并消耗状态；IF 双面牌模式 THEN 翻转锁定状态 SHALL 与 Requirement 3 一致（被撤销合并涉及的牌恢复可翻转）。
8. IF 用户已确认本关结束（自由模式已触发过关并进入结果流程，或探索模式用户已主动结束探索） THEN 系统 SHALL NOT 允许回退至改变已确认的结束结果。

---

### Requirement 8：自由模式（主线闯关）

**User Story:** 作为选择自由模式的玩家，我希望找到任意一种合法解法即可过关并进入下一关，以便获得流畅的闯关体验。

#### Acceptance Criteria

1. IF 用户所选玩法为自由模式 AND 合并链产生唯一最终结果且该结果等于 24（自动判题，见 Requirement 6） THEN 系统 SHALL 立即判定本关过关。
2. WHEN 自由模式下过关 THEN 系统 SHALL 推进主线关卡进度至下一关，且 SHALL 将一次 win 计入 `ScoreRecord.wins`（见 Requirement 13）。
3. WHEN 自由模式下自动判题为错误（最终结果 ≠ 24） THEN 系统 SHALL 提供文字判题反馈，且不视为过关、不推进主线。
4. WHERE 自由模式关卡 THEN 系统 SHALL NOT 展示「已发现 X / Y」探索进度（探索进度组件仅适用于探索模式）。
5. WHEN 自由模式下过关 THEN 系统 SHALL 引导用户进入结果页（含分享入口）。

---

### Requirement 9：探索模式（附加收集）

**User Story:** 作为选择探索模式的玩家，我希望在找齐一种解法后仍能继续研究并看到「已发现 X / Y」，以便满足收集与研究欲望，而不被穷举任务绑架。

#### Acceptance Criteria

1. WHEN 探索模式关卡加载完成 THEN 系统 SHALL 从题库读取该题 `solution_count` 作为 Y，并 SHALL 展示「已发现 0 / Y」。
2. WHERE 探索模式做题页 THEN 系统 SHALL 以「已发现 X / Y」文本或等效进度组件展示解法发现进度，且 SHALL NOT 为每种解法单独渲染星形图标。
3. WHEN 用户在探索模式下通过自动判题提交一种新的合法解法（唯一最终结果 = 24） THEN 系统 SHALL 将已发现数 X 加 1，并 SHALL 更新展示为「已发现 X / Y」。
4. WHEN 用户在探索模式下提交一种新的合法解法 THEN 系统 SHALL NOT 因本次正确判题自动结束探索或跳转下一关；用户 SHALL 可继续探索同一题目。
5. WHERE 探索模式做题页 THEN 系统 SHALL 提供「结束探索」入口，供用户随时主动结束本次探索。
6. WHEN 用户点击「结束探索」 THEN 系统 SHALL 结束当前探索会话并返回主页或等效入口，且 SHALL NOT 推进主线关卡序号，且 SHALL NOT 将本次探索计入 `ScoreRecord.wins`。
7. IF 已发现数 X 等于 Y THEN 系统 SHALL NOT 强制结束探索；用户仍 SHALL 可继续操作或随时点击「结束探索」。
8. IF 用户提交的解法经归一化后与已发现集合中某条等价 THEN 系统 SHALL NOT 增加 X，SHALL NOT 给出额外提示，且 SHALL 将此次判题计入 attempts。
9. IF 同一算式存在不同点选/合并输入路径 THEN 系统 SHALL 将这些路径视为同一种解法（仅计一次 X），归一化规则 SHALL 与 `puzzles.jsonl` 离线生成器一致（见 Requirement 16 §10）。
10. WHEN 用户在探索模式下自动判题为错误（最终结果 ≠ 24） THEN 系统 SHALL NOT 增加 X，且 SHALL 仅提供文字反馈。
11. IF 探索模式下自动判题为正确（最终结果 = 24）AND 归一化 key **不属于**该题 `puzzles.jsonl` 的 `solutions[]` 预计算集合 THEN 系统 SHALL NOT 增加 X，SHALL 仍将此次判题计入 attempts，且 SHALL NOT 给出探索进度相关的额外提示（典型：双面牌选用 faceB 凑对但 key 不在题库解集内）。

---

### Requirement 10：自愿看答案（「?」）与提示标记

**User Story:** 作为卡关的玩家，我希望自愿查看正确答案而不被强制结束题目，且结果页能知晓本关是否用过提示，以便参考后继续自行探索。

#### Acceptance Criteria

1. WHERE 关卡做题页 THEN 系统 SHALL 提供「?」入口供用户自愿查看答案。
2. WHEN 用户点击「?」查看答案 THEN 系统 SHALL 展示一种或多种正确算式（以满足关卡有解为准）。
3. WHEN 用户通过「?」查看答案 THEN 系统 SHALL 将当前关卡会话标记为 `hintUsed: true`（或等效关卡级布尔标记），并 SHALL 持久化至本关结束。
4. WHEN 用户进入自由模式本关结果页 AND 本关 `hintUsed` 为 true THEN 系统 SHALL 展示「本关使用过提示」或语义等效文案。
5. WHEN 用户通过「?」查看答案 THEN 系统 SHALL NOT 自动计入探索模式已发现解法数（不增加 X）。
6. WHEN 用户通过「?」查看答案 THEN 系统 SHALL NOT 自动结束题目、自动过关或自动跳转下一关。
7. WHEN 用户查看答案后 THEN 系统 SHALL 仍允许用户继续操作；自由模式下仍可通过自动判题正常过关；探索模式下仍可通过自动判题正常累计已发现解法。

---

### Requirement 11：判题反馈

**User Story:** 作为玩家，我希望每次判题后获得明确的文字反馈，以便知道结果并决定下一步操作。

#### Acceptance Criteria

1. WHEN 系统执行自动判题（唯一最终结果形成时） THEN 系统 SHALL 以文字形式反馈判定结果（正确 / 错误及必要说明）。
2. IF 判定为错误算式 THEN 系统 SHALL NOT 将此次判题记为过关（自由模式）或增加已发现数（探索模式）。
3. WHEN 系统完成一次自动判题（无论对错） THEN 系统 SHALL 将该次判题计入 attempts，除非本需求其他条款明确排除（如探索模式重复已发现解法仍计 attempts）。
4. WHEN 探索模式下场上仍存在多个可合并对象 THEN 用户继续合并 SHALL NOT 重复触发已完成中间状态的无效判题反馈（避免干扰性重复提示）。

---

### Requirement 12：音效与计时

**User Story:** 作为玩家，我希望在游戏过程中听到音效并看到计时，以便获得更好的沉浸感与自我挑战参考。

#### Acceptance Criteria

1. WHEN 用户进行关键游戏操作（如合并、自动判题过关、结束探索等） THEN 系统 SHALL 播放对应音效。
2. WHEN 用户进入一关题目 THEN 系统 SHALL 开始该题计时。
3. WHEN 用户离开当前题目（自由模式过关、探索模式结束或退出） THEN 系统 SHALL 停止该题计时并保留该题耗时供结果展示或本地记录（不要求云端同步）。
4. IF 用户设备或系统设置导致音效无法播放 THEN 系统 SHALL 不因音效失败而阻断核心玩法。

---

### Requirement 13：本地胜率与进度持久化

**User Story:** 作为玩家，我希望本地累计胜率和闯关进度被保存，以便下次打开小程序时延续统计与进度。

#### Acceptance Criteria

1. WHEN 用户在**自由模式**下完成一关过关 THEN 系统 SHALL 将一次 win 计入本地 `ScoreRecord.wins`。
2. WHEN 用户在自由模式或探索模式中任一次可计次的判题或等效尝试 THEN 系统 SHALL 将一次 attempt 计入本地 `ScoreRecord.attempts`。
3. WHEN 应用读取或写入 `ScoreRecord` THEN 系统 SHALL 使用冻结字段结构 `{ wins: number; attempts: number }`。
4. WHEN 用户关闭并重新打开小程序 THEN 系统 SHALL 从本地持久化存储恢复 `ScoreRecord` 与主线关卡进度。
5. WHERE v1 THEN 系统 SHALL NOT 提供统计或进度重置入口或 API。
6. IF 用户通过分享链接进入挑战关卡模式 THEN 好友本地 `ScoreRecord` 与主线关卡进度 SHALL 不受分享者数据影响；挑战过程中的判题 SHALL NOT 写入好友的 `ScoreRecord.wins`，且 SHALL NOT 计入好友的 `ScoreRecord.attempts`。
7. WHEN 用户在探索模式下结束探索 THEN 系统 SHALL NOT 推进主线关卡序号，且 SHALL NOT 计入 `ScoreRecord.wins`。

---

### Requirement 14：结果页与微信分享（挑战关卡模式）

**User Story:** 作为玩家，我希望在自由模式过关后的结果页将当前关卡分享给微信好友，以便好友以挑战模式体验同一道题而不影响各自主线进度。

#### Acceptance Criteria

1. WHEN 用户在自由模式下进入结果页 THEN 系统 SHALL 展示分享入口，且分享能力 SHALL 使用微信好友转发。
2. WHEN 用户从结果页发起分享 THEN 系统 SHALL 生成可供好友打开的分享卡片/链接，且落地页 SHALL 使好友进入**挑战关卡模式**（按自由模式规则：一种解法即完成挑战），题目为分享者**当前关卡**对应题目。
3. WHEN 好友通过分享卡片打开小程序 THEN 系统 SHALL 进入挑战关卡模式 UI（须与主线模式有可辨识区分，例如标题或副文案标明「挑战关卡」），且 SHALL NOT 将分享者关卡序号写入好友主线进度。
4. WHEN 好友在挑战模式中完成题目（过关、失败或主动退出） THEN 系统 SHALL 将好友导航回其**自身主线进度**对应界面，且好友主线关卡序号 SHALL 保持不变。
5. WHEN 好友在挑战关卡模式中进行判题或等效尝试 THEN 系统 SHALL NOT 将此次尝试计入好友的 `ScoreRecord.attempts`。
6. WHEN 好友通过分享卡片打开小程序 THEN 系统 SHALL NOT 恢复分享者的局内半题进度（包括但不限于已发现 X/Y、计时读数、做题中间合并状态、`hintUsed` 标记）。
7. WHEN 好友通过分享卡片打开小程序 THEN 系统 SHALL NOT 将此次打开视为好友对战、同题 PK 或战绩对比。
8. WHERE v1 THEN 系统 SHALL NOT 提供分享战绩卡片、成绩海报或云端榜单入口。

---

### Requirement 15：v1 明确排除（范围外行为）

**User Story:** 作为产品方，我希望 v1 边界清晰，以便团队不实现登录、对战、榜单等延后能力。

#### Acceptance Criteria

1. WHERE v1 THEN 系统 SHALL NOT 实现微信登录、openid 获取或用户身份体系。
2. WHERE v1 THEN 系统 SHALL NOT 实现好友对战、同题 PK 或实时对战匹配。
3. WHERE v1 THEN 系统 SHALL NOT 实现排行榜或云端榜单。
4. WHERE v1 THEN 系统 SHALL NOT 实现主动分步提示（除「?」自愿看答案外）。
5. WHERE v1 THEN 系统 SHALL NOT 实现历史记录、错题本或做题回顾列表（本需求所指「操作历史」为当题内回退列表，非跨关错题本）。
6. WHERE v1 THEN 系统 SHALL NOT 将「找齐全部解法（X = Y）」作为自由模式或主线过关条件。
7. WHERE v1 THEN 系统 SHALL NOT 依赖后端 API 或云存储完成核心玩法与进度（纯前端交付）。

---

### Requirement 16：架构与契约约束（冻结）

**User Story:** 作为工程团队，我希望遵守冻结契约与分层规则，以便实现可维护且可通过 harness 校验。

#### Acceptance Criteria

1. WHEN 在 `packages/game24-miniprogram` 内组织代码 THEN 系统 SHALL 遵守 `policy/layers.yaml` 中 `game24` 分层方向：`types → config → repo → service → runtime → ui`，且不得反转依赖方向。
2. WHEN 实现跨切面能力（如本地存储、微信能力适配） THEN 系统 SHALL 仅通过 `providers/` 暴露，且 `providers/` 仅可 import `types` 与 `config`。
3. WHEN 持久化战绩 THEN 系统 SHALL 使用 `ScoreRecord` 且字段 SHALL 为 `{ wins: number; attempts: number }`，v1 无重置 API。
4. WHEN 定义产品与玩法结构 THEN 系统 SHALL 保持「游戏模式二选一（普通 / 双面牌）」与「玩法二选一（自由 / 探索）」的冻结语义；不得将模式与传统难度分级混为一谈。
5. WHEN 实现自由模式 THEN 系统 SHALL 遵守：任意一种正确解法即过关；推进主线；计入 wins。
6. WHEN 实现探索模式 THEN 系统 SHALL 遵守：展示「已发现 X / Y」、不使用星形图标；找齐全部解法不作为过关条件；用户可随时结束探索；不推进主线、不计 wins。
7. WHEN 实现「?」看答案 THEN 系统 SHALL 遵守：标记 `hintUsed`；自由模式结果页展示提示使用；不自动增加 X、不自动结束题目。
8. WHEN 实现分享落地 THEN 系统 SHALL 遵守：好友进入挑战关卡模式（自由模式规则），不修改好友主线进度、`ScoreRecord.wins` 与 `ScoreRecord.attempts`。
9. WHEN 实现自动判题 THEN 系统 SHALL 遵守：唯一最终结果时立即评估，无需单独提交按钮。
10. WHEN 实现探索模式解法去重 THEN 系统 SHALL 使用与 `puzzles.jsonl` 离线生成器（`tools/solve_all.py`）一致的归一化规则；**仅**将归一化 key 属于该题 `solutions[]` 预计算集合的解法计入已发现数 X；运行时去重后的 X SHALL NOT 超过该题 `solution_count`；项目 SHALL 提供黄金测试验证归一化与题库 `solutions[]` 一致。
11. WHEN 实现关卡选题 THEN 系统 SHALL 遵守 Requirement 5 难度成长曲线及选题过滤约束（含 `cards` 各元素 ∈ [1,10]）；选题数据 SHALL 来自 `puzzles.jsonl`。

---

### Requirement 17：非功能需求

**User Story:** 作为玩家与工程团队，我希望小程序在目标平台上稳定、可用且可验收，以便顺利发布 MVP。

#### Acceptance Criteria

1. WHEN 部署 v1 THEN 系统 SHALL 以微信小程序纯前端形式交付。
2. WHEN 选择微信基础库版本 THEN 系统 SHALL 使用当前最新稳定版微信基础库。
3. WHEN 实现用户界面 THEN 系统 SHALL 以既有 UI 参考稿为视觉与交互验收依据。
4. WHEN 执行工程验收 THEN 项目 SHALL 通过 `pnpm harness check`。
5. WHEN 执行分层边界验收 THEN 项目 SHALL 通过 `pnpm test:boundary`。
6. WHEN 执行人工验收 THEN 测试人员 SHALL 能在微信开发者工具中完成一轮完整流程：进入页 → 选择模式与自由模式 → 按序闯关 → 自动判题过关 → 结果页分享 → 好友挑战模式往返；并 SHALL 能单独验证探索模式「已发现 X / Y」与随时结束探索行为。

---

## 边界与异常场景（Edge Cases）

| 场景 | 期望行为 |
|------|----------|
| 探索模式：题目有 74 种解法 | 展示「已发现 X / 74」；不使用 74 颗星；X=Y 不强制结束 |
| 探索模式：题目仅 1 种解法 | 展示「已发现 X / 1」；找到 1 种后 X=1，用户仍可结束探索 |
| 探索模式重复提交已发现解法 | 无额外提示；计 attempts；X 不变 |
| 探索模式判题错误 | 文字反馈；X 不变；计 attempts |
| 自由模式：合并后结果 = 24 | 立即过关并推进主线；计 win |
| 自由模式：合并后结果 ≠ 24 | 自动文字反馈错误；计 attempts；不过关 |
| 场上仍有多张牌/中间结果 | 不触发自动判题；继续合并 |
| 点击历史第 N 步回退 | 恢复至第 N 步后状态；丢弃 N 之后记录 |
| 「?」看答案后用户继续做题 | 允许；`hintUsed=true`；自由模式结果页展示提示；不自动增加 X、不自动过关 |
| 当前关卡反复失败（自由模式） | 允许无限重试；进度不推进直至过关 |
| 探索模式结束探索 | 不推进主线；不计 win；回到主页或等效入口 |
| 分享好友打开 | 挑战关卡模式（自由规则）；好友主线与 wins 不变 |
| 好友挑战中判题 | 不计入好友 attempts；不写入好友 wins |
| 双面牌：合并后尝试翻转 | 拒绝；该牌已消耗 |
| 双面牌：回退至合并前 | 被撤销合并涉及的牌恢复可翻转 |
| 双面牌 + 探索：faceB 凑对 24 | 可文字反馈算对；X 不变（key ∉ 题库 solutions 集）；计 attempts |
| 除法产生小数 | 允许；有理数精确判定是否等于 24（见 design.md `RationalMath`） |
| 未选模式或玩法即点开始 | 阻止并提示 |
| 音效不可用 | 核心玩法仍可完成 |
| 本地存储读取失败 | 安全降级为默认进度/统计（见 design.md `wx-storage`）；不得违反 `ScoreRecord` 契约 |
| 解法归一化与题库不一致 | 黄金测试失败；阻塞发布直至修复 |

---

## 追溯说明

| 需求 ID | 对应 spec.md 章节 |
|---------|-------------------|
| Req 1 | §1 页面流程 |
| Req 2–3 | §1 游戏模式、双面牌 |
| Req 4 | §1 玩法（自由 / 探索） |
| Req 5 | §1 进度、关卡难度曲线 |
| Req 6–11 | §1 核心玩法、自动判题、玩法规则 |
| Req 7 | §1 操作历史与回退 |
| Req 10 | §1 「?」与 hintUsed |
| Req 12 | §1 体验（音效、计时） |
| Req 13 | §1 本地 wins/attempts |
| Req 14 | §1 分享、挑战关卡模式 |
| Req 15 | §2 Do not solve |
| Req 16 | §4 Frozen contracts |
| Req 17 | §5 Done when |

---

## 契约变更摘要（供 spec.md 同步）

| 契约项 | 旧语义（v1 初稿 / v1.2） | 新语义（v1.3） |
|--------|--------------------------|----------------|
| 难度 / 玩法 | 难度一 / 难度二（找出所有解法可过关） | **自由模式**（主线）+ **探索模式**（附加）；找齐全部解法**不是**过关条件 |
| 进度展示 | 星标（颗数 = 解法数） | 探索模式仅 **「已发现 X / Y」**；禁止星形图标 |
| 主线推进 | 难度一下过关 | 仅**自由模式**过关推进主线；探索模式不推进 |
| 大师关 minSteps | `minSteps ≥ 3` | 已删除（题库无法区分）；高手阶段合并为 81+ |
| 解法归一化 | 一句描述 | 与 `puzzles.jsonl` 离线规则一致 + 黄金测试 |
| 「?」看答案 | 不自动亮星 | 不自动增加 X；`hintUsed` + 结果页展示 |
| 分享落地 | 好友继承进度 | 挑战关卡模式（自由规则）；不修改好友进度与统计 |
| 判题提交 | 手动提交 | 唯一最终结果时自动判题 |
| 双面牌翻转 | 合并后锁定 | 合并后锁定；回退撤销合并后恢复可翻转 |
| 选题 cards 过滤 | 未显式 | 普通/双面牌选题 `cards` 全 ≤ 10（Req 5.12） |
| 探索 X 上界 | 归一化去重 | 仅 `solutions[]` 预计算集内 key 计 X；保证 `X ≤ solution_count`（Req 9.11, 16 §10） |

---

*文档版本：v1.4（补齐选题过滤与探索计数边界；design v1.1 已对齐）。待 spec-judge 复审 requirements 后进入 tasks。*
