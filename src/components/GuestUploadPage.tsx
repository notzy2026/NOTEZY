import { Upload, IndianRupee, LogIn, FileText, CheckCircle2 } from 'lucide-react';

interface GuestUploadPageProps {
  onLoginRequest: () => void;
}

export function GuestUploadPage({ onLoginRequest }: GuestUploadPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] pb-32 p-6 lg:ml-64 animate-in fade-in duration-500">
      {/* Icon — clean solid container */}
      <div className="w-24 h-24 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-3xl flex items-center justify-center mb-8 shadow-xl dark:shadow-blue-900/20">
        <Upload className="w-12 h-12 text-blue-600 dark:text-blue-400" />
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 text-center max-w-md tracking-tight">
        Upload your notes & start earning
      </h1>
      <p className="text-base text-gray-500 dark:text-slate-400 mb-10 text-center max-w-sm leading-relaxed">
        Turn your hard work into real money by helping others learn.
      </p>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl w-full mb-10">
        <div className="relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all text-left">
          <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl" style={{ backgroundColor: '#60a5fa' }} />
          <FileText className="w-8 h-8 mb-1 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1.5">Sell Any Material</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              Class notes, assignments, practical files, and more.
            </p>
          </div>
        </div>

        <div className="relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all text-left">
          <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl" style={{ backgroundColor: '#34d399' }} />
          <IndianRupee className="w-8 h-8 mb-1 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1.5">Keep 70% of Revenue</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              30% platform fee. You keep 70% of every sale.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onLoginRequest}
        style={{ backgroundColor: '#2563eb' }}
        className="flex items-center gap-2 px-8 py-4 text-white rounded-2xl font-bold transition-all shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5"
      >
        <LogIn className="w-5 h-5" />
        Sign in to upload material
      </button>

      {/* Micro trust signals */}
      <div className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-sm text-gray-400 dark:text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Free to list
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Set your own price
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Weekly payouts
        </div>
      </div>
    </div>
  );
}
