// app/components/info/ChangelogContent.tsx v2.0.0
import { FileText } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ChangelogContent({ t }: { t: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <FileText className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold theme-text-primary">{t.ui.versionHistory}</h2>
      </div>
      
      <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
        {/* v2.0.3 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">v2.0.3</span>
            <span className="text-xs theme-text-secondary">Current</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm theme-text-secondary ml-1">
            <li>Moved `app/lib/locales` to `app/locales` for better project structure.</li>
          </ul>
        </div>

        {/* v2.0.2 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/10 theme-text-secondary text-xs font-mono font-bold">v2.0.2</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm theme-text-secondary ml-1">
            <li>Optimized imports by using `import type` for type-only imports across the codebase.</li>
            <li>Resolved VexFlow 5.0.0 integration issues in `SheetMusicView.tsx`.</li>
            <li>Restored missing `GameModals` import in `page.tsx`.</li>
          </ul>
        </div>

        {/* v2.0.1 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/10 theme-text-secondary text-xs font-mono font-bold">v2.0.1</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm theme-text-secondary ml-1">
            <li>Removed redundant React imports across the codebase.</li>
          </ul>
        </div>

        {/* v2.0.0 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/10 theme-text-secondary text-xs font-mono font-bold">v2.0.0</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm theme-text-secondary ml-1">
            <li>Major architectural overhaul. Split game logic hooks for better maintainability.</li>
            <li>Fixed Next.js build errors and state update issues.</li>
            <li>Updated license to GPL v3.</li>
          </ul>
        </div>

        {/* v1.7.1 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/10 theme-text-secondary text-xs font-mono font-bold">v1.7.1</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm theme-text-secondary ml-1">
            <li>Optimized audio polyphony and voice limiting.</li>
            <li>Fine-tuned compressor and limiter settings.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
