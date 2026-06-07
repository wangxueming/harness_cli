import type { Rational } from "../types/game.js";

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

export function normalize(r: Rational): Rational {
  if (r.den === 0) {
    throw new Error("denominator cannot be zero");
  }
  let { num, den } = r;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = gcd(num, den);
  return { num: num / g, den: den / g };
}

export function fromInt(n: number): Rational {
  return normalize({ num: n, den: 1 });
}

export function add(a: Rational, b: Rational): Rational {
  return normalize({
    num: a.num * b.den + b.num * a.den,
    den: a.den * b.den,
  });
}

export function sub(a: Rational, b: Rational): Rational {
  return normalize({
    num: a.num * b.den - b.num * a.den,
    den: a.den * b.den,
  });
}

export function mul(a: Rational, b: Rational): Rational {
  return normalize({ num: a.num * b.num, den: a.den * b.den });
}

export function div(a: Rational, b: Rational): Rational {
  if (b.num === 0) {
    throw new Error("division by zero");
  }
  return normalize({ num: a.num * b.den, den: a.den * b.num });
}

export function equals24(v: Rational): boolean {
  const n = normalize(v);
  return n.num === 24 && n.den === 1;
}

export function rationalEquals(a: Rational, b: Rational): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  return na.num === nb.num && na.den === nb.den;
}
