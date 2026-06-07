import { formatElapsed } from "./play-bindings.js";

export function buildChallengeViewModel(
  levelNumber: number,
  elapsed: number
): {
  title: string;
  levelNumber: number;
  elapsedText: string;
  showExploreProgress: false;
} {
  return {
    title: "挑战关卡",
    levelNumber,
    elapsedText: formatElapsed(elapsed),
    showExploreProgress: false,
  };
}

export function parseChallengeQuery(query: Record<string, string | undefined>): {
  level: number;
  label?: string;
} {
  return {
    level: Math.max(1, Number(query.level) || 1),
    label: query.label,
  };
}

export function challengeExitPath(): string {
  return "/pages/home/home";
}
