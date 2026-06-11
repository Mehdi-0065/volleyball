// Central timing for the animation engine. Durations are in seconds and are
// divided by the playback speed multiplier.

export const MOVE_DURATION = 1.15; // per-player transition
export const STAGGER = 0.045; // delay between players so the eye can follow
export const BALL_DURATION = 0.95;

/** How long a phase is displayed before auto-advancing (movement + a hold). */
export function phaseHoldMs(speed: number): number {
  return (MOVE_DURATION + 1.0) * 1000 / speed;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
