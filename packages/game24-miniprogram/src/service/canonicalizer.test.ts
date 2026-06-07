import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PuzzleRepo } from "../repo/puzzle-repo.js";
import {
  canonicalDisplay,
  canonicalKey,
  parseSolutionDisplay,
} from "./canonicalizer.js";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

function pythonCanonicalKey(display: string): string {
  const script = `# -*- coding: utf-8 -*-
from fractions import Fraction

CARD = {"J": 11, "Q": 12, "K": 13}

class Expr:
    def __init__(self, kind, value=None, left=None, right=None):
        self.kind = kind
        self.value = value
        self.left = left
        self.right = right
    @staticmethod
    def leaf(v):
        return Expr("num", value=v)
    def flatten_addends(self):
        if self.kind == "+":
            return self.left.flatten_addends() + self.right.flatten_addends()
        return [self]
    def flatten_factors(self):
        if self.kind == "*":
            return self.left.flatten_factors() + self.right.flatten_factors()
        return [self]
    def canonical_form(self):
        if self.kind == "num":
            return ("n", self.value)
        if self.kind == "+":
            parts = sorted((c.canonical_form() for c in self.flatten_addends()), key=repr)
            return ("+", tuple(parts))
        if self.kind == "*":
            parts = sorted((c.canonical_form() for c in self.flatten_factors()), key=repr)
            return ("*", tuple(parts))
        if self.kind == "-":
            return ("-", self.left.canonical_form(), self.right.canonical_form())
        if self.kind == "/":
            return ("/", self.left.canonical_form(), self.right.canonical_form())
    def canonical_key(self):
        return repr(self.canonical_form())

def parse_primary(s, i):
    if s[i] == "(":
        node, i = parse_expr(s, i + 1)
        if s[i] != ")":
            raise ValueError("expected )")
        return node, i + 1
    j = i
    while j < len(s) and (s[j].isdigit() or s[j] in "JQK"):
        j += 1
    tok = s[i:j]
    return Expr.leaf(Fraction(CARD.get(tok, int(tok)), 1)), j

def parse_factors(s, i):
    left, i = parse_primary(s, i)
    while i < len(s) and s[i] in "×÷":
        op = "*" if s[i] == "×" else "/"
        i += 1
        right, i = parse_primary(s, i)
        left = Expr(op, left=left, right=right)
    return left, i

def parse_expr(s, i):
    left, i = parse_factors(s, i)
    while i < len(s) and s[i] in "+-":
        op = "+" if s[i] == "+" else "-"
        i += 1
        right, i = parse_factors(s, i)
        left = Expr(op, left=left, right=right)
    return left, i

display = ${JSON.stringify(display)}
node, _ = parse_expr(display, 0)
print(node.canonical_key())
`;
  const tmp = path.join(os.tmpdir(), `game24-canon-${Date.now()}.py`);
  fs.writeFileSync(tmp, script, "utf8");
  try {
    return execSync(`python3 "${tmp}"`, { encoding: "utf8" }).trim();
  } finally {
    fs.unlinkSync(tmp);
  }
}

describe("canonicalizer", () => {
  it("canonicalKey matches commutative forms", () => {
    const a = parseSolutionDisplay("((1+1)×2×6)");
    const b = parseSolutionDisplay("(6×2×(1+1))");
    expect(canonicalKey(a)).toBe(canonicalKey(b));
  });

  it("canonicalDisplay renders readable form", () => {
    const node = parseSolutionDisplay("((1+1)×2×6)");
    expect(canonicalDisplay(node)).toContain("×");
  });

  it("golden: sample solutions match Python canonical_key", () => {
    const repo = new PuzzleRepo();
    const samples = repo
      .loadAll()
      .filter((p) => p.solution_count > 0 && p.cards.every((c) => c <= 10))
      .slice(0, 15);

    for (const puzzle of samples) {
      for (const display of puzzle.solutions.slice(0, 2)) {
        const node = parseSolutionDisplay(display);
        const tsKey = canonicalKey(node);
        const pyKey = pythonCanonicalKey(display);
        expect(tsKey).toBe(pyKey);
      }
    }
  });
});
