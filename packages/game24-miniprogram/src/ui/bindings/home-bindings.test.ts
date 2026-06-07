import { describe, expect, it, beforeEach } from "vitest";
import { setWxStorageAdapter } from "../../providers/wx-storage.js";
import { loadState, resetMemoryState } from "../../providers/score-store.js";
import {
  buildHomeViewModel,
  splashNavigatePath,
  validateAndStart,
} from "./home-bindings.js";

describe("home-bindings", () => {
  beforeEach(() => {
    const store = new Map<string, unknown>();
    setWxStorageAdapter({
      getStorageSync: (k) => store.get(k),
      setStorageSync: (k, v) => store.set(k, v),
    });
    resetMemoryState({ score: { wins: 1, attempts: 4 }, mainlineLevel: 2, prefs: {} });
  });

  it("buildHomeViewModel shows level and win rate", () => {
    const vm = buildHomeViewModel(loadState());
    expect(vm.levelNumber).toBe(2);
    expect(vm.winRate).toBe(25);
  });

  it("validateAndStart requires selections", () => {
    const state = loadState();
    expect(validateAndStart(state, "", "free")).toEqual({
      ok: false,
      toast: "请选择游戏模式",
    });
    expect(validateAndStart(state, "normal", "")).toEqual({
      ok: false,
      toast: "请选择玩法",
    });
  });

  it("validateAndStart returns play url", () => {
    const state = loadState();
    state.prefs = { gameMode: "normal", playMode: "free" };
    const r = validateAndStart(state, "normal", "free");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.url).toContain("/pages/play/play");
      expect(r.url).toContain("gameMode=normal");
    }
  });

  it("splashNavigatePath", () => {
    expect(splashNavigatePath()).toBe("/pages/home/home");
  });
});
