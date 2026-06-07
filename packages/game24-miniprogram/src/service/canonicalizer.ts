import type { ExprNode, Operator, Rational } from "../types/game.js";
import { add, div, fromInt, mul, sub } from "./rational-math.js";

export type CanForm =
  | ["n", Rational]
  | ["+", readonly CanForm[]]
  | ["*", readonly CanForm[]]
  | ["-", CanForm, CanForm]
  | ["/", CanForm, CanForm];

function flattenAddends(node: ExprNode): ExprNode[] {
  if (node.kind === "+") {
    return [...flattenAddends(node.left), ...flattenAddends(node.right)];
  }
  return [node];
}

function flattenFactors(node: ExprNode): ExprNode[] {
  if (node.kind === "×") {
    return [...flattenFactors(node.left), ...flattenFactors(node.right)];
  }
  return [node];
}

function reprRational(v: Rational): string {
  return `Fraction(${v.num}, ${v.den})`;
}

function reprCanForm(form: CanForm): string {
  const kind = form[0];
  if (kind === "n") {
    return `('n', ${reprRational(form[1] as Rational)})`;
  }
  if (kind === "+") {
    const parts = (form[1] as CanForm[]).map(reprCanForm).join(", ");
    return `('+', (${parts}))`;
  }
  if (kind === "*") {
    const parts = (form[1] as CanForm[]).map(reprCanForm).join(", ");
    return `('*', (${parts}))`;
  }
  if (kind === "-") {
    return `('-', ${reprCanForm(form[1] as CanForm)}, ${reprCanForm(form[2] as CanForm)})`;
  }
  if (kind === "/") {
    return `('/', ${reprCanForm(form[1] as CanForm)}, ${reprCanForm(form[2] as CanForm)})`;
  }
  throw new Error(`unknown canonical kind: ${kind}`);
}

export function canonicalKey(node: ExprNode): string {
  return reprCanForm(canonicalForm(node));
}

function sortForms(forms: CanForm[]): CanForm[] {
  return [...forms].sort((a, b) => {
    const ra = reprCanForm(a);
    const rb = reprCanForm(b);
    return ra < rb ? -1 : ra > rb ? 1 : 0;
  });
}

export function canonicalForm(node: ExprNode): CanForm {
  if (node.kind === "num") {
    return ["n", node.value];
  }
  if (node.kind === "+") {
    const parts = sortForms(
      flattenAddends(node).map((child) => canonicalForm(child))
    );
    return ["+", parts];
  }
  if (node.kind === "×") {
    const parts = sortForms(
      flattenFactors(node).map((child) => canonicalForm(child))
    );
    return ["*", parts];
  }
  if (node.kind === "-") {
    return ["-", canonicalForm(node.left), canonicalForm(node.right)];
  }
  if (node.kind === "÷") {
    return ["/", canonicalForm(node.left), canonicalForm(node.right)];
  }
  throw new Error(`unknown node kind`);
}

function renderCanonical(form: CanForm): string {
  const kind = form[0];
  if (kind === "n") {
    const v = form[1];
    if (v.den === 1) return String(v.num);
    return `${v.num}/${v.den}`;
  }
  if (kind === "+") {
    const parts = (form[1] as CanForm[]).map(renderCanonical);
    return `(${parts.join("+")})`;
  }
  if (kind === "*") {
    const parts = (form[1] as CanForm[]).map(renderCanonical);
    return `(${parts.join("×")})`;
  }
  if (kind === "-") {
    return `(${renderCanonical(form[1] as CanForm)}-${renderCanonical(form[2] as CanForm)})`;
  }
  if (kind === "/") {
    return `(${renderCanonical(form[1] as CanForm)}÷${renderCanonical(form[2] as CanForm)})`;
  }
  throw new Error(`unknown canonical kind: ${kind}`);
}

export function canonicalDisplay(node: ExprNode): string {
  return renderCanonical(canonicalForm(node));
}

const CARD_LABELS: Record<string, number> = { J: 11, Q: 12, K: 13 };

function parseNumber(token: string): number {
  if (token in CARD_LABELS) return CARD_LABELS[token]!;
  const n = Number(token);
  if (!Number.isFinite(n)) throw new Error(`invalid number: ${token}`);
  return n;
}

/** Parse solution display string like ((1+1)×2×6) into ExprNode. */
export function parseSolutionDisplay(input: string): ExprNode {
  let i = 0;

  function skipWs() {
    while (i < input.length && /\s/.test(input[i]!)) i++;
  }

  function parsePrimary(): ExprNode {
    skipWs();
    if (input[i] === "(") {
      i++;
      const node = parseExpr();
      skipWs();
      if (input[i] !== ")") throw new Error(`expected ) at ${i}`);
      i++;
      return node;
    }
    const start = i;
    while (i < input.length && /[0-9JQK]/.test(input[i]!)) i++;
    const token = input.slice(start, i);
    if (!token) throw new Error(`expected number at ${i}`);
    return { kind: "num", value: fromInt(parseNumber(token)) };
  }

  function parseFactors(): ExprNode {
    let left = parsePrimary();
    skipWs();
    while (i < input.length && (input[i] === "×" || input[i] === "÷")) {
      const op = input[i] as "×" | "÷";
      i++;
      const right = parsePrimary();
      left =
        op === "×"
          ? { kind: "×", left, right }
          : { kind: "÷", left, right };
      skipWs();
    }
    return left;
  }

  function parseExpr(): ExprNode {
    let left = parseFactors();
    skipWs();
    while (i < input.length && (input[i] === "+" || input[i] === "-")) {
      const op = input[i] as "+" | "-";
      i++;
      const right = parseFactors();
      left =
        op === "+"
          ? { kind: "+", left, right }
          : { kind: "-", left, right };
      skipWs();
    }
    return left;
  }

  const result = parseExpr();
  skipWs();
  if (i !== input.length) throw new Error(`unexpected trailing at ${i}`);
  return result;
}

export function applyOperator(
  left: ExprNode,
  right: ExprNode,
  op: Operator
): ExprNode {
  return { kind: op, left, right };
}

export function evalExpr(node: ExprNode): Rational {
  if (node.kind === "num") return node.value;
  const l = evalExpr(node.left);
  const r = evalExpr(node.right);
  switch (node.kind) {
    case "+":
      return add(l, r);
    case "-":
      return sub(l, r);
    case "×":
      return mul(l, r);
    case "÷":
      return div(l, r);
  }
}
