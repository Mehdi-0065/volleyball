import { useTrainer } from '../store';
import { getSystem } from '../data/build';

export default function PhaseStepper() {
  const systemName = useTrainer((s) => s.systemName);
  const rotation = useTrainer((s) => s.rotation);
  const scenario = useTrainer((s) => s.scenario);
  const phaseIndex = useTrainer((s) => s.phaseIndex);
  const setPhase = useTrainer((s) => s.setPhase);

  const sys = getSystem(systemName);
  const rot = sys.rotations.find((r) => r.rotation === rotation)!;
  const phases = rot[scenario].phases;
  const idx = Math.min(phaseIndex, phases.length - 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
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
