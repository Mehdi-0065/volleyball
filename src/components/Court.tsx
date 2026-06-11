import { motion } from 'framer-motion';
import { useTrainer } from '../store';
import { getSystem } from '../data/build';
import {
  ATTACK_LINE_Y,
  BASELINE_Y,
  ZONE_LABEL_POS,
  playerIndexInZone,
  checkOverlap,
  FRONT_BACK_PAIRS,
  ROW_ORDER,
} from '../data/court';
import { ROLE_COLORS } from '../roles';
import { MOVE_DURATION, STAGGER, BALL_DURATION, prefersReducedMotion } from '../anim';
import type { PlayerDef, Vec } from '../types';

const TOKEN_R = 5.2;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Court() {
  const systemName = useTrainer((s) => s.systemName);
  const rotation = useTrainer((s) => s.rotation);
  const scenario = useTrainer((s) => s.scenario);
  const phaseIndex = useTrainer((s) => s.phaseIndex);
  const speed = useTrainer((s) => s.speed);
  const showArrows = useTrainer((s) => s.showArrows);
  const showOverlap = useTrainer((s) => s.showOverlap);
  const showZones = useTrainer((s) => s.showZones);
  const tokenStyle = useTrainer((s) => s.tokenStyle);
  const names = useTrainer((s) => s.names);

  const system = getSystem(systemName);
  const rot = system.rotations.find((r) => r.rotation === rotation)!;
  const scenarioData = rot[scenario];
  const phases = scenarioData.phases;
  const idx = Math.min(phaseIndex, phases.length - 1);
  const phase = phases[idx];
  const prevPhase = idx > 0 ? phases[idx - 1] : null;
  const setterId = rot.setterId;
  const reduce = prefersReducedMotion();

  const zonePlayer: Record<number, PlayerDef> = {};
  for (let z = 1; z <= 6; z++) zonePlayer[z] = system.players[playerIndexInZone(z, rotation)];

  const isPreServe = idx === 0;
  const showGuides = showOverlap && isPreServe;

  const zonePositions: Record<number, Vec> = {};
  for (let z = 1; z <= 6; z++) {
    if (scenario === 'serve' && z === 1) continue;
    zonePositions[z] = phase.positions[zonePlayer[z].id];
  }
  const violations = showGuides ? checkOverlap(zonePositions) : [];
  const illegalZones = new Set(violations.flatMap((v) => v.zones));

  const ballPoints = phase.ball?.points ?? [];
  const remountKey = `${systemName}-${rotation}-${scenario}`;

  return (
    <div className="relative w-full">
      <svg
        viewBox="-10 -34 120 162"
        className="w-full h-auto select-none"
        role="img"
        aria-label={`${systemName} system, rotation ${rotation}, ${scenario === 'serve' ? 'we serve' : 'they serve'}`}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" className="fill-slate-400 dark:fill-slate-500" />
          </marker>
          <linearGradient id="courtGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.16" />
          </linearGradient>
          <filter id="tokenShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.8" stdDeviation="0.9" floodColor="#0f172a" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Opponent court hint */}
        <rect x={0} y={-30} width={100} height={30} className="fill-slate-200/40 dark:fill-slate-700/30" rx={1} />
        <text x={50} y={-13} textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize={4.5} fontWeight={600}>
          OPPONENT SIDE
        </text>

        {/* Our court */}
        <rect x={0} y={0} width={100} height={BASELINE_Y} fill="url(#courtGrad)" rx={1} />
        <rect x={0} y={0} width={100} height={BASELINE_Y} fill="none" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth={0.8} />
        <line
          x1={0}
          y1={ATTACK_LINE_Y}
          x2={100}
          y2={ATTACK_LINE_Y}
          className="stroke-slate-300 dark:stroke-slate-600"
          strokeWidth={0.6}
          strokeDasharray="3 2"
        />

        {showZones &&
          Object.entries(ZONE_LABEL_POS).map(([z, p]) => (
            <text
              key={z}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-300 dark:fill-slate-700"
              fontSize={11}
              fontWeight={800}
            >
              {z}
            </text>
          ))}

        {/* Net */}
        <line x1={-5} y1={0} x2={105} y2={0} className="stroke-slate-700 dark:stroke-slate-300" strokeWidth={1.8} strokeLinecap="round" />
        <text x={-7} y={0} textAnchor="end" dominantBaseline="middle" className="fill-slate-400" fontSize={4} fontWeight={700}>
          NET
        </text>

        {showGuides && <OverlapGuides zonePlayer={zonePlayer} positions={phase.positions} scenario={scenario} />}

        {/* Movement arrows */}
        {showArrows && prevPhase && (
          <g>
            {system.players.map((p) => {
              const from = prevPhase.positions[p.id];
              const to = phase.positions[p.id];
              if (!from || !to) return null;
              const dist = Math.hypot(to.x - from.x, to.y - from.y);
              if (dist < 4) return null;
              return (
                <motion.line
                  key={`arrow-${p.id}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className="stroke-slate-400/70 dark:stroke-slate-500/70"
                  strokeWidth={0.7}
                  strokeDasharray="2.5 2"
                  markerEnd="url(#arrow)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}
          </g>
        )}

        {/* Players */}
        <g key={remountKey}>
          {system.players.map((p, i) => {
            const pos = phase.positions[p.id];
            const zone = Number(Object.keys(zonePlayer).find((z) => zonePlayer[Number(z)].id === p.id));
            const illegal = showGuides && illegalZones.has(zone);
            const customName = names[`${systemName}:${p.id}`];
            const below = customName ?? (tokenStyle === 'figure' ? p.label : undefined);

            return (
              <motion.g
                key={p.id}
                initial={{ x: pos.x, y: pos.y, opacity: 0, scale: 0.5 }}
                animate={{ x: pos.x, y: pos.y, opacity: 1, scale: 1 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        default: { duration: MOVE_DURATION / speed, ease: EASE, delay: (i * STAGGER) / speed },
                        scale: { type: 'spring', stiffness: 260, damping: 17 },
                        opacity: { duration: 0.35 },
                      }
                }
              >
                {p.id === setterId && <SetterRing reduce={reduce} />}

                <ellipse cx={0} cy={TOKEN_R - 0.4} rx={TOKEN_R * 0.85} ry={1.5} fill="#0f172a" opacity={0.18} />

                <circle
                  r={TOKEN_R}
                  fill={illegal ? '#ef4444' : ROLE_COLORS[p.role]}
                  stroke="white"
                  strokeWidth={0.8}
                  filter="url(#tokenShadow)"
                />
                {/* glossy highlight */}
                <ellipse cx={-1.3} cy={-1.7} rx={2.6} ry={1.6} fill="white" opacity={0.22} />

                {tokenStyle === 'figure' ? (
                  <PersonGlyph />
                ) : (
                  <text textAnchor="middle" dominantBaseline="central" fill="white" fontSize={p.label.length > 2 ? 2.9 : 3.5} fontWeight={800}>
                    {p.label}
                  </text>
                )}

                {below && (
                  <g>
                    <rect
                      x={-(below.length * 1.7 + 3) / 2}
                      y={TOKEN_R + 1.6}
                      width={below.length * 1.7 + 3}
                      height={4.6}
                      rx={2.3}
                      className="fill-white/90 dark:fill-slate-900/85"
                    />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      y={TOKEN_R + 3.9}
                      className="fill-slate-800 dark:fill-slate-50"
                      fontSize={3}
                      fontWeight={600}
                    >
                      {below}
                    </text>
                  </g>
                )}
              </motion.g>
            );
          })}
        </g>

        {/* Ball */}
        {ballPoints.length > 0 && (
          <motion.g
            key={`ball-${phase.id}-${idx}`}
            initial={{ x: ballPoints[0].x, y: ballPoints[0].y }}
            animate={{ x: ballPoints.map((pt) => pt.x), y: ballPoints.map((pt) => pt.y) }}
            transition={reduce || ballPoints.length < 2 ? { duration: 0 } : { duration: BALL_DURATION / speed, ease: 'easeInOut' }}
          >
            <ellipse cx={0} cy={3.1} rx={2.5} ry={0.9} fill="#0f172a" opacity={0.18} />
            <motion.g
              animate={reduce ? {} : { scale: [1, 1.1, 1] }}
              transition={reduce ? {} : { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <g transform="scale(0.1556)">
                <circle r={18} fill="#fde68a" stroke="#b45309" strokeWidth={1.4} />
                <g fill="none" stroke="#1e3a8a" strokeWidth={1.9} strokeLinecap="round">
                  <path d="M0 -18 C -6 -8, -6 8, 0 18" />
                  <path d="M-16 -6 C -4 -2, 10 -4, 18 -10" />
                  <path d="M-16 8 C -6 4, 10 6, 18 12" />
                </g>
              </g>
            </motion.g>
          </motion.g>
        )}
      </svg>
    </div>
  );
}

function SetterRing({ reduce }: { reduce: boolean }) {
  return (
    <motion.circle
      r={TOKEN_R + 2}
      fill="none"
      className="stroke-amber-400"
      strokeWidth={1.1}
      animate={reduce ? {} : { scale: [1, 1.15, 1], opacity: [0.95, 0.45, 0.95] }}
      transition={reduce ? {} : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function PersonGlyph() {
  return (
    <g fill="white">
      <circle cx={0} cy={-1.7} r={1.5} />
      <path d="M -2.5 2.9 C -2.5 -0.1, 2.5 -0.1, 2.5 2.9 Z" />
    </g>
  );
}

function OverlapGuides({
  zonePlayer,
  positions,
  scenario,
}: {
  zonePlayer: Record<number, PlayerDef>;
  positions: Record<string, Vec>;
  scenario: string;
}) {
  const lines: { a: Vec; b: Vec; key: string }[] = [];
  const posOf = (zone: number) => positions[zonePlayer[zone].id];

  for (const [front, back] of FRONT_BACK_PAIRS) {
    if (scenario === 'serve' && back === 1) continue;
    lines.push({ a: posOf(front), b: posOf(back), key: `fb-${front}-${back}` });
  }
  for (const row of [ROW_ORDER.front, ROW_ORDER.back]) {
    for (let i = 0; i < row.length - 1; i++) {
      if (scenario === 'serve' && (row[i] === 1 || row[i + 1] === 1)) continue;
      lines.push({ a: posOf(row[i]), b: posOf(row[i + 1]), key: `row-${row[i]}-${row[i + 1]}` });
    }
  }

  return (
    <g>
      {lines.map((l) =>
        l.a && l.b ? (
          <line key={l.key} x1={l.a.x} y1={l.a.y} x2={l.b.x} y2={l.b.y} className="stroke-emerald-400/50" strokeWidth={0.5} strokeDasharray="1.5 1.5" />
        ) : null,
      )}
    </g>
  );
}
