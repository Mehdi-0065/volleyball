import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SystemName, ScenarioId, RotationNumber, PlayerId } from './types';
import { getSystem } from './data/build';

type Theme = 'light' | 'dark';
type TokenStyle = 'label' | 'figure';

interface TrainerState {
  systemName: SystemName;
  rotation: RotationNumber;
  scenario: ScenarioId;
  phaseIndex: number;
  playing: boolean;
  speed: number; // 0.5 - 2
  autoLoop: boolean;

  showArrows: boolean;
  showOverlap: boolean;
  showZones: boolean;

  theme: Theme;
  tokenStyle: TokenStyle;

  /** Custom player names keyed by `${systemName}:${playerId}`. */
  names: Record<string, string>;

  setSystem: (name: SystemName) => void;
  setRotation: (rotation: RotationNumber) => void;
  rotateNext: () => void;
  setScenario: (scenario: ScenarioId) => void;

  setPhase: (index: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBack: () => void;
  restart: () => void;

  setSpeed: (speed: number) => void;
  toggleAutoLoop: () => void;
  toggleArrows: () => void;
  toggleOverlap: () => void;
  toggleZones: () => void;
  toggleTheme: () => void;
  toggleTokenStyle: () => void;

  setName: (systemName: SystemName, playerId: PlayerId, name: string) => void;
  clearNames: (systemName: SystemName) => void;
}

function phaseCount(name: SystemName, rotation: RotationNumber, scenario: ScenarioId): number {
  const sys = getSystem(name);
  const rot = sys.rotations.find((r) => r.rotation === rotation)!;
  return rot[scenario].phases.length;
}

const prefersDark =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : false;

export const useTrainer = create<TrainerState>()(
  persist(
    (set, get) => ({
      systemName: '4-2',
      rotation: 1,
      scenario: 'serve',
      phaseIndex: 0,
      playing: false,
      speed: 1,
      autoLoop: false,

      showArrows: true,
      showOverlap: false,
      showZones: true,

      theme: prefersDark ? 'dark' : 'light',
      tokenStyle: 'label',

      names: {},

      setSystem: (name) => set({ systemName: name, rotation: 1, phaseIndex: 0, playing: false }),
      setRotation: (rotation) => set({ rotation, phaseIndex: 0, playing: false }),
      rotateNext: () =>
        set((s) => ({
          rotation: ((s.rotation % 6) + 1) as RotationNumber,
          phaseIndex: 0,
          playing: false,
        })),
      setScenario: (scenario) => set({ scenario, phaseIndex: 0, playing: false }),

      setPhase: (index) => set({ phaseIndex: index }),
      play: () => set({ playing: true }),
      pause: () => set({ playing: false }),
      togglePlay: () => set((s) => ({ playing: !s.playing })),
      stepForward: () => {
        const { systemName, rotation, scenario, phaseIndex } = get();
        const count = phaseCount(systemName, rotation, scenario);
        set({ phaseIndex: Math.min(phaseIndex + 1, count - 1), playing: false });
      },
      stepBack: () => set((s) => ({ phaseIndex: Math.max(s.phaseIndex - 1, 0), playing: false })),
      restart: () => set({ phaseIndex: 0, playing: false }),

      setSpeed: (speed) => set({ speed }),
      toggleAutoLoop: () => set((s) => ({ autoLoop: !s.autoLoop })),
      toggleArrows: () => set((s) => ({ showArrows: !s.showArrows })),
      toggleOverlap: () => set((s) => ({ showOverlap: !s.showOverlap })),
      toggleZones: () => set((s) => ({ showZones: !s.showZones })),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleTokenStyle: () => set((s) => ({ tokenStyle: s.tokenStyle === 'label' ? 'figure' : 'label' })),

      setName: (systemName, playerId, name) =>
        set((s) => {
          const key = `${systemName}:${playerId}`;
          const names = { ...s.names };
          const trimmed = name.trim();
          if (trimmed) names[key] = trimmed;
          else delete names[key];
          return { names };
        }),
      clearNames: (systemName) =>
        set((s) => {
          const names: Record<string, string> = {};
          for (const [k, v] of Object.entries(s.names)) {
            if (!k.startsWith(`${systemName}:`)) names[k] = v;
          }
          return { names };
        }),
    }),
    {
      name: 'vrt-prefs',
      partialize: (s) => ({
        theme: s.theme,
        tokenStyle: s.tokenStyle,
        names: s.names,
        showArrows: s.showArrows,
        showOverlap: s.showOverlap,
        showZones: s.showZones,
        autoLoop: s.autoLoop,
        speed: s.speed,
      }),
    },
  ),
);

export function nameKey(systemName: SystemName, playerId: PlayerId): string {
  return `${systemName}:${playerId}`;
}

export { phaseCount };
