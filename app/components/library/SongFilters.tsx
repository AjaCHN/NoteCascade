// app/components/library/SongFilters.tsx v2.0.0
import { motion, AnimatePresence } from 'motion/react';

interface SongFiltersProps {
  showFilters: boolean;
  filter: string;
  setFilter: (filter: string) => void;
  difficultyFilter: number | 'all';
  setDifficultyFilter: (diff: number | 'all') => void;
  styles: string[];
  difficulties: (number | 'all')[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

export function SongFilters({
  showFilters,
  filter,
  setFilter,
  difficultyFilter,
  setDifficultyFilter,
  styles,
  difficulties,
  t
}: SongFiltersProps) {
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div key="filters-panel" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden w-full">
          <div className="p-4 rounded-2xl theme-bg-secondary theme-border border space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">Style</span>
                {filter !== 'all' && <button onClick={() => setFilter('all')} className="text-[10px] text-rose-500 font-bold hover:underline">Clear</button>}
              </div>
              <div className="flex flex-wrap gap-2">
                {styles.map(style => (
                  <button
                    key={style}
                    onClick={() => setFilter(style)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
                      filter === style ? 'bg-indigo-500 border-indigo-400 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-indigo-500/50'
                    }`}
                  >
                    {style === 'all' ? t.common.all : (t.settings[`style_${style.toLowerCase()}`] || style)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] theme-text-secondary">{t.common.level}</span>
                {difficultyFilter !== 'all' && <button onClick={() => setDifficultyFilter('all')} className="text-[10px] text-rose-500 font-bold hover:underline">Clear</button>}
              </div>
              <div className="flex gap-1.5">
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff as number | 'all')}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl text-[10px] font-bold transition-all border ${
                      difficultyFilter === diff ? 'bg-amber-500 border-amber-400 text-white shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-amber-500/50'
                    }`}
                  >
                    {diff === 'all' ? '∞' : diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
