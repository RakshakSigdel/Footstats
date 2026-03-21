export default function AppSkeleton() {
  return (
    <div className="app-shell min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-6xl animate-pulse space-y-5">
        <div className="h-8 w-52 rounded-lg bg-slate-200/70 dark:bg-slate-700/70" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-700/60" />
          <div className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-700/60" />
          <div className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-700/60" />
        </div>
        <div className="h-80 rounded-2xl bg-slate-200/60 dark:bg-slate-700/60" />
      </div>
    </div>
  );
}

