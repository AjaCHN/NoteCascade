'use client';

import { AuthProvider } from '../lib/auth-context';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
