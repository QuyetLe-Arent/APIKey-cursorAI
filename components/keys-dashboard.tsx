"use client";

import { ApiKeysTable } from "@/components/api-keys-table";
import { CreateApiKeyModal } from "@/components/create-api-key-modal";
import { EditApiKeyModal } from "@/components/edit-api-key-modal";
import { NewKeySecretModal } from "@/components/new-key-secret-modal";
import { useNotify } from "@/components/notification-context";
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
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<ApiKeyCreatedResponse | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyListItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [copied, setCopied] = useState(false);
  const notify = useNotify();

  const loadKeys = useCallback(async (): Promise<boolean> => {
    const res = await fetch("/api/keys", { credentials: "include" });
    if (!res.ok) {
      const body = (await parseJson<{ error?: string }>(res).catch(() => ({}))) as {
        error?: string;
      };
      const msg =
        res.status === 429
          ? "Too many requests — try again shortly"
          : (body.error ?? `Failed to load keys (${res.status})`);
      notify(msg, "error");
      setKeys([]);
      return false;
    }
    const data = (await res.json()) as ApiKeyListItem[];
    setKeys(Array.isArray(data) ? data : []);
    return true;
  }, [notify]);

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

  async function handleCreate(name: string) {
    setCreating(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await parseJson<ApiKeyCreatedResponse & { error?: string }>(res);
      if (!res.ok) {
        notify(body.error ?? "Create failed", "error");
        return;
      }
      setIsCreateOpen(false);
      setNewKey(body);
      notify("API key created successfully");
      await loadKeys();
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(key: ApiKeyListItem) {
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/keys/${key.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", name: key.name }),
      });
      const body = await parseJson<ApiKeyListItem & { error?: string }>(res);
      if (!res.ok) {
        notify(body.error ?? "Update failed", "error");
        return;
      }
      setEditingKey(null);
      notify("API key updated successfully");
      await loadKeys();
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!window.confirm("Revoke this key? It cannot be used after revoke.")) return;
    setBusyId(id);
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
        notify(body.error ?? "Revoke failed", "error");
        return;
      }
      notify("API key revoked");
      await loadKeys();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this key permanently?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok && res.status !== 204) {
        const body = (await parseJson<{ error?: string }>(res).catch(() => ({}))) as {
          error?: string;
        };
        notify(body.error ?? "Delete failed", "error");
        return;
      }
      notify("API key deleted");
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
      notify("Copied API key to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Could not copy to clipboard", "error");
    }
  }

  async function copyPrefix(prefix: string) {
    try {
      await navigator.clipboard.writeText(prefix);
      notify("Copied prefix to clipboard");
    } catch {
      notify("Could not copy to clipboard", "error");
    }
  }

  return (
    <>
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">API Keys</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Keys authenticate requests to your API. The full secret is shown only once when
              created.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
          >
            + Create new key
          </button>
        </div>

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() =>
              void loadKeys().then((ok) => {
                if (ok) notify("List refreshed");
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
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
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No keys yet</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Create your first key with the button above.
            </p>
          </div>
        ) : (
          <ApiKeysTable
            keys={keys}
            busyId={busyId}
            onEdit={setEditingKey}
            onRevoke={(id) => void handleRevoke(id)}
            onDelete={(id) => void handleDelete(id)}
            onCopyPrefix={(prefix) => void copyPrefix(prefix)}
          />
        )}
      </section>

      <CreateApiKeyModal
        isOpen={isCreateOpen}
        creating={creating}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(name) => void handleCreate(name)}
      />

      <EditApiKeyModal
        apiKey={editingKey}
        isOpen={Boolean(editingKey)}
        saving={savingEdit}
        onClose={() => setEditingKey(null)}
        onUpdate={(key) => void handleUpdate(key)}
      />

      {newKey && (
        <NewKeySecretModal
          newKey={newKey}
          copied={copied}
          onCopy={() => void copyNewKey()}
          onClose={() => {
            setNewKey(null);
            setCopied(false);
          }}
        />
      )}
    </>
  );
}
