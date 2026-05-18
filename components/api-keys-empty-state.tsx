export function ApiKeysEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300/90 bg-zinc-50/80 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-900/30">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 11V7a5 5 0 0110 0v4M6 11h12v10a1 1 0 01-1 1H7a1 1 0 01-1-1V11z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No keys yet</p>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Create your first key with the button above.
      </p>
    </div>
  );
}
