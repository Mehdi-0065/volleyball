import { ROLE_COLORS, ROLE_NAMES, LEGEND_ROLES } from '../roles';

export default function Legend() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Legend</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {LEGEND_ROLES.map((role) => (
          <div key={role} className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full ring-2 ring-white dark:ring-slate-900" style={{ background: ROLE_COLORS[role] }} />
            <span className="text-slate-600 dark:text-slate-300">
              <b className="text-slate-800 dark:text-slate-100">{role}</b> {ROLE_NAMES[role]}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full border-2 border-amber-400" />
          <span className="text-slate-600 dark:text-slate-300">Current setter</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="-20 -20 40 40" aria-hidden>
            <circle r="18" fill="#fde68a" stroke="#b45309" strokeWidth="1.6" />
            <g fill="none" stroke="#1e3a8a" strokeWidth="2.2" strokeLinecap="round">
              <path d="M0 -18 C -6 -8, -6 8, 0 18" />
              <path d="M-16 -6 C -4 -2, 10 -4, 18 -10" />
              <path d="M-16 8 C -6 4, 10 6, 18 12" />
            </g>
          </svg>
          <span className="text-slate-600 dark:text-slate-300">Ball</span>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <svg width="26" height="10" viewBox="0 0 26 10">
            <line x1="1" y1="5" x2="20" y2="5" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
            <path d="M20,1 L25,5 L20,9 z" fill="#94a3b8" />
          </svg>
          <span className="text-slate-600 dark:text-slate-300">Movement path</span>
        </div>
      </div>
    </div>
  );
}
