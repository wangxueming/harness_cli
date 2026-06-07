# game24 puzzle generator

离线生成 24 点题库（扑克版 1–13，允许重复，合并模型）。

解法去重：对 `+` / `×` 展平结合律并排序子项，使 `(1+1)×2×6` 与 `6×2×(1+1)` 视为同一解法；`-` / `÷` 保持顺序。

## 用法

```bash
python3 packages/game24-miniprogram/tools/solve_all.py
```

输出：

- `../data/puzzles.jsonl` — 1820 题全量解法（运行时只读此文件）
- `../data/puzzles.summary.txt` — 统计摘要

## 选题

- **1–10 普通模式**：`cards` 全部 ≤ 10
- **新手关**：`solution_count >= 5`
- **普通关**：`2 <= solution_count <= 4`
- **高手/大师关**：`solution_count == 1`；大师关另看 `min_steps >= 3`
