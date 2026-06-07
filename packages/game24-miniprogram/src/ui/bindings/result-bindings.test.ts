import { describe, expect, it } from "vitest";
import { buildResultViewModel, resultContinuePath } from "./result-bindings.js";

describe("result-bindings", () => {
  it("buildResultViewModel uses share-bridge", () => {
    const vm = buildResultViewModel({
      elapsed: "90",
      hintUsed: "1",
      level: "5",
      label: "1,1,2,6",
    });
    expect(vm.elapsedText).toBe("01:30");
    expect(vm.hintUsed).toBe(true);
    expect(vm.sharePath).toContain("mode=challenge");
    expect(vm.sharePath).toContain("label=1");
  });

  it("resultContinuePath", () => {
    expect(resultContinuePath()).toContain("home");
  });
});
