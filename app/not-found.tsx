// app/not-found.tsx v2.0.0
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-slate-950 text-white">
      <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
      <p className="mb-8">Could not find the requested resource.</p>
      <Link href="/" className="px-6 py-2 bg-indigo-500 rounded-full hover:bg-indigo-400 transition-colors">
        Return Home
      </Link>
    </div>
  );
}
