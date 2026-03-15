'use client';

import { AuthProvider } from '../lib/auth-context';
import { LanguageDetector } from './LanguageDetector';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageDetector />
      {children}
    </AuthProvider>
  );
}
