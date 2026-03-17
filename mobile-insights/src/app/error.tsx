"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-5">⚠️</div>
      <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
      <p className="text-slate-400 mb-6 max-w-md">{error.message}</p>
      <button onClick={reset} className="btn-primary">Try Again</button>
    </div>
  );
}
