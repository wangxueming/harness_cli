import { describe, expect, it } from "vitest";
import {
  buildChallengeViewModel,
  challengeExitPath,
  parseChallengeQuery,
} from "./challenge-bindings.js";

describe("challenge-bindings", () => {
  it("buildChallengeViewModel has challenge title", () => {
    const vm = buildChallengeViewModel(7, 30);
    expect(vm.title).toBe("挑战关卡");
    expect(vm.levelNumber).toBe(7);
    expect(vm.showExploreProgress).toBe(false);
  });

  it("parseChallengeQuery", () => {
    expect(parseChallengeQuery({ level: "9", label: "1,1,2,6" })).toEqual({
      level: 9,
      label: "1,1,2,6",
    });
  });

  it("challengeExitPath returns home", () => {
    expect(challengeExitPath()).toBe("/pages/home/home");
  });
});
