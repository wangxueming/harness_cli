import type { GameSessionMeta, GameSessionState } from "../types/game.js";
import { initialHistory } from "../service/history-service.js";
import { pickForChallenge } from "../service/level-selector.js";
import { createInitialBoard } from "../service/merge-engine.js";
import { GameSessionController } from "./game-session-controller.js";

export class ChallengeSessionController extends GameSessionController {
  startChallenge(levelNumber: number, cardsLabel?: string): GameSessionState {
    this.stopTimer();
    const { puzzle, cards } = pickForChallenge(
      levelNumber,
      cardsLabel,
      "normal"
    );
    const board = createInitialBoard(cards);
    const meta: GameSessionMeta = {
      kind: "challenge",
      gameMode: "normal",
      playMode: "free",
      levelNumber,
      puzzle,
      hintUsed: false,
      startedAt: Date.now(),
      scoreWrites: false,
      progressWrites: false,
    };
    this.state = {
      meta,
      board,
      history: initialHistory(board),
      explore: null,
      elapsed: 0,
      phase: "playing",
      feedback: "",
      hintLines: [],
      lastJudge: null,
      selectedIds: [],
      pendingOp: null,
      flippingCardId: null,
    };
    this.startTimer();
    return this.getState()!;
  }

  exitChallenge(): { type: "navigate"; url: string } {
    this.stopTimer();
    if (this.state) this.state.phase = "finished";
    return { type: "navigate", url: "/pages/home/home" };
  }
}

export const challengeSession = new ChallengeSessionController();
