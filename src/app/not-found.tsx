import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-black text-white">404 - Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2">
        The requested resource or endpoint could not be located in this enterprise workspace.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
      </Link>
    </div>
  );
}
