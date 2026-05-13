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
    <div className="mt-8 space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
        >
          {error}
        </div>
      )}

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Create a new key
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          The full secret is shown only once after creation. Store it safely.
        </p>
        <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="key-name"
              className="block text-xs font-medium text-zinc-500 dark:text-zinc-400"
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
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {creating ? "Creating…" : "Create key"}
          </button>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Your keys
          </h2>
          <button
            type="button"
            onClick={() => void loadKeys()}
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : keys.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            No keys yet. Create one above.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/80">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                    Label
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                    Prefix
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                    Created
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-700 dark:text-zinc-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                {keys.map((row) => {
                  const revoked = Boolean(row.revoked_at);
                  const busy = busyId === row.id;
                  return (
                    <tr key={row.id} className="text-zinc-800 dark:text-zinc-200">
                      <td className="px-4 py-3 font-medium">{row.name || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{row.key_prefix}</td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {revoked ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                            Revoked
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={revoked || busy}
                            onClick={() => void handleRevoke(row.id)}
                            className="text-xs font-medium text-amber-700 underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:opacity-40 dark:text-amber-400"
                          >
                            Revoke
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleDelete(row.id)}
                            className="text-xs font-medium text-red-600 underline-offset-2 hover:underline disabled:opacity-40 dark:text-red-400"
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
        )}
      </section>

      {newKey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-key-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3
              id="new-key-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Key created — copy it now
            </h3>
            <p className="mt-2 text-sm font-medium text-amber-800 dark:text-amber-200">
              This is the only time the full secret is shown. If you leave this
              dialog without copying, you cannot retrieve it again.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs break-all text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
              {newKey.key}
            </pre>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void copyNewKey()}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {copied ? "Copied!" : "Copy to clipboard"}
              </button>
              <button
                type="button"
                onClick={closeNewKeyModal}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                I have stored it — close
              </button>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              id: <span className="font-mono">{newKey.id}</span> · prefix:{" "}
              <span className="font-mono">{newKey.key_prefix}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
