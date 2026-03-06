// app/components/AuthModal.tsx v1.0.2
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirebase } from '../lib/firebase';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
}

export function AuthModal({ show, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { auth } = getFirebase();
    if (!auth) {
      setError('Authentication is not configured.');
      return;
    }
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md p-8 rounded-3xl theme-bg-primary border theme-border shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black theme-text-primary">{isLogin ? 'Login' : 'Register'}</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5"><X className="w-5 h-5 theme-text-secondary" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 theme-text-secondary" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full pl-10 pr-4 py-3 rounded-xl theme-bg-secondary border theme-border theme-text-primary" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 theme-text-secondary" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full pl-10 pr-4 py-3 rounded-xl theme-bg-secondary border theme-border theme-text-primary" required />
              </div>
              {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
              <button type="submit" className="w-full py-3 rounded-xl bg-indigo-500 text-white font-black hover:bg-indigo-400 transition-colors">{isLogin ? 'Login' : 'Register'}</button>
            </form>
            <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-xs font-bold theme-text-secondary hover:theme-text-primary transition-colors">
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
