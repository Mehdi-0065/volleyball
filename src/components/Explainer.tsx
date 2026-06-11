import { useState } from 'react';
import { useTrainer } from '../store';
import { getSystem } from '../data/build';

export default function Explainer() {
  const systemName = useTrainer((s) => s.systemName);
  const rotation = useTrainer((s) => s.rotation);
  const [showRule, setShowRule] = useState(false);

  const sys = getSystem(systemName);
  const rot = sys.rotations.find((r) => r.rotation === rotation)!;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
          {systemName} · Rotation {rotation}
        </h3>
        <button
          onClick={() => setShowRule((v) => !v)}
          className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300"
        >
          Overlap rule {showRule ? '▲' : '▼'}
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {rot.bullets.map((b, i) => (
          <li key={i} className="flex gap-2 text-sm leading-snug text-slate-600 dark:text-slate-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {showRule && (
        <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <p className="mb-1.5 font-bold">The overlap rule (until serve contact)</p>
          <p className="mb-1.5">
            Each player must keep a legal position relative to their neighbours. A front-row player must be closer to the
            net than the back-row player behind them: <b>2&nbsp;ahead&nbsp;of&nbsp;1</b>, <b>3&nbsp;ahead&nbsp;of&nbsp;6</b>,{' '}
            <b>4&nbsp;ahead&nbsp;of&nbsp;5</b>.
          </p>
          <p>
            Within each row, left/right order is kept: <b>4&nbsp;left&nbsp;of&nbsp;3&nbsp;left&nbsp;of&nbsp;2</b> and{' '}
            <b>5&nbsp;left&nbsp;of&nbsp;6&nbsp;left&nbsp;of&nbsp;1</b>. The instant the serve is contacted, players may move
            anywhere. Turn on <i>Overlap guides</i> to see the constraint lines.
          </p>
        </div>
      )}
    </div>
  );
}
