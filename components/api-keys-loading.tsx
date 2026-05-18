export function ApiKeysLoading() {
  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200/90 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="h-4 w-1/3 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-2/3 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-1/2 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
