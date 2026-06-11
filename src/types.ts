// ---------------------------------------------------------------------------
// Core domain types for the Volleyball Rotation Trainer.
//
// All court coordinates use a 0-100 relative unit system so the SVG can scale
// to any size:
//   x: 0 = left sideline, 100 = right sideline
//   y: 0 = the net (top), 100 = our baseline (bottom)
//   y > 100  => behind the baseline (e.g. the server's serving position)
//   y < 0    => the opponent's side of the net (used for ball paths only)
// ---------------------------------------------------------------------------

export type Role = 'S' | 'OH' | 'MB' | 'OPP' | 'GEN';

export type SystemName = '4-2' | '6-2' | '5-1' | '6-6';

export type ScenarioId = 'serve' | 'receive';

export type PlayerId = string;

export type RotationNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface Vec {
  x: number;
  y: number;
}

/** A polyline the animated ball travels along during a phase. */
export interface BallPath {
  points: Vec[];
}

/** A single, held frame of an animation sequence. */
export interface Phase {
  id: string;
  /** Short, beginner-friendly description of what is happening. */
  caption: string;
  /** Where every player stands during this phase. */
  positions: Record<PlayerId, Vec>;
  /** Optional ball travel for this phase. */
  ball?: BallPath;
}

export interface RotationScenario {
  phases: Phase[];
}

export interface PlayerDef {
  id: PlayerId;
  role: Role;
  label: string;
}

export interface RotationData {
  rotation: RotationNumber;
  /** Which player sets in this rotation. */
  setterId: PlayerId;
  serve: RotationScenario;
  receive: RotationScenario;
  /** 2-4 teaching bullet points for this rotation. */
  bullets: string[];
}

export interface System {
  name: SystemName;
  description: string;
  players: PlayerDef[];
  rotations: RotationData[];
}
