"use client";

import { ApiKeysEmptyState } from "@/components/api-keys-empty-state";
import { ApiKeysLoading } from "@/components/api-keys-loading";
import { ApiKeysTable } from "@/components/api-keys-table";
import type { ApiKeyListItem } from "@/lib/api-key-types";

type ApiKeysSectionProps = {
  keys: ApiKeyListItem[];
  loading: boolean;
  refreshing?: boolean;
  busyId: string | null;
  onCreateClick: () => void;
  onRefresh: () => void;
  onEdit: (key: ApiKeyListItem) => void;
  onRevoke: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ApiKeysSection({
  keys,
  loading,
  refreshing = false,
  busyId,
  onCreateClick,
  onRefresh,
  onEdit,
  onRevoke,
  onDelete,
}: ApiKeysSectionProps) {
  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-900/[0.04] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:ring-white/[0.06] sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">API Keys</h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            The key is used to authenticate your requests. Full secrets are shown only once after
            creation. Test keys in the{" "}
            <a href="/playground" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              API Playground
            </a>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateClick}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500"
        >
          + Create new key
        </button>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`text-zinc-500 ${refreshing ? "animate-spin" : ""}`} aria-hidden>
            <path
              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="mt-4">
        {loading ? (
          <ApiKeysLoading />
        ) : keys.length === 0 ? (
          <ApiKeysEmptyState />
        ) : (
          <ApiKeysTable
            keys={keys}
            busyId={busyId}
            onEdit={onEdit}
            onRevoke={onRevoke}
            onDelete={onDelete}
          />
        )}
      </div>
    </section>
  );
}
