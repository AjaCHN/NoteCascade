// app/components/UsageTips.tsx v1.0.0
'use client';
import { useState, useEffect } from 'react';
import { tips } from '../lib/tips';
import { Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function UsageTips() {
  const [tip, setTip] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setTip(tips[Math.floor(Math.random() * tips.length)]);
        setShow(true);
        setTimeout(() => setShow(false), 5000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-24 left-4 z-50 flex items-center gap-3 bg-black/80 backdrop-blur-md p-4 rounded-2xl border theme-border shadow-2xl max-w-sm"
        >
          <Lightbulb className="w-6 h-6 text-amber-400 shrink-0" />
          <p className="text-sm theme-text-primary">{tip}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
