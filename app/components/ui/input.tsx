// app/components/ui/input.tsx v2.3.1
import React from 'react';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className="px-3 py-2 border border-slate-300 rounded-md dark:border-slate-700 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      {...props} 
    />
  );
}
