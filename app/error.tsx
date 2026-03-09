'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-slate-950 text-white">
      <h2 className="text-4xl font-bold mb-4">Something went wrong!</h2>
      <p className="mb-8">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-indigo-500 rounded-full hover:bg-indigo-400 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
