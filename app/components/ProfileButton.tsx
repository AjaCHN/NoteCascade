// app/components/ProfileButton.tsx v2.3.2
'use client';
import { User } from 'lucide-react';
export function ProfileButton() {
  return (
    <button className="rounded-full p-2 hover:bg-white/10 transition-all theme-text-secondary hover:theme-text-primary border border-transparent hover:theme-border">
      <User className="h-5 w-5" />
    </button>
  );
}
