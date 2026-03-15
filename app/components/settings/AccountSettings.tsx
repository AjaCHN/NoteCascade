import React from 'react';
import { useAuth } from '../../lib/auth-context';
import { LogIn, LogOut, User } from 'lucide-react';

interface AccountSettingsProps {
  t: Record<string, string>;
}

export function AccountSettings({ t }: AccountSettingsProps) {
  const { user, signIn, logOut } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
          <User className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold theme-text-primary">Account</h3>
      </div>

      <div className="p-6 rounded-2xl bg-black/20 border theme-border space-y-6">
        {user ? (
          <div className="flex flex-col items-center gap-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt="User Avatar" className="w-20 h-20 rounded-full border-2 border-indigo-500 shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <User className="w-10 h-10" />
              </div>
            )}
            <div className="text-center">
              <h4 className="text-xl font-bold theme-text-primary">{user.displayName || 'User'}</h4>
              <p className="text-sm theme-text-secondary">{user.email}</p>
            </div>
            <button 
              onClick={logOut}
              className="mt-4 flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all font-bold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2">
              <User className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold theme-text-primary">Not Logged In</h4>
            <p className="text-sm theme-text-secondary max-w-xs">
              Sign in to sync your scores, achievements, and settings across devices.
            </p>
            <button 
              onClick={signIn}
              className="mt-4 flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 transition-all shadow-lg shadow-indigo-500/20 font-bold"
            >
              <LogIn className="w-4 h-4" />
              Sign In with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
