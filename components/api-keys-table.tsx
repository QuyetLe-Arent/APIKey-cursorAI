"use client";

import type { ApiKeyListItem } from "@/lib/api-key-types";

type ApiKeysTableProps = {
  keys: ApiKeyListItem[];
  busyId: string | null;
  onEdit: (key: ApiKeyListItem) => void;
  onRevoke: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyPrefix: (prefix: string) => void;
};

export function ApiKeysTable({
  keys,
  busyId,
  onEdit,
  onRevoke,
  onDelete,
  onCopyPrefix,
}: ApiKeysTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm ring-1 ring-zinc-900/[0.04] dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/[0.06]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-900/90">
            <tr>
              {["Label", "Prefix", "Usage", "Last used", "Created", "Status", "Actions"].map((h) => (
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
                  <td className="px-4 py-3.5 font-medium">{row.name || "—"}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    {row.key_prefix}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400">
                    0 / {row.usage_limit?.toLocaleString() ?? "—"}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400">
                    {row.last_used_at
                      ? new Date(row.last_used_at).toLocaleString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
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
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap items-center gap-1">
                      <IconButton
                        label="Copy prefix"
                        onClick={() => onCopyPrefix(row.key_prefix)}
                      >
                        <CopyIcon />
                      </IconButton>
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

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
