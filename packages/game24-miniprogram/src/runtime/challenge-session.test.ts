import { describe, expect, it, beforeEach } from "vitest";
import { createPersistencePort } from "../providers/score-store.js";
import { setWxStorageAdapter } from "../providers/wx-storage.js";
import { loadScore, resetMemoryState } from "../providers/score-store.js";
import {
  handleAppLaunch,
  resolveLaunchRoute,
} from "./app-router.js";
import { ChallengeSessionController } from "./challenge-session-controller.js";

describe("challenge-session", () => {
  beforeEach(() => {
    const store = new Map<string, unknown>();
    setWxStorageAdapter({
      getStorageSync: (k) => store.get(k),
      setStorageSync: (k, v) => store.set(k, v),
    });
    resetMemoryState({ score: { wins: 2, attempts: 5 }, mainlineLevel: 3, prefs: {} });
  });

  it("does not write score on challenge start", () => {
    const ctrl = new ChallengeSessionController({
      persistence: createPersistencePort(),
    });
    ctrl.startChallenge(5, "1,1,2,6");
    const state = ctrl.getState()!;
    expect(state.meta.scoreWrites).toBe(false);
    expect(state.meta.playMode).toBe("free");
    expect(loadScore()).toEqual({ wins: 2, attempts: 5 });
  });

  it("exitChallenge navigates home", () => {
    const ctrl = new ChallengeSessionController();
    const action = ctrl.exitChallenge();
    expect(action.url).toContain("home");
  });

  it("app-router challenge entry", () => {
    const route = resolveLaunchRoute({
      mode: "challenge",
      level: "7",
      label: "1,1,2,6",
    });
    expect(route.page).toBe("challenge");
    if (route.page === "challenge") {
      expect(route.level).toBe(7);
      expect(route.label).toBe("1,1,2,6");
    }
    const path = handleAppLaunch({ mode: "challenge", level: "3" });
    expect(path).toContain("challenge");
  });

  it("app-router normal launch goes splash", () => {
    expect(resolveLaunchRoute({}).page).toBe("splash");
  });
});
