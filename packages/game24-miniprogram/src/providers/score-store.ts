import type { PersistedState, PersistencePort, ScoreRecord } from "../types/game.js";
import {
  DEFAULT_PERSISTED_STATE,
  loadPersistedState,
  savePersistedState,
} from "./wx-storage.js";

let memory: PersistedState = { ...DEFAULT_PERSISTED_STATE, score: { wins: 0, attempts: 0 } };

export function loadState(): PersistedState {
  memory = loadPersistedState();
  return {
    score: { ...memory.score },
    mainlineLevel: memory.mainlineLevel,
    prefs: { ...memory.prefs },
  };
}

export function loadScore(): ScoreRecord {
  const state = loadState();
  return state.score;
}

export function getMainlineLevel(): number {
  return loadState().mainlineLevel;
}

export function savePrefs(prefs: PersistedState["prefs"]): PersistedState {
  memory = { ...memory, prefs: { ...prefs } };
  savePersistedState(memory);
  return loadState();
}

export function recordWin(): ScoreRecord {
  memory = {
    ...memory,
    score: {
      wins: memory.score.wins + 1,
      attempts: memory.score.attempts + 1,
    },
  };
  savePersistedState(memory);
  return loadScore();
}

export function recordAttempt(): ScoreRecord {
  memory = {
    ...memory,
    score: {
      ...memory.score,
      attempts: memory.score.attempts + 1,
    },
  };
  savePersistedState(memory);
  return loadScore();
}

export function advanceMainlineLevel(): number {
  memory = { ...memory, mainlineLevel: memory.mainlineLevel + 1 };
  savePersistedState(memory);
  return memory.mainlineLevel;
}

export function setMainlineLevel(level: number): void {
  memory = { ...memory, mainlineLevel: level };
  savePersistedState(memory);
}

export function createPersistencePort(): PersistencePort {
  return {
    loadState,
    recordWin,
    recordAttempt,
    advanceMainlineLevel,
  };
}

export function resetMemoryState(state: PersistedState = DEFAULT_PERSISTED_STATE): void {
  memory = {
    score: { ...state.score },
    mainlineLevel: state.mainlineLevel,
    prefs: { ...state.prefs },
  };
  savePersistedState(memory);
}
