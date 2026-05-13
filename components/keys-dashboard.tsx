"use client";

import type { ApiKeyCreatedResponse, ApiKeyListItem } from "@/lib/api-key-types";
import { useCallback, useEffect, useState } from "react";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export function KeysDashboard() {
  const [keys, setKeys] = useState<ApiKeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<ApiKeyCreatedResponse | null>(null);
  const [createName, setCreateName] = useState("");
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/keys", { credentials: "include" });
    if (!res.ok) {
      const body = (await parseJson<{ error?: string }>(res).catch(() => ({}))) as {
        error?: string;
      };
      setError(body.error ?? `Failed to load keys (${res.status})`);
      setKeys([]);
      return;
    }
    const data = (await res.json()) as ApiKeyListItem[];
    setKeys(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadKeys();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadKeys]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: createName }),
      });
      const body = await parseJson<ApiKeyCreatedResponse & { error?: string }>(
        res,
      );
      if (!res.ok) {
        setError(body.error ?? "Create failed");
        return;
      }
      setNewKey(body);
      setCreateName("");
      await loadKeys();
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!window.confirm("Revoke this key? It cannot be used after revoke.")) {
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke" }),
      });
      if (!res.ok) {
        const body = (await parseJson<{ error?: string }>(res).catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error ?? "Revoke failed");
        return;
      }
      await loadKeys();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this key permanently?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok && res.status !== 204) {
        const body = (await parseJson<{ error?: string }>(res).catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error ?? "Delete failed");
        return;
      }
      await loadKeys();
    } finally {
      setBusyId(null);
    }
  }

  async function copyNewKey() {
    if (!newKey?.key) return;
    try {
      await navigator.clipboard.writeText(newKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy to clipboard");
    }
  }

  function closeNewKeyModal() {
    setNewKey(null);
    setCopied(false);
  }

  return (
    <div className="space-y-8">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-100"
        >
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-zinc-200/90 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-900/[0.04] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:ring-white/[0.06] sm:p-7">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Create a new key
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          The full secret is shown only once after creation. Store it safely.
        </p>
        <form onSubmit={handleCreate} className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="key-name"
              className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
            >
              Label (optional)
            </label>
            <input
              id="key-name"
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g. production, dev laptop"
              maxLength={200}
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="h-[42px] shrink-0 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-indigo-500/15"
          >
            {creating ? "Creating…" : "Create key"}
          </button>
        </form>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Your keys
          </h2>
          <button
            type="button"
            onClick={() => void loadKeys()}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-zinc-500" aria-hidden>
              <path
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 rounded-2xl border border-zinc-200/90 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="h-4 w-1/3 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-2/3 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-1/2 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ) : keys.length === 0 ? (
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
              Create your first key using the form above.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm ring-1 ring-zinc-900/[0.04] dark:border-zinc-800 dark:bg-zinc-950 dark:ring-white/[0.06]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50/90 dark:border-zinc-800 dark:bg-zinc-900/90">
                  <tr>
                    {["Label", "Prefix", "Created", "Status", "Actions"].map((h) => (
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
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={revoked || busy}
                              onClick={() => void handleRevoke(row.id)}
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-amber-400 dark:hover:bg-amber-950/40"
                            >
                              Revoke
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void handleDelete(row.id)}
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
        )}
      </section>

      {newKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-key-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl ring-1 ring-zinc-900/5 dark:border-zinc-700 dark:bg-zinc-900 dark:ring-black/40 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="min-w-0">
                <h3
                  id="new-key-title"
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
                >
                  Key created — copy it now
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-amber-800 dark:text-amber-200/90">
                  This is the only time the full secret is shown. If you close without copying, you
                  cannot retrieve it again.
                </p>
              </div>
            </div>
            <pre className="mt-5 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed break-all text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100">
              {newKey.key}
            </pre>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void copyNewKey()}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500 dark:shadow-indigo-500/15"
              >
                {copied ? "Copied!" : "Copy to clipboard"}
              </button>
              <button
                type="button"
                onClick={closeNewKeyModal}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                I have stored it — close
              </button>
            </div>
            <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
              id: <span className="font-mono text-zinc-700 dark:text-zinc-300">{newKey.id}</span> ·
              prefix:{" "}
              <span className="font-mono text-zinc-700 dark:text-zinc-300">{newKey.key_prefix}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
