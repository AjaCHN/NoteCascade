// app/components/AuthModal.tsx v2.6.0
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Github } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirebase } from '../lib/firebase';
import { useAuth } from '../lib/auth-context';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
}

export function AuthModal({ show, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signInWithGoogle, signInWithGithub } = useAuth();

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

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      onClose();
    } catch (_err) {
      setError('Google sign in failed');
    }
  };

  const handleGithubSignIn = async () => {
    try {
      await signInWithGithub();
      onClose();
    } catch (_err) {
      setError('GitHub sign in failed');
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

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button 
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-2 py-3 rounded-xl theme-bg-secondary border theme-border theme-text-primary hover:bg-white/5 transition-colors text-sm font-bold"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button 
                onClick={handleGithubSignIn}
                className="flex items-center justify-center gap-2 py-3 rounded-xl theme-bg-secondary border theme-border theme-text-primary hover:bg-white/5 transition-colors text-sm font-bold"
              >
                <Github className="w-5 h-5" />
                GitHub
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t theme-border"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="px-2 theme-bg-primary theme-text-secondary">Or continue with email</span></div>
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
