import type { GameMode, PersistedState, PlayMode } from "../../types/game.js";

export function formatWinRate(wins: number, attempts: number): number {
  if (attempts === 0) return 0;
  return Math.round((wins / attempts) * 100);
}

export function buildHomeViewModel(state: PersistedState) {
  return {
    levelNumber: state.mainlineLevel,
    winRate: formatWinRate(state.score.wins, state.score.attempts),
    gameMode: state.prefs.gameMode ?? "",
    playMode: state.prefs.playMode ?? "",
  };
}

export type HomeStartResult =
  | { ok: true; url: string }
  | { ok: false; toast: string };

export function validateAndStart(
  state: PersistedState,
  gameMode: GameMode | "",
  playMode: PlayMode | ""
): HomeStartResult {
  if (!gameMode) {
    return { ok: false, toast: "请选择游戏模式" };
  }
  if (!playMode) {
    return { ok: false, toast: "请选择玩法" };
  }
  return {
    ok: true,
    url: `/pages/play/play?level=${state.mainlineLevel}&gameMode=${gameMode}&playMode=${playMode}`,
  };
}

export function onGameModeChange(value: string): GameMode | "" {
  return value === "normal" || value === "dual-face" ? value : "";
}

export function onPlayModeChange(value: string): PlayMode | "" {
  return value === "free" || value === "explore" ? value : "";
}

export function splashNavigatePath(): string {
  return "/pages/home/home";
}
