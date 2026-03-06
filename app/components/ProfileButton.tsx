// app/components/ProfileButton.tsx v1.0.1
'use client';

import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { signOut } from 'firebase/auth';
import { getFirebase } from '../lib/firebase';
import { AuthModal } from './AuthModal';

export function ProfileButton() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleSignOut = async () => {
    const { auth } = getFirebase();
    if (auth) {
      await signOut(auth);
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <User className="w-4 h-4" />
          <span className="text-xs font-bold truncate max-w-[100px]">{user.email}</span>
        </div>
        <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-white/5 theme-text-secondary">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setShowAuth(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-400 transition-colors"
      >
        <User className="w-4 h-4" />
        Login
      </button>
      <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
