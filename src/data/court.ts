import type { Vec, RotationNumber } from '../types';

// ---------------------------------------------------------------------------
// Court geometry (in 0-100 relative units, see types.ts for the convention).
// ---------------------------------------------------------------------------

export const NET_Y = 0;
export const ATTACK_LINE_Y = 33; // 3-meter line (1/3 of the 9m court depth)
export const BASELINE_Y = 100;
export const SERVE_Y = 110; // behind the baseline

/**
 * Pre-serve standing spot for each rotational zone. These are legal by
 * construction (front row closer to the net than the matching back-row player,
 * and correct left/right ordering within each row).
 *
 *   zone 4 (FL) | zone 3 (FM) | zone 2 (FR)      <- front row, near the net
 *   zone 5 (BL) | zone 6 (BM) | zone 1 (BR)      <- back row, near baseline
 */
export const ZONE_POS: Record<number, Vec> = {
  1: { x: 78, y: 76 }, // back right
  2: { x: 78, y: 28 }, // front right
  3: { x: 50, y: 24 }, // front middle
  4: { x: 22, y: 28 }, // front left
  5: { x: 22, y: 76 }, // back left
  6: { x: 50, y: 80 }, // back middle
};

export const FRONT_ZONES = [2, 3, 4];
export const BACK_ZONES = [1, 5, 6];

/** Zone label anchor points used to faintly print 1-6 in the background. */
export const ZONE_LABEL_POS: Record<number, Vec> = {
  1: { x: 84, y: 64 },
  2: { x: 84, y: 16 },
  3: { x: 50, y: 13 },
  4: { x: 16, y: 16 },
  5: { x: 16, y: 64 },
  6: { x: 50, y: 64 },
};

// Where the setter delivers the ball from (right-of-centre at the net).
export const SETTER_TARGET: Vec = { x: 64, y: 13 };

// Back-row setter's "ready to set" base when our team is serving.
export const SETTER_BASE: Vec = { x: 70, y: 38 };

// Attack approach end-points (where a hitter jumps).
export const ATTACK: Record<'left' | 'mid' | 'right', Vec> = {
  left: { x: 18, y: 11 },
  mid: { x: 49, y: 9 },
  right: { x: 82, y: 11 },
};

// Base defensive positions after the switch is complete.
export const BASE_DEF = {
  LF: { x: 20, y: 19 },
  MF: { x: 50, y: 15 },
  RF: { x: 80, y: 19 },
  LB: { x: 16, y: 74 },
  CB: { x: 50, y: 90 },
  RB: { x: 84, y: 74 },
} satisfies Record<string, Vec>;

// A representative passing target for the first contact.
export const PASS_TARGET: Vec = { x: 52, y: 56 };

// ---------------------------------------------------------------------------
// Rotation math
// ---------------------------------------------------------------------------

/**
 * Index into the rotation-order array for the player standing in `zone`
 * during rotation `rotation` (1-6). Players rotate clockwise, so each rotation
 * the player from the next-higher zone moves into the lower zone.
 */
export function playerIndexInZone(zone: number, rotation: RotationNumber): number {
  return (zone - 1 + (rotation - 1)) % 6;
}

/** The zone a given rotation-order index occupies during `rotation`. */
export function zoneOfIndex(index: number, rotation: RotationNumber): number {
  // inverse of playerIndexInZone
  return ((index - (rotation - 1)) % 6 + 6) % 6 + 1;
}

export function isFrontRow(zone: number): boolean {
  return FRONT_ZONES.includes(zone);
}

// ---------------------------------------------------------------------------
// Overlap rule
// ---------------------------------------------------------------------------

/** Front/back overlap partners: a front-row player must be closer to the net. */
export const FRONT_BACK_PAIRS: [number, number][] = [
  [2, 1],
  [3, 6],
  [4, 5],
];

/** Left-to-right order that must be preserved within each row. */
export const ROW_ORDER: { front: number[]; back: number[] } = {
  front: [4, 3, 2],
  back: [5, 6, 1],
};

export interface OverlapViolation {
  message: string;
  /** Zones involved in the violation. */
  zones: number[];
}

/**
 * Validate a set of positions keyed by the zone each player occupies.
 * The serving player's zone may be omitted (they stand behind the line and are
 * exempt from the overlap rule).
 */
export function checkOverlap(zonePositions: Record<number, Vec>): OverlapViolation[] {
  const violations: OverlapViolation[] = [];
  const margin = 0.5;

  for (const [front, back] of FRONT_BACK_PAIRS) {
    const f = zonePositions[front];
    const b = zonePositions[back];
    if (f && b && f.y > b.y - margin) {
      violations.push({
        message: `Zone ${front} must stay closer to the net than zone ${back}.`,
        zones: [front, back],
      });
    }
  }

  for (const row of [ROW_ORDER.front, ROW_ORDER.back]) {
    for (let i = 0; i < row.length - 1; i++) {
      const leftZone = row[i];
      const rightZone = row[i + 1];
      const l = zonePositions[leftZone];
      const r = zonePositions[rightZone];
      if (l && r && l.x > r.x - margin) {
        violations.push({
          message: `Zone ${leftZone} must stay left of zone ${rightZone}.`,
          zones: [leftZone, rightZone],
        });
      }
    }
  }

  return violations;
}
