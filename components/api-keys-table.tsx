"use client";

import type { ApiKeyListItem } from "@/lib/api-key-types";
import { formatDateTime, formatInteger } from "@/lib/format-display";

type ApiKeysTableProps = {
  keys: ApiKeyListItem[];
  busyId: string | null;
  onEdit: (key: ApiKeyListItem) => void;
  onRevoke: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ApiKeysTable({
  keys,
  busyId,
  onEdit,
  onRevoke,
  onDelete,
}: ApiKeysTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm ring-1 ring-zinc-900/[0.04] dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/[0.06]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[16%]" />
            <col className="w-[17%]" />
            <col className="w-[11%]" />
            <col className="w-[17%]" />
            <col className="w-[10%]" />
            <col className="w-[19%]" />
          </colgroup>
          <thead className="border-b border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-900/90">
            <tr>
              {["Label", "Prefix", "Usage", "Created", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {keys.map((row) => {
              const revoked = Boolean(row.revoked_at);
              const busy = busyId === row.id;
              return (
                <tr
                  key={row.id}
                  className="text-zinc-800 transition hover:bg-zinc-50/80 dark:text-zinc-200 dark:hover:bg-zinc-900/50"
                >
                  <td className="max-w-0 px-4 py-3.5 font-medium">
                    <span
                      className="block truncate"
                      title={row.name || undefined}
                    >
                      {row.name || "—"}
                    </span>
                  </td>
                  <td className="max-w-0 px-4 py-3.5 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    <span className="block truncate" title={row.key_prefix}>
                      {row.key_prefix}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-600 dark:text-zinc-400">
                    {formatInteger(row.usage_count ?? 0)} /{" "}
                    {typeof row.usage_limit === "number" ? formatInteger(row.usage_limit) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5 text-zinc-600 dark:text-zinc-400">
                    {formatDateTime(row.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    {revoked ? (
                      <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-950/80 dark:text-amber-200">
                        Revoked
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <IconButton label="Edit label" onClick={() => onEdit(row)}>
                        <EditIcon />
                      </IconButton>
                      <button
                        type="button"
                        disabled={revoked || busy}
                        onClick={() => onRevoke(row.id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-amber-400 dark:hover:bg-amber-950/40"
                      >
                        Revoke
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onDelete(row.id)}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: import("react").ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
    >
      {children}
    </button>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
