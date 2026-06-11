import { useTrainer } from '../store';
import { getSystem } from '../data/build';
import type { SystemName } from '../types';

const SYSTEMS: SystemName[] = ['4-2', '6-2', '5-1', '6-6'];

export default function TopBar() {
  const systemName = useTrainer((s) => s.systemName);
  const setSystem = useTrainer((s) => s.setSystem);
  const theme = useTrainer((s) => s.theme);
  const toggleTheme = useTrainer((s) => s.toggleTheme);

  const desc = getSystem(systemName).description;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-lg shadow-card">
              🏐
            </div>
            <div>
              <h1 className="text-base font-extrabold leading-tight text-slate-900 dark:text-white sm:text-lg">
                Volleyball Rotation Trainer
              </h1>
              <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                Learn lineups, movement &amp; the overlap rule
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <nav className="flex flex-wrap gap-2">
          {SYSTEMS.map((name) => {
            const active = name === systemName;
            return (
              <button
                key={name}
                onClick={() => setSystem(name)}
                className={`rounded-xl px-3.5 py-1.5 text-sm font-bold transition ${
                  active
                    ? 'bg-violet-600 text-white shadow-card'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {name}
              </button>
            );
          })}
        </nav>
        <p className="text-xs leading-snug text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </header>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}
