'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
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
      <p className="text-slate-400 mb-8">An unexpected error occurred during rendering.</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors"
        >
          Try again
        </button>
        <Link 
          href="/"
          className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
