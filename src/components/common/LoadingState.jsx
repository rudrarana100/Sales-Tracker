import { Loader2, Sparkles } from "lucide-react";

export default function LoadingState({ message = "Loading content...", type = "default" }) {
  if (type === "card") {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-xs animate-fade-in space-y-3">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-10 w-10 rounded-full bg-blue-500/20 dark:bg-blue-400/20 animate-ping" />
          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700/60 shadow-xs">
            <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 animate-pulse">{message}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-36 rounded-xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
          <div className="h-3.5 w-56 rounded-lg bg-slate-200/50 dark:bg-slate-800/60 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-slate-200/60 dark:bg-slate-800 animate-pulse" />
          <div className="h-9 w-28 rounded-xl bg-slate-200/70 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between overflow-hidden relative"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-6 w-16 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse mt-3" />
          </div>
        ))}
      </div>

      <div className="h-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-6 shadow-xs flex flex-col items-center justify-center space-y-3">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-blue-500/20 dark:bg-blue-400/20 blur-sm animate-pulse" />
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{message}</span>
        </div>
      </div>
    </div>
  );
}
