import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTrainer, phaseCount } from './store';
import { phaseHoldMs } from './anim';
import TopBar from './components/TopBar';
import Court from './components/Court';
import Controls from './components/Controls';
import PhaseStepper from './components/PhaseStepper';
import Legend from './components/Legend';
import Explainer from './components/Explainer';

export default function App() {
  const theme = useTrainer((s) => s.theme);
  const playing = useTrainer((s) => s.playing);
  const phaseIndex = useTrainer((s) => s.phaseIndex);
  const systemName = useTrainer((s) => s.systemName);
  const rotation = useTrainer((s) => s.rotation);
  const scenario = useTrainer((s) => s.scenario);
  const speed = useTrainer((s) => s.speed);
  const autoLoop = useTrainer((s) => s.autoLoop);
  const setPhase = useTrainer((s) => s.setPhase);
  const pause = useTrainer((s) => s.pause);

  const [sheetOpen, setSheetOpen] = useState(false);

  // Theme class on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Playback engine: auto-advance phases while playing.
  useEffect(() => {
    if (!playing) return;
    const count = phaseCount(systemName, rotation, scenario);
    const timer = window.setTimeout(() => {
      if (phaseIndex < count - 1) {
        setPhase(phaseIndex + 1);
      } else if (autoLoop) {
        setPhase(0);
      } else {
        pause();
      }
    }, phaseHoldMs(speed));
    return () => window.clearTimeout(timer);
  }, [playing, phaseIndex, systemName, rotation, scenario, speed, autoLoop, setPhase, pause]);

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <TopBar />

      <main className="mx-auto max-w-7xl px-4 py-5 pb-28 sm:px-6 lg:py-6 lg:pb-6">
        <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          {/* Left: controls + legend (desktop) */}
          <aside className="hidden flex-col gap-5 lg:flex">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900">
              <Controls />
            </div>
            <Legend />
          </aside>

          {/* Center: court + stepper */}
          <section className="flex flex-col gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-card dark:border-slate-800 dark:bg-slate-900 sm:p-4">
              <Court />
            </div>
            <PhaseStepper />
          </section>

          {/* Right: explainer */}
          <aside className="flex flex-col gap-5">
            <Explainer />
            <div className="lg:hidden">
              <Legend />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile controls trigger */}
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/30 lg:hidden"
      >
        Controls
      </button>

      {/* Mobile bottom sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:hidden"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-extrabold">Controls</h2>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  Done
                </button>
              </div>
              <Controls />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
