import { STORAGE_STATE } from "../config/storage-keys.js";
import type { PersistedState, ScoreRecord } from "../types/game.js";

export type WxStorageLike = {
  getStorageSync(key: string): unknown;
  setStorageSync(key: string, value: unknown): void;
};

let storageAdapter: WxStorageLike | null = null;

export function setWxStorageAdapter(adapter: WxStorageLike | null): void {
  storageAdapter = adapter;
}

function getAdapter(): WxStorageLike {
  if (storageAdapter) return storageAdapter;
  if (typeof globalThis !== "undefined") {
    const wxGlobal = (globalThis as { wx?: WxStorageLike }).wx;
    if (wxGlobal) return wxGlobal;
  }
  return {
    getStorageSync: () => undefined,
    setStorageSync: () => {},
  };
}

export function get<T>(key: string): T | undefined {
  try {
    return getAdapter().getStorageSync(key) as T;
  } catch (err) {
    console.warn("[wx-storage] read failed", key, err);
    return undefined;
  }
}

export function safeGet<T>(key: string, defaultValue: T): T {
  const value = get<T>(key);
  return value === undefined || value === null ? defaultValue : value;
}

export function set(key: string, value: unknown): boolean {
  try {
    getAdapter().setStorageSync(key, value);
    return true;
  } catch (err) {
    console.warn("[wx-storage] write failed", key, err);
    return false;
  }
}

export const DEFAULT_PERSISTED_STATE: PersistedState = {
  score: { wins: 0, attempts: 0 },
  mainlineLevel: 1,
  prefs: {},
};

export function loadPersistedState(): PersistedState {
  return safeGet<PersistedState>(STORAGE_STATE, DEFAULT_PERSISTED_STATE);
}

export function savePersistedState(state: PersistedState): boolean {
  return set(STORAGE_STATE, state);
}

export function loadScoreFromState(): ScoreRecord {
  return loadPersistedState().score;
}
