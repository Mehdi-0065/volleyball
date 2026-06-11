import type { ReactNode } from 'react';
import { useTrainer } from '../store';
import { getSystem } from '../data/build';

export default function PhaseStepper() {
  const systemName = useTrainer((s) => s.systemName);
  const rotation = useTrainer((s) => s.rotation);
  const scenario = useTrainer((s) => s.scenario);
  const phaseIndex = useTrainer((s) => s.phaseIndex);
  const playing = useTrainer((s) => s.playing);
  const setPhase = useTrainer((s) => s.setPhase);
  const togglePlay = useTrainer((s) => s.togglePlay);
  const restart = useTrainer((s) => s.restart);
  const stepForward = useTrainer((s) => s.stepForward);
  const stepBack = useTrainer((s) => s.stepBack);

  const sys = getSystem(systemName);
  const rot = sys.rotations.find((r) => r.rotation === rotation)!;
  const phases = rot[scenario].phases;
  const idx = Math.min(phaseIndex, phases.length - 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      {/* Quick playback — right under the court for fast play/reset */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <QuickButton label="Step back" onClick={stepBack}>
          <SkipBack />
        </QuickButton>
        <button
          onClick={togglePlay}
          className="flex min-w-[7.5rem] items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-violet-700"
        >
          {playing ? <Pause /> : <Play />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <QuickButton label="Step forward" onClick={stepForward}>
          <SkipForward />
        </QuickButton>
        <QuickButton label="Restart" onClick={restart}>
          <Restart />
        </QuickButton>
      </div>

      <div className="mb-3 flex items-center justify-center gap-2">
        {phases.map((p, i) => {
          const active = i === idx;
          const done = i < idx;
          return (
            <div key={p.id} className="flex items-center gap-2">
              <button
                onClick={() => setPhase(i)}
                aria-label={`Go to phase ${i + 1}`}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
                  active
                    ? 'bg-violet-600 text-white ring-4 ring-violet-200 dark:ring-violet-900'
                    : done
                    ? 'bg-violet-200 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300'
                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                {i + 1}
              </button>
              {i < phases.length - 1 && (
                <div className={`h-0.5 w-4 rounded ${done ? 'bg-violet-300 dark:bg-violet-700' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </div>
          );
        })}
      </div>
      <p className="min-h-[2.5rem] text-center text-sm font-medium leading-snug text-slate-700 dark:text-slate-200">
        {phases[idx].caption}
      </p>
    </div>
  );
}

function QuickButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      {children}
    </button>
  );
}

function Play() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function Pause() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
function SkipForward() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5l9 7-9 7zM16 5h2v14h-2z" />
    </svg>
  );
}
function SkipBack() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 5l-9 7 9 7zM6 5h2v14H6z" />
    </svg>
  );
}
function Restart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
