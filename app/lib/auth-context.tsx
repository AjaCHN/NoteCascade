// app/lib/auth-context.tsx v2.4.2
'use client';
import React, { createContext, useContext } from 'react';

interface AuthContextType {
  user: { id: string; email: string } | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContext.Provider value={{ user: null }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
