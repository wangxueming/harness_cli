import { describe, expect, it, beforeEach } from "vitest";
import {
  advanceMainlineLevel,
  loadScore,
  loadState,
  recordAttempt,
  recordWin,
  resetMemoryState,
} from "../providers/score-store.js";
import { setWxStorageAdapter } from "./wx-storage.js";
import type { PersistencePort } from "../types/game.js";

export function createPersistencePort(): PersistencePort {
  return {
    loadState,
    recordWin,
    recordAttempt,
    advanceMainlineLevel,
  };
}

describe("providers", () => {
  beforeEach(() => {
    const store = new Map<string, unknown>();
    setWxStorageAdapter({
      getStorageSync: (k) => store.get(k),
      setStorageSync: (k, v) => store.set(k, v),
    });
    resetMemoryState();
  });

  it("wx-storage safeGet defaults", async () => {
    const { safeGet, set } = await import("./wx-storage.js");
    expect(safeGet("missing", 42)).toBe(42);
    set("k", 1);
    expect(safeGet("k", 42)).toBe(1);
  });

  it("score-store recordWin and recordAttempt", () => {
    recordWin();
    expect(loadScore()).toEqual({ wins: 1, attempts: 1 });
    recordAttempt();
    expect(loadScore()).toEqual({ wins: 1, attempts: 2 });
  });

  it("score-store has no reset export", async () => {
    const mod = await import("./score-store.js");
    expect("resetScore" in mod).toBe(false);
  });

  it("createPersistencePort wires score-store", () => {
    const port = createPersistencePort();
    port.recordWin();
    expect(port.loadState().score.wins).toBe(1);
  });

  it("audio-player fails silently", async () => {
    const { play, setAudioContext } = await import("./audio-player.js");
    setAudioContext({
      play: () => {
        throw new Error("no audio");
      },
    });
    expect(() => play("merge")).not.toThrow();
  });

  it("share-bridge builds challenge path", async () => {
    const { buildSharePath, parseEntryQuery, isChallengeEntry, parseLevelNumber } =
      await import("./share-bridge.js");
    const path = buildSharePath(5, "1,1,2,6");
    expect(path).toContain("mode=challenge");
    expect(path).toContain("level=5");
    const q = parseEntryQuery({
      mode: "challenge",
      level: "5",
      label: "1,1,2,6",
    });
    expect(isChallengeEntry(q)).toBe(true);
    expect(parseLevelNumber(q)).toBe(5);
  });
});
