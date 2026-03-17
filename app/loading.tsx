// app/loading.tsx v2.3.1
export default function Loading() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-slate-950 text-slate-500">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-sm font-medium animate-pulse">Loading NoteCascade...</p>
      </div>
    </div>
  );
}
