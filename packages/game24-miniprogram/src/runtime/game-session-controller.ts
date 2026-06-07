import type {
  BoardState,
  GameMode,
  GameSessionMeta,
  HistoryStep,
  JudgeResult,
  Operator,
  PlayMode,
  SessionPhase,
} from "../types/game.js";
import type {
  AudioPort,
  PersistencePort,
} from "../types/game.js";
import { noopAudio, noopPersistence } from "../service/session-ports.js";
import { ExploreTracker } from "../service/explore-tracker.js";
import { append, initialHistory, jumpTo } from "../service/history-service.js";
import { showAnswer } from "../service/hint-service.js";
import { evaluate, shouldAutoJudge } from "../service/judge-service.js";
import { pickForMainline } from "../service/level-selector.js";
import {
  apply,
  canMerge,
  cloneBoard,
  createInitialBoard,
  flipCard,
  formatMergeLabel,
} from "../service/merge-engine.js";

export type GameSessionState = {
  meta: GameSessionMeta;
  board: BoardState;
  history: HistoryStep[];
  explore: ExploreTracker | null;
  elapsed: number;
  phase: SessionPhase;
  feedback: string;
  hintLines: string[];
  lastJudge: JudgeResult | null;
  selectedIds: string[];
  pendingOp: Operator | null;
  flippingCardId: string | null;
};

export type MergeAnimation = {
  fromA: string;
  fromB: string;
  toId: string;
  op: Operator;
};

export type SessionAction =
  | { type: "merge-animation"; animation: MergeAnimation }
  | { type: "flip-animation"; cardId: string }
  | { type: "navigate"; url: string }
  | { type: "toast"; message: string };

export class GameSessionController {
  protected state: GameSessionState | null = null;
  protected timerId: ReturnType<typeof setInterval> | null = null;
  protected persistence: PersistencePort;
  protected audio: AudioPort;

  constructor(
    ports: { persistence?: PersistencePort; audio?: AudioPort } = {}
  ) {
    this.persistence = ports.persistence ?? noopPersistence;
    this.audio = ports.audio ?? noopAudio;
  }

  getState(): GameSessionState | null {
    return this.state ? { ...this.state, board: cloneBoard(this.state.board) } : null;
  }

  start(
    levelNumber: number,
    gameMode: GameMode,
    playMode: PlayMode,
    options?: { scoreWrites?: boolean; progressWrites?: boolean; kind?: GameSessionMeta["kind"] }
  ): GameSessionState {
    this.stopTimer();
    const persisted = this.persistence.loadState();
    const level = levelNumber || persisted.mainlineLevel;
    const { puzzle, cards } = pickForMainline(level, gameMode);
    const board = createInitialBoard(cards);
    const meta: GameSessionMeta = {
      kind: options?.kind ?? "mainline",
      gameMode,
      playMode,
      levelNumber: level,
      puzzle,
      hintUsed: false,
      startedAt: Date.now(),
      scoreWrites: options?.scoreWrites ?? true,
      progressWrites: options?.progressWrites ?? true,
    };
    this.state = {
      meta,
      board,
      history: initialHistory(board),
      explore: playMode === "explore" ? new ExploreTracker(puzzle) : null,
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

  onMerge(idA: string, idB: string, op: Operator): SessionAction[] {
    if (!this.state || this.state.phase === "finished") return [];
    const { board, meta } = this.state;
    if (!canMerge(board, idA, idB, op)) {
      return [{ type: "toast", message: "无法合并" }];
    }

    const left = board.nodes[board.nodeIds.indexOf(idA)]!;
    const right = board.nodes[board.nodeIds.indexOf(idB)]!;
    const nextBoard = apply(board, idA, idB, op);
    const merged = nextBoard.nodes[nextBoard.nodes.length - 1]!;
    const label = formatMergeLabel(left, right, op, merged);

    this.state.board = nextBoard;
    this.state.history = append(this.state.history, nextBoard, label);
    this.state.selectedIds = [];
    this.state.pendingOp = null;
    this.state.feedback = "";
    this.audio.play("merge");

    const actions: SessionAction[] = [
      {
        type: "merge-animation",
        animation: {
          fromA: idA,
          fromB: idB,
          toId: nextBoard.nodeIds[nextBoard.nodeIds.length - 1]!,
          op,
        },
      },
    ];

    if (shouldAutoJudge(nextBoard)) {
      actions.push(...this.onAutoJudge());
    }
    return actions;
  }

  onFlip(cardId: string): SessionAction[] {
    if (!this.state || this.state.phase === "finished") return [];
    const card = this.state.board.cards.find((c) => c.id === cardId);
    if (!card || card.consumed) return [];

    this.state.flippingCardId = cardId;
    this.state.board = flipCard(this.state.board, cardId);
    this.state.history = append(
      this.state.history,
      this.state.board,
      `翻转 ${cardId}`
    );
    this.audio.play("flip");
    return [{ type: "flip-animation", cardId }];
  }

  clearFlipAnimation(): void {
    if (this.state) this.state.flippingCardId = null;
  }

  onHistoryJump(index: number): void {
    if (!this.state || this.state.phase === "finished") return;
    const { steps, board } = jumpTo(this.state.history, index);
    this.state.history = steps;
    this.state.board = board;
    this.state.selectedIds = [];
    this.state.pendingOp = null;
    this.state.feedback = "";
    this.state.lastJudge = null;
    if (this.state.phase === "judged") {
      this.state.phase = "playing";
    }
  }

  onHint(): string[] {
    if (!this.state || this.state.phase === "finished") return [];
    this.state.meta.hintUsed = true;
    this.state.hintLines = showAnswer(
      this.state.meta.puzzle,
      this.state.board.cards
    );
    return this.state.hintLines;
  }

  onEndExplore(): SessionAction[] {
    if (!this.state) return [];
    this.state.phase = "finished";
    this.stopTimer();
    return [{ type: "navigate", url: "/pages/home/home" }];
  }

  onFreeWinComplete(): SessionAction[] {
    if (!this.state) return [];
    const { meta } = this.state;
    if (meta.scoreWrites) {
      this.persistence.recordWin();
    }
    if (meta.progressWrites) {
      this.persistence.advanceMainlineLevel();
    }
    this.state.phase = "finished";
    this.stopTimer();
    const elapsed = this.state.elapsed;
    const hintUsed = meta.hintUsed ? "1" : "0";
    return [
      {
        type: "navigate",
        url: `/pages/result/result?elapsed=${elapsed}&hintUsed=${hintUsed}&level=${meta.levelNumber}&label=${encodeURIComponent(meta.puzzle.cards_label)}`,
      },
    ];
  }

  selectCard(cardId: string): { selectedIds: string[]; pendingOp: Operator | null } {
    if (!this.state || this.state.phase === "finished") {
      return { selectedIds: [], pendingOp: null };
    }
    const activeId = this.state.board.nodeIds.includes(cardId)
      ? cardId
      : this.state.board.cards.find((c) => c.id === cardId && !c.consumed)?.id;
    if (!activeId) return { selectedIds: this.state.selectedIds, pendingOp: this.state.pendingOp };

    let selected = [...this.state.selectedIds];
    if (selected.includes(activeId)) {
      selected = selected.filter((id) => id !== activeId);
    } else if (selected.length < 2) {
      selected.push(activeId);
    } else {
      selected = [activeId];
    }
    this.state.selectedIds = selected;
    return { selectedIds: selected, pendingOp: this.state.pendingOp };
  }

  setOperator(op: Operator): SessionAction[] {
    if (!this.state || this.state.phase === "finished") return [];
    this.state.pendingOp = op;
    const [a, b] = this.state.selectedIds;
    if (a && b) {
      return this.onMerge(a, b, op);
    }
    return [];
  }

  tick(): number {
    if (!this.state || this.state.phase === "finished") return 0;
    this.state.elapsed = Math.floor((Date.now() - this.state.meta.startedAt) / 1000);
    return this.state.elapsed;
  }

  private onAutoJudge(): SessionAction[] {
    if (!this.state) return [];
    const result = evaluate(this.state.board, this.state.meta);
    this.state.lastJudge = result;
    this.state.phase = "judged";
    const actions: SessionAction[] = [];

    if (result.outcome === "wrong") {
      this.audio.play("wrong");
      this.state.feedback = result.message;
      if (this.state.meta.scoreWrites) this.persistence.recordAttempt();
      this.state.phase = "playing";
    } else if (result.outcome === "invalid-usage") {
      this.audio.play("wrong");
      this.state.feedback = result.message;
      if (result.countAttempt && this.state.meta.scoreWrites)
        this.persistence.recordAttempt();
      this.state.phase = "playing";
    } else if (result.outcome === "correct") {
      this.audio.play("correct");
      if (this.state.meta.playMode === "free") {
        this.state.feedback = "恭喜，答案正确！";
        actions.push(...this.onFreeWinComplete());
      } else if (this.state.meta.playMode === "explore") {
        const explore = this.state.explore!;
        const addResult = explore.tryAdd(result.canonicalKey);
        if (this.state.meta.scoreWrites) this.persistence.recordAttempt();
        if (addResult.added) {
          this.state.feedback = `发现新解法！已发现 ${addResult.x}/${this.state.meta.puzzle.solution_count}`;
        } else {
          this.state.feedback = "算对了！";
        }
        this.state.phase = "playing";
      }
    }
    return actions;
  }

  protected startTimer(): void {
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  protected stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

export const mainlineSession = new GameSessionController();