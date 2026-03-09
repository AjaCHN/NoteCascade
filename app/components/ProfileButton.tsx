// app/components/ProfileButton.tsx v2.6.0
'use client';

import React, { useState } from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { AuthModal } from './AuthModal';
import Image from 'next/image';

export function ProfileButton() {
  const { user, loading, logout, role } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  if (loading) {
    return (
      <div className="h-9 w-9 rounded-full bg-white/5 animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => user ? setShowDropdown(!showDropdown) : setShowAuthModal(true)}
        className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border overflow-hidden"
      >
        {user ? (
          user.photoURL ? (
            <Image 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              width={36} 
              height={36} 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-full w-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
            </div>
          )
        ) : (
          <User className="h-5 w-5" />
        )}
      </button>

      {showDropdown && user && (
        <div className="absolute top-full right-0 mt-2 w-48 p-2 rounded-2xl glass-panel border theme-border shadow-2xl z-[100]">
          <div className="px-3 py-2 mb-2 border-b theme-border">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-black theme-text-primary truncate">{user.displayName || 'Anonymous'}</p>
              {role !== 'user' && role !== 'guest' && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                  role === 'admin' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {role}
                </span>
              )}
            </div>
            <p className="text-[10px] theme-text-secondary truncate">{user.email}</p>
          </div>
          
          <button 
            onClick={() => {
              logout();
              setShowDropdown(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}

      <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
