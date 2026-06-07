import type { AudioPort, PersistencePort } from "../types/game.js";

export const noopPersistence: PersistencePort = {
  loadState: () => ({
    score: { wins: 0, attempts: 0 },
    mainlineLevel: 1,
    prefs: {},
  }),
  recordWin: () => ({ wins: 0, attempts: 0 }),
  recordAttempt: () => ({ wins: 0, attempts: 0 }),
  advanceMainlineLevel: () => 1,
};

export const noopAudio: AudioPort = {
  play: () => {},
};

export type { AudioPort, PersistencePort };
