import type { ReactNode } from 'react';
import { useTrainer } from '../store';
import RosterEditor from './RosterEditor';
import type { RotationNumber, ScenarioId } from '../types';

export default function Controls() {
  const s = useTrainer();
  const rotations: RotationNumber[] = [1, 2, 3, 4, 5, 6];

  return (
    <div className="flex flex-col gap-4">
      {/* Rotation */}
      <Section title="Rotation">
        <div className="flex flex-wrap items-center gap-2">
          {rotations.map((r) => (
            <button
              key={r}
              onClick={() => s.setRotation(r)}
              className={`h-9 w-9 rounded-lg text-sm font-bold transition ${
                s.rotation === r
                  ? 'bg-violet-600 text-white shadow-card'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {r}
            </button>
          ))}
          <button
            onClick={s.rotateNext}
            className="ml-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Rotate →
          </button>
        </div>
      </Section>

      {/* Scenario */}
      <Section title="Scenario">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(['serve', 'receive'] as ScenarioId[]).map((sc) => (
            <button
              key={sc}
              onClick={() => s.setScenario(sc)}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                s.scenario === sc
                  ? 'bg-white text-slate-900 shadow-card dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {sc === 'serve' ? 'We serve' : 'They serve'}
            </button>
          ))}
        </div>
      </Section>

      {/* Playback */}
      <Section title="Playback">
        <div className="flex items-center justify-between gap-1.5">
          <IconButton label="Step back" onClick={s.stepBack}>
            <SkipBack />
          </IconButton>
          <button
            onClick={s.togglePlay}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-card transition hover:bg-violet-700"
          >
            {s.playing ? <Pause /> : <Play />}
            {s.playing ? 'Pause' : 'Play'}
          </button>
          <IconButton label="Step forward" onClick={s.stepForward}>
            <SkipForward />
          </IconButton>
          <IconButton label="Restart" onClick={s.restart}>
            <Restart />
          </IconButton>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Speed</span>
            <span className="tabular-nums font-bold text-slate-700 dark:text-slate-200">{s.speed.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={s.speed}
            onChange={(e) => s.setSpeed(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </Section>

      {/* Player style */}
      <Section title="Players">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(['label', 'figure'] as const).map((style) => (
            <button
              key={style}
              onClick={() => s.tokenStyle !== style && s.toggleTokenStyle()}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                s.tokenStyle === style
                  ? 'bg-white text-slate-900 shadow-card dark:bg-slate-900 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              {style === 'label' ? 'Labels' : 'Figures'}
            </button>
          ))}
        </div>
      </Section>

      {/* Toggles */}
      <Section title="Display">
        <div className="flex flex-col gap-1">
          <Toggle label="Auto-play loop" checked={s.autoLoop} onChange={s.toggleAutoLoop} />
          <Toggle label="Movement arrows" checked={s.showArrows} onChange={s.toggleArrows} />
          <Toggle label="Overlap guides" checked={s.showOverlap} onChange={s.toggleOverlap} />
          <Toggle label="Zone numbers" checked={s.showZones} onChange={s.toggleZones} />
        </div>
      </Section>

      <RosterEditor />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{title}</h3>
      {children}
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${
          checked ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? 'left-4' : 'left-0.5'}`}
        />
      </span>
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
