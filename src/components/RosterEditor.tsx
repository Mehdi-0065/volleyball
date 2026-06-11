import { useState } from 'react';
import { useTrainer } from '../store';
import { getSystem } from '../data/build';
import { ROLE_COLORS } from '../roles';

export default function RosterEditor() {
  const systemName = useTrainer((s) => s.systemName);
  const names = useTrainer((s) => s.names);
  const setName = useTrainer((s) => s.setName);
  const clearNames = useTrainer((s) => s.clearNames);
  const [open, setOpen] = useState(false);

  const system = getSystem(systemName);
  const hasNames = system.players.some((p) => names[`${systemName}:${p.id}`]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Player names</h3>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400"
        >
          {open ? 'Hide' : 'Edit'}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-2">
          {system.players.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <span
                className="flex h-6 w-9 shrink-0 items-center justify-center rounded-md text-[10px] font-extrabold text-white"
                style={{ background: ROLE_COLORS[p.role] }}
              >
                {p.label}
              </span>
              <input
                type="text"
                value={names[`${systemName}:${p.id}`] ?? ''}
                onChange={(e) => setName(systemName, p.id, e.target.value)}
                placeholder="Add a name…"
                maxLength={14}
                className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-violet-900"
              />
            </div>
          ))}
          {hasNames && (
            <button
              onClick={() => clearNames(systemName)}
              className="mt-1 self-start rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Clear names
            </button>
          )}
          <p className="text-[11px] leading-snug text-slate-400 dark:text-slate-500">
            Names show under each token and are saved on this device.
          </p>
        </div>
      )}
    </div>
  );
}
