import { describe, expect, it, beforeEach } from "vitest";
import { setWxStorageAdapter } from "../../providers/wx-storage.js";
import { resetMemoryState } from "../../providers/score-store.js";
import { GameSessionController } from "../../runtime/game-session-controller.js";
import {
  buildPlayViewModel,
  formatElapsed,
  parsePlayQuery,
} from "./play-bindings.js";

describe("play-bindings", () => {
  beforeEach(() => {
    const store = new Map<string, unknown>();
    setWxStorageAdapter({
      getStorageSync: (k) => store.get(k),
      setStorageSync: (k, v) => store.set(k, v),
    });
    resetMemoryState();
  });

  it("formatElapsed", () => {
    expect(formatElapsed(65)).toBe("01:05");
    expect(formatElapsed(0)).toBe("00:00");
  });

  it("buildPlayViewModel free mode hides explore progress", () => {
    const ctrl = new GameSessionController();
    const state = ctrl.start(1, "normal", "free");
    const vm = buildPlayViewModel(state);
    expect(vm.showExploreProgress).toBe(false);
    expect(vm.cardViews.length).toBeGreaterThanOrEqual(4);
  });

  it("buildPlayViewModel explore mode shows X/Y", () => {
    const ctrl = new GameSessionController();
    const state = ctrl.start(1, "normal", "explore");
    const vm = buildPlayViewModel(state);
    expect(vm.showExploreProgress).toBe(true);
    expect(vm.exploreY).toBeGreaterThan(0);
  });

  it("parsePlayQuery", () => {
    expect(parsePlayQuery({ level: "3", gameMode: "dual-face", playMode: "explore" })).toEqual({
      level: 3,
      gameMode: "dual-face",
      playMode: "explore",
    });
  });

  it("dual-face flip sets flipping flag via controller", () => {
    const ctrl = new GameSessionController();
    ctrl.start(1, "dual-face", "free");
    ctrl.onFlip("c0");
    const vm = buildPlayViewModel(ctrl.getState()!);
    expect(vm.cardViews.some((c) => c.flipping)).toBe(true);
  });
});
