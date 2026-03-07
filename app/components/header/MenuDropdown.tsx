// app/components/header/MenuDropdown.tsx v2.0.0
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, FileText, Info } from 'lucide-react';

interface MenuDropdownProps {
  show: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  setShowMenu: (show: boolean) => void;
  setInfoModalType: (type: 'about' | 'changelog' | 'guide' | null) => void;
}

export function MenuDropdown({ show, t, setShowMenu, setInfoModalType }: MenuDropdownProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-full left-0 mt-2 w-48 py-1 rounded-xl theme-bg-secondary border theme-border shadow-xl z-50 overflow-hidden"
        >
          <button
            onClick={() => { setInfoModalType('guide'); setShowMenu(false); }}
            className="w-full px-4 py-2 text-left text-sm theme-text-secondary hover:theme-text-primary hover:bg-white/5 flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            {t.ui.guide}
          </button>
          <button
            onClick={() => { setInfoModalType('changelog'); setShowMenu(false); }}
            className="w-full px-4 py-2 text-left text-sm theme-text-secondary hover:theme-text-primary hover:bg-white/5 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {t.ui.changelog}
          </button>
          <div className="h-px bg-white/5 my-1" />
          <button
            onClick={() => { setInfoModalType('about'); setShowMenu(false); }}
            className="w-full px-4 py-2 text-left text-sm theme-text-secondary hover:theme-text-primary hover:bg-white/5 flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            {t.ui.about}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
