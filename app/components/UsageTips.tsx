// app/components/UsageTips.tsx v2.3.1
'use client';
import { useState, useEffect } from 'react';
import { tipKeys } from '../lib/tips';
import { Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '../lib/store';
import { translations } from '../lib/translations';

export function UsageTips() {
  const [tipKey, setTipKey] = useState('');
  const [show, setShow] = useState(false);
  const locale = useLocale();
  const t = translations[locale] || translations.en;

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setTipKey(tipKeys[Math.floor(Math.random() * tipKeys.length)]);
        setShow(true);
        setTimeout(() => setShow(false), 5000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {show && tipKey && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-32 right-8 z-50 flex items-center gap-3 bg-black/80 backdrop-blur-md p-4 rounded-2xl border theme-border shadow-2xl max-w-sm pointer-events-none"
        >
          <Lightbulb className="w-6 h-6 text-amber-400 shrink-0" />
          <p className="text-sm theme-text-primary">{t[tipKey] || tipKey}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
