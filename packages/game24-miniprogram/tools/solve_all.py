#!/usr/bin/env python3
"""
24 点全量求解（扑克版 1–13，允许重复，合并模型）。

生成 packages/game24-miniprogram/data/puzzles.jsonl
运行时小程序只读 data/，不依赖本脚本。
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from fractions import Fraction
from itertools import combinations_with_replacement
from pathlib import Path

RANKS = list(range(1, 14))  # 1..10, J=11, Q=12, K=13
LABEL = {11: "J", 12: "Q", 13: "K"}


def fmt_card(n: int) -> str:
    return LABEL.get(n, str(n))


def fmt_combo(combo: tuple[int, ...]) -> str:
    return ",".join(fmt_card(n) for n in combo)


CanForm = tuple


@dataclass(frozen=True)
class Expr:
    kind: str
    value: Fraction | None = None
    left: Expr | None = None
    right: Expr | None = None

    @staticmethod
    def leaf(v: Fraction) -> Expr:
        return Expr("num", value=v)

    @staticmethod
    def apply(op: str, left: Expr, right: Expr) -> Expr:
        return Expr(op, left=left, right=right)

    def flatten_addends(self) -> list[Expr]:
        if self.kind == "+":
            assert self.left is not None and self.right is not None
            return self.left.flatten_addends() + self.right.flatten_addends()
        return [self]

    def flatten_factors(self) -> list[Expr]:
        if self.kind == "*":
            assert self.left is not None and self.right is not None
            return self.left.flatten_factors() + self.right.flatten_factors()
        return [self]

    def canonical_form(self) -> CanForm:
        """展平 +/* 结合律并排序子项，使 (1+1)×2×6 与 6×2×(1+1) 等价。"""
        if self.kind == "num":
            assert self.value is not None
            return ("n", self.value)

        if self.kind == "+":
            parts = sorted(
                (child.canonical_form() for child in self.flatten_addends()),
                key=repr,
            )
            return ("+", tuple(parts))

        if self.kind == "*":
            parts = sorted(
                (child.canonical_form() for child in self.flatten_factors()),
                key=repr,
            )
            return ("*", tuple(parts))

        assert self.left is not None and self.right is not None
        if self.kind == "-":
            return ("-", self.left.canonical_form(), self.right.canonical_form())
        if self.kind == "/":
            return ("/", self.left.canonical_form(), self.right.canonical_form())
        raise ValueError(f"unknown kind: {self.kind}")

    def canonical_key(self) -> str:
        return repr(self.canonical_form())

    @staticmethod
    def render_canonical(form: CanForm) -> str:
        kind = form[0]
        if kind == "n":
            v: Fraction = form[1]  # type: ignore[assignment]
            if v.denominator == 1:
                return fmt_card(int(v))
            return f"{v.numerator}/{v.denominator}"

        if kind == "+":
            parts = [Expr.render_canonical(part) for part in form[1]]  # type: ignore[index]
            return f"({'+'.join(parts)})"

        if kind == "*":
            parts = [Expr.render_canonical(part) for part in form[1]]  # type: ignore[index]
            return f"({'×'.join(parts)})"

        if kind == "-":
            left = Expr.render_canonical(form[1])  # type: ignore[index]
            right = Expr.render_canonical(form[2])  # type: ignore[index]
            return f"({left}-{right})"

        if kind == "/":
            left = Expr.render_canonical(form[1])  # type: ignore[index]
            right = Expr.render_canonical(form[2])  # type: ignore[index]
            return f"({left}÷{right})"

        raise ValueError(f"unknown canonical kind: {kind}")

    def canonical_display(self) -> str:
        return self.render_canonical(self.canonical_form())


def search(
    nums: list[Fraction],
    exprs: list[Expr],
    solutions: dict[str, tuple[str, int]],
    steps: int,
) -> None:
    n = len(nums)
    if n == 1:
        if nums[0] == Fraction(24, 1):
            key = exprs[0].canonical_key()
            display = exprs[0].canonical_display()
            prev = solutions.get(key)
            if prev is None or steps < prev[1]:
                solutions[key] = (display, steps)
        return

    for i in range(n):
        for j in range(i + 1, n):
            a, ea = nums[i], exprs[i]
            b, eb = nums[j], exprs[j]
            rest_nums = [nums[k] for k in range(n) if k not in (i, j)]
            rest_exprs = [exprs[k] for k in range(n) if k not in (i, j)]

            candidates: list[tuple[Fraction, Expr]] = [
                (a + b, Expr.apply("+", ea, eb)),
                (a * b, Expr.apply("*", ea, eb)),
                (a - b, Expr.apply("-", ea, eb)),
                (b - a, Expr.apply("-", eb, ea)),
            ]
            if b != 0:
                candidates.append((a / b, Expr.apply("/", ea, eb)))
            if a != 0:
                candidates.append((b / a, Expr.apply("/", eb, ea)))

            for val, ex in candidates:
                search(rest_nums + [val], rest_exprs + [ex], solutions, steps + 1)


def solve_combo(combo: tuple[int, ...]) -> tuple[list[str], int | None]:
    nums = [Fraction(n, 1) for n in combo]
    exprs = [Expr.leaf(n) for n in nums]
    found: dict[str, tuple[str, int]] = {}
    search(nums, exprs, found, 0)

    if not found:
        return [], None

    displays = sorted(display for display, _ in found.values())
    min_steps = min(steps for _, steps in found.values())
    return displays, min_steps


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate game24 puzzle bank (1–13, merge model).")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "data" / "puzzles.jsonl",
        help="Output JSONL path (default: ../data/puzzles.jsonl)",
    )
    args = parser.parse_args()

    args.output.parent.mkdir(parents=True, exist_ok=True)

    total = 0
    solvable = 0
    by_count: dict[int, int] = {}

    with args.output.open("w", encoding="utf-8") as f:
        for combo in combinations_with_replacement(RANKS, 4):
            solutions, min_steps = solve_combo(combo)
            total += 1
            cnt = len(solutions)
            if cnt:
                solvable += 1
            by_count[cnt] = by_count.get(cnt, 0) + 1

            record = {
                "cards": list(combo),
                "cards_label": fmt_combo(combo),
                "solution_count": cnt,
                "min_steps": min_steps,
                "solutions": solutions,
            }
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    summary_path = args.output.with_suffix(".summary.txt")
    with summary_path.open("w", encoding="utf-8") as f:
        f.write(f"总组合数: {total}\n")
        f.write(f"有解: {solvable}\n")
        f.write(f"无解: {total - solvable}\n\n")
        f.write("按解法数量分布:\n")
        for k in sorted(by_count):
            f.write(f"  {k} 种解法: {by_count[k]} 题\n")

    print(f"Wrote {args.output} ({total} puzzles, {solvable} solvable)")
    print(f"Summary -> {summary_path}")


if __name__ == "__main__":
    main()
