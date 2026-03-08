// app/components/header/MenuDropdown.tsx v2.3.2
'use client';
import { Translation } from '../../lib/translations';

interface MenuDropdownProps {
  show: boolean;
  t: Translation;
  setShowMenu: (show: boolean) => void;
  setInfoModalType: (type: 'about' | 'changelog' | 'guide' | null) => void;
}

export function MenuDropdown({ show, t, setShowMenu, setInfoModalType }: MenuDropdownProps) {
  if (!show) return null;
  return (
    <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-zinc-900 border theme-border rounded-xl shadow-xl z-50 py-2">
      <button 
        onClick={() => { setInfoModalType('about'); setShowMenu(false); }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors"
      >
        {t.common.about || 'About'}
      </button>
      <button 
        onClick={() => { setInfoModalType('changelog'); setShowMenu(false); }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-white/5 transition-colors"
      >
        {t.common.changelog || 'Changelog'}
      </button>
    </div>
  );
}
