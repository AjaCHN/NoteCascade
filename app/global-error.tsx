'use client';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
          <h2 className="text-4xl font-bold mb-4">Something went wrong!</h2>
          <p className="text-slate-400 mb-8">A critical error occurred.</p>
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
