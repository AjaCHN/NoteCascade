// app/components/InfoModals.tsx v2.3.2
'use client';
export function InfoModals({ isOpen, onClose, type }: { isOpen: boolean; onClose: () => void; type: string | null }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 uppercase tracking-wider">{type}</h2>
        <p className="text-sm opacity-70 mb-6">Information modal for {type}.</p>
        <button onClick={onClose} className="w-full py-2 bg-indigo-500 text-white rounded-lg font-bold">Close</button>
      </div>
    </div>
  );
}
