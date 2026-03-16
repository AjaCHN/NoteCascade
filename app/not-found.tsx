export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
      <h2 className="text-4xl font-bold mb-4">404</h2>
      <p className="text-slate-400">Page Not Found</p>
    </div>
  );
}
