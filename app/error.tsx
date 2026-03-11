// app/error.tsx v2.0.1
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
      <h2 className="text-4xl font-bold mb-4">Something went wrong!</h2>
      <p className="text-slate-400 mb-8">{error.message || 'An unexpected error occurred'}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors font-medium"
      >
        Try again
      </button>
    </div>
  );
}
