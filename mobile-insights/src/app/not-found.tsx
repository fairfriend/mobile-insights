import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl mb-6">📱</div>
      <h1 className="text-4xl font-bold text-white mb-3">404 — Page Not Found</h1>
      <p className="text-slate-400 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">Go Home</Link>
    </div>
  );
}
