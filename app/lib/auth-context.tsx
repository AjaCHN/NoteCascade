// app/lib/auth-context.tsx v2.3.2
'use client';
import React, { createContext, useContext } from 'react';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContext.Provider value={{ user: null }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
