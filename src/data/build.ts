import type {
  System,
  SystemName,
  PlayerDef,
  PlayerId,
  Role,
  RotationData,
  RotationNumber,
  RotationScenario,
  Vec,
  Phase,
} from '../types';
import {
  ZONE_POS,
  SERVE_Y,
  SETTER_TARGET,
  SETTER_BASE,
  ATTACK,
  BASE_DEF,
  PASS_TARGET,
  FRONT_ZONES,
  BACK_ZONES,
  playerIndexInZone,
} from './court';

// ---------------------------------------------------------------------------
// System specifications. The `order` array is the rotation order: index 0 is
// the player standing in zone 1 during rotation 1. Setters are placed opposite
// (3 apart) their partner so exactly one setter is in the front/back row at a
// time, matching real lineups.
// ---------------------------------------------------------------------------

type SetterRule = 'front-setter' | 'back-setter' | 'single' | 'zone2';

interface SystemSpec {
  name: SystemName;
  description: string;
  order: PlayerDef[];
  setterRule: SetterRule;
  /** Beginner systems (6-6) don't switch positions after the serve. */
  noSwitch?: boolean;
}

const SYSTEM_SPECS: SystemSpec[] = [
  {
    name: '4-2',
    description: 'Two setters opposite each other; the front-row setter sets. Only two front-row attackers.',
    setterRule: 'front-setter',
    order: [
      { id: 'S1', role: 'S', label: 'S1' },
      { id: 'OH1', role: 'OH', label: 'OH1' },
      { id: 'MB1', role: 'MB', label: 'MB1' },
      { id: 'S2', role: 'S', label: 'S2' },
      { id: 'OH2', role: 'OH', label: 'OH2' },
      { id: 'MB2', role: 'MB', label: 'MB2' },
    ],
  },
  {
    name: '6-2',
    description: 'Two setters opposite each other; the back-row setter penetrates to set, keeping three front-row attackers.',
    setterRule: 'back-setter',
    order: [
      { id: 'S1', role: 'S', label: 'S1' },
      { id: 'OH1', role: 'OH', label: 'OH1' },
      { id: 'MB1', role: 'MB', label: 'MB1' },
      { id: 'S2', role: 'S', label: 'S2' },
      { id: 'OH2', role: 'OH', label: 'OH2' },
      { id: 'MB2', role: 'MB', label: 'MB2' },
    ],
  },
  {
    name: '5-1',
    description: 'One setter runs the whole match: like a 4-2 when front row, like a 6-2 (penetrating) when back row.',
    setterRule: 'single',
    order: [
      { id: 'S', role: 'S', label: 'S' },
      { id: 'OH1', role: 'OH', label: 'OH1' },
      { id: 'MB1', role: 'MB', label: 'MB1' },
      { id: 'OPP', role: 'OPP', label: 'OPP' },
      { id: 'OH2', role: 'OH', label: 'OH2' },
      { id: 'MB2', role: 'MB', label: 'MB2' },
    ],
  },
  {
    name: '6-6',
    description: 'Beginner system with no specialists: whoever rotates into the front-right zone (zone 2) sets.',
    setterRule: 'zone2',
    noSwitch: true,
    order: [
      { id: 'P1', role: 'GEN', label: 'P1' },
      { id: 'P2', role: 'GEN', label: 'P2' },
      { id: 'P3', role: 'GEN', label: 'P3' },
      { id: 'P4', role: 'GEN', label: 'P4' },
      { id: 'P5', role: 'GEN', label: 'P5' },
      { id: 'P6', role: 'GEN', label: 'P6' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SlotName = 'left' | 'mid' | 'right';

const APPROACH_START: Record<SlotName, Vec> = {
  left: { x: 18, y: 33 },
  mid: { x: 46, y: 31 },
  right: { x: 80, y: 33 },
};

const BASE_DEF_FRONT: Record<SlotName, Vec> = {
  left: BASE_DEF.LF,
  mid: BASE_DEF.MF,
  right: BASE_DEF.RF,
};

const BASE_DEF_BACK: Record<SlotName, Vec> = {
  left: BASE_DEF.LB,
  mid: BASE_DEF.CB,
  right: BASE_DEF.RB,
};

function frontSlot(role: Role): SlotName {
  if (role === 'OH') return 'left';
  if (role === 'MB') return 'mid';
  return 'right'; // S or OPP play the right side
}

/** zone -> player for a given rotation. */
function zonePlayers(order: PlayerDef[], rotation: RotationNumber): Record<number, PlayerDef> {
  const map: Record<number, PlayerDef> = {};
  for (let zone = 1; zone <= 6; zone++) {
    map[zone] = order[playerIndexInZone(zone, rotation)];
  }
  return map;
}

function zoneOf(zp: Record<number, PlayerDef>, id: PlayerId): number {
  for (let zone = 1; zone <= 6; zone++) {
    if (zp[zone].id === id) return zone;
  }
  return 1;
}

function findSetter(spec: SystemSpec, zp: Record<number, PlayerDef>): PlayerId {
  switch (spec.setterRule) {
    case 'zone2':
      return zp[2].id;
    case 'single':
      return spec.order.find((p) => p.role === 'S')!.id;
    case 'front-setter':
      return FRONT_ZONES.map((z) => zp[z]).find((p) => p.role === 'S')!.id;
    case 'back-setter':
      return BACK_ZONES.map((z) => zp[z]).find((p) => p.role === 'S')!.id;
  }
}

/** Legal pre-serve standing positions (one player per zone). */
function basePositions(zp: Record<number, PlayerDef>): Record<PlayerId, Vec> {
  const pos: Record<PlayerId, Vec> = {};
  for (let zone = 1; zone <= 6; zone++) {
    pos[zp[zone].id] = { ...ZONE_POS[zone] };
  }
  return pos;
}

/**
 * Clamp a setter's desired "hide" position so the pre-serve formation stays
 * legal relative to the (fixed) base positions of adjacent players.
 */
function clampLegalHide(setterZone: number, desired: Vec, base: Record<PlayerId, Vec>, zp: Record<number, PlayerDef>): Vec {
  const m = 6; // keep a clear margin so the overlap is never borderline
  let { x, y } = desired;

  const isFront = FRONT_ZONES.includes(setterZone);

  // Left / right neighbours within the same row.
  const rowOrder = isFront ? [4, 3, 2] : [5, 6, 1];
  const idx = rowOrder.indexOf(setterZone);
  if (idx > 0) {
    const leftPos = base[zp[rowOrder[idx - 1]].id];
    x = Math.max(x, leftPos.x + m);
  }
  if (idx < rowOrder.length - 1) {
    const rightPos = base[zp[rowOrder[idx + 1]].id];
    x = Math.min(x, rightPos.x - m);
  }

  // Front / back partner constraint.
  const pairs: [number, number][] = [
    [2, 1],
    [3, 6],
    [4, 5],
  ];
  for (const [front, back] of pairs) {
    if (setterZone === front) {
      const backPos = base[zp[back].id];
      y = Math.min(y, backPos.y - m);
    }
    if (setterZone === back) {
      const frontPos = base[zp[front].id];
      y = Math.max(y, frontPos.y + m);
    }
  }

  return { x, y };
}

/** Positions once the team has switched into base defence. */
function baseDefense(
  spec: SystemSpec,
  zp: Record<number, PlayerDef>,
  setterId: PlayerId,
): Record<PlayerId, Vec> {
  if (spec.noSwitch) {
    // Beginners simply hold their rotational spots.
    return basePositions(zp);
  }

  const pos: Record<PlayerId, Vec> = {};

  for (const zone of FRONT_ZONES) {
    const p = zp[zone];
    pos[p.id] = { ...BASE_DEF_FRONT[frontSlot(p.role)] };
  }

  for (const zone of BACK_ZONES) {
    const p = zp[zone];
    if (p.id === setterId) {
      // The setter who runs this rotation penetrates / transitions to the net.
      pos[p.id] = { ...SETTER_BASE };
    } else {
      // Back row mirrors the front-row specialties: OH left-back, MB
      // middle-back, setter/opposite right-back.
      pos[p.id] = { ...BASE_DEF_BACK[frontSlot(p.role)] };
    }
  }

  return pos;
}

/** Pick the primary attacker for a serve-receive rally. */
function pickAttacker(zp: Record<number, PlayerDef>): { id: PlayerId; slot: SlotName } {
  const front = FRONT_ZONES.map((z) => zp[z]);
  const oh = front.find((p) => p.role === 'OH');
  if (oh) return { id: oh.id, slot: 'left' };
  const opp = front.find((p) => p.role === 'OPP' || p.role === 'S');
  if (opp) return { id: opp.id, slot: 'right' };
  const mb = front.find((p) => p.role === 'MB');
  if (mb) return { id: mb.id, slot: 'mid' };
  return { id: zp[4].id, slot: 'left' };
}

// ---------------------------------------------------------------------------
// Scenario builders
// ---------------------------------------------------------------------------

function buildServe(spec: SystemSpec, zp: Record<number, PlayerDef>, setterId: PlayerId): RotationScenario {
  const serverId = zp[1].id;
  const serveX = ZONE_POS[1].x;

  const pre = basePositions(zp);
  pre[serverId] = { x: serveX, y: SERVE_Y };

  const phase1: Phase = {
    id: 'serve-1',
    caption: 'Before the serve: everyone holds a legal rotation; the server waits behind the baseline.',
    positions: pre,
    ball: { points: [{ x: serveX, y: SERVE_Y + 1 }] },
  };

  const phase2: Phase = {
    id: 'serve-2',
    caption: 'Serve contact: the ball crosses the net — this is the moment players are released.',
    positions: { ...pre },
    ball: {
      points: [
        { x: serveX, y: SERVE_Y - 2 },
        { x: 58, y: 20 },
        { x: 40, y: -24 },
      ],
    },
  };

  const phase3: Phase = {
    id: 'serve-3',
    caption: 'Switch to base defence: front row takes their slots, back row spreads, the server enters the court.',
    positions: baseDefense(spec, zp, setterId),
  };

  return { phases: [phase1, phase2, phase3] };
}

function buildReceive(spec: SystemSpec, zp: Record<number, PlayerDef>, setterId: PlayerId): RotationScenario {
  const base = basePositions(zp);
  const setterZone = zoneOf(zp, setterId);
  const setterFront = FRONT_ZONES.includes(setterZone);

  // Pre-serve: setter hides toward the release point, but stays legal. A
  // front-row setter creeps toward the net inside their own lane; a back-row
  // setter shifts toward the right to shorten the penetration run.
  const desiredHide: Vec = setterFront
    ? { x: ZONE_POS[setterZone].x, y: 16 }
    : { x: 72, y: 48 };
  const hide = spec.noSwitch ? base[setterId] : clampLegalHide(setterZone, desiredHide, base, zp);

  const pre: Record<PlayerId, Vec> = { ...base, [setterId]: hide };

  const oppServeX = 62;

  const phase1: Phase = {
    id: 'recv-1',
    caption: 'Serve receive: a legal passing formation. Players must hold legal spots until the serve is contacted.',
    positions: pre,
    ball: { points: [{ x: oppServeX, y: -20 }] },
  };

  // Serve contact: setter releases to the target, front hitters open up.
  const release: Record<PlayerId, Vec> = { ...pre };
  if (!spec.noSwitch) {
    release[setterId] = { ...SETTER_TARGET };
    for (const zone of FRONT_ZONES) {
      const p = zp[zone];
      if (p.id === setterId) continue;
      release[p.id] = { ...APPROACH_START[frontSlot(p.role)] };
    }
  } else {
    release[setterId] = { ...SETTER_TARGET };
  }

  const phase2: Phase = {
    id: 'recv-2',
    caption: 'Serve contact: the setter releases to the net and hitters open into their approaches.',
    positions: release,
    ball: {
      points: [
        { x: oppServeX, y: -20 },
        { x: 55, y: 24 },
        { x: PASS_TARGET.x, y: PASS_TARGET.y },
      ],
    },
  };

  // Pass -> set -> attack.
  const attacker = pickAttacker(zp);
  const attackPositions: Record<PlayerId, Vec> = { ...release };
  if (!spec.noSwitch) {
    for (const zone of FRONT_ZONES) {
      const p = zp[zone];
      if (p.id === setterId) continue;
      attackPositions[p.id] = { ...APPROACH_START[frontSlot(p.role)] };
    }
  }
  attackPositions[setterId] = { ...SETTER_TARGET };
  attackPositions[attacker.id] = { ...ATTACK[attacker.slot] };

  const phase3: Phase = {
    id: 'recv-3',
    caption: 'Pass to the setter, set, and attack: the ball is driven back over the net.',
    positions: attackPositions,
    ball: {
      points: [
        { x: PASS_TARGET.x, y: PASS_TARGET.y },
        { x: SETTER_TARGET.x, y: SETTER_TARGET.y },
        { x: ATTACK[attacker.slot].x, y: ATTACK[attacker.slot].y },
        { x: 52, y: -24 },
      ],
    },
  };

  const phase4: Phase = {
    id: 'recv-4',
    caption: 'Transition to base defence: blockers set at the net, back row covers — the spots they defend from.',
    positions: baseDefense(spec, zp, setterId),
  };

  return { phases: [phase1, phase2, phase3, phase4] };
}

// ---------------------------------------------------------------------------
// Explainer bullets
// ---------------------------------------------------------------------------

function buildBullets(spec: SystemSpec, zp: Record<number, PlayerDef>, setterId: PlayerId): string[] {
  const setterZone = zoneOf(zp, setterId);
  const setterFront = FRONT_ZONES.includes(setterZone);
  const bullets: string[] = [];

  if (spec.noSwitch) {
    bullets.push(`The player in zone 2 (${zp[2].label}) sets this rotation — no one specialises.`);
    bullets.push('No switching: everyone simply defends from their rotational spot.');
    bullets.push('Great for learning where each zone lives and how rotations cycle.');
    return bullets;
  }

  const frontAttackers = FRONT_ZONES.map((z) => zp[z]).filter((p) => p.id !== setterId);
  const attackerLabels = frontAttackers.map((p) => p.label).join(' + ');

  if (setterFront) {
    bullets.push(`Setter is front row (zone ${setterZone}) and sets at the net — only two front-row attackers.`);
  } else {
    bullets.push(`Setter penetrates from the back row (zone ${setterZone}) to set, keeping three front-row attackers.`);
  }

  bullets.push(`Front-row attackers: ${attackerLabels} (OH left, MB middle, right-side stays right).`);
  bullets.push('Key switch: both rows specialise — OH left, MB middle, setter/right-side right (front and back).');

  if (!setterFront && (spec.name === '6-2' || spec.name === '5-1')) {
    bullets.push('Restriction: the back-row setter may not attack above the net in front of the 3m line.');
  }

  return bullets;
}

// ---------------------------------------------------------------------------
// Public build
// ---------------------------------------------------------------------------

function buildRotation(spec: SystemSpec, rotation: RotationNumber): RotationData {
  const zp = zonePlayers(spec.order, rotation);
  const setterId = findSetter(spec, zp);
  return {
    rotation,
    setterId,
    serve: buildServe(spec, zp, setterId),
    receive: buildReceive(spec, zp, setterId),
    bullets: buildBullets(spec, zp, setterId),
  };
}

function buildSystem(spec: SystemSpec): System {
  return {
    name: spec.name,
    description: spec.description,
    players: spec.order,
    rotations: ([1, 2, 3, 4, 5, 6] as RotationNumber[]).map((r) => buildRotation(spec, r)),
  };
}

export const SYSTEMS: System[] = SYSTEM_SPECS.map(buildSystem);

export function getSystem(name: SystemName): System {
  return SYSTEMS.find((s) => s.name === name)!;
}
