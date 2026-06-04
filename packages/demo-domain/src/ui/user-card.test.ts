import { describe, expect, it } from "vitest";
import { formatUserCard } from "./user-card.js";

describe("formatUserCard", () => {
  it("formats demo user", () => {
    expect(formatUserCard("demo-1")).toBe("User: Demo User (demo-1)");
  });
});
