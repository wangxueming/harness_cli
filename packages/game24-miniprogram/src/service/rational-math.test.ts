import { describe, expect, it } from "vitest";
import {
  add,
  div,
  equals24,
  fromInt,
  mul,
  normalize,
  sub,
} from "./rational-math.js";

describe("rational-math", () => {
  it("fromInt and equals24", () => {
    expect(equals24(fromInt(24))).toBe(true);
    expect(equals24(fromInt(23))).toBe(false);
    expect(equals24({ num: 48, den: 2 })).toBe(true);
  });

  it("arithmetic", () => {
    expect(add(fromInt(1), fromInt(2))).toEqual({ num: 3, den: 1 });
    expect(sub(fromInt(5), fromInt(3))).toEqual({ num: 2, den: 1 });
    expect(mul(fromInt(3), fromInt(4))).toEqual({ num: 12, den: 1 });
    expect(div(fromInt(7), fromInt(2))).toEqual({ num: 7, den: 2 });
  });

  it("normalizes fractions", () => {
    expect(normalize({ num: 6, den: 4 })).toEqual({ num: 3, den: 2 });
    expect(normalize({ num: -3, den: -2 })).toEqual({ num: 3, den: 2 });
  });

  it("throws on division by zero", () => {
    expect(() => div(fromInt(1), fromInt(0))).toThrow("division by zero");
  });
});
