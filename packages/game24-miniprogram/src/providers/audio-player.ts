import type { SoundEvent } from "../types/game.js";

export type AudioContextLike = {
  play(event: SoundEvent): void;
};

let audioContext: AudioContextLike | null = null;

export function setAudioContext(ctx: AudioContextLike | null): void {
  audioContext = ctx;
}

export function play(event: SoundEvent): void {
  try {
    audioContext?.play(event);
  } catch {
    // silent per Req 12.4
  }
}
