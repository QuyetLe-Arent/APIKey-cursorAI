"use client";

import { useNotify } from "@/components/notification-context";
import type { ApiKeyCreatedResponse, ApiKeyListItem } from "@/lib/api-key-types";
import { parseApiJson } from "@/lib/parse-api-response";
import { useCallback, useEffect, useState } from "react";

export function useApiKeys() {
  const notify = useNotify();
  const [keys, setKeys] = useState<ApiKeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<ApiKeyCreatedResponse | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyListItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(async (): Promise<boolean> => {
    const res = await fetch("/api/keys", { credentials: "include" });
    if (!res.ok) {
      const body = (await parseApiJson<{ error?: string }>(res).catch(() => ({}))) as {
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

  const refresh = useCallback(async () => {
    const ok = await loadKeys();
    if (ok) notify("List refreshed");
  }, [loadKeys, notify]);

  const createKey = useCallback(
    async (name: string) => {
      setCreating(true);
      try {
        const res = await fetch("/api/keys", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const body = await parseApiJson<ApiKeyCreatedResponse & { error?: string }>(res);
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
    },
    [loadKeys, notify],
  );

  const updateKey = useCallback(
    async (key: ApiKeyListItem) => {
      setSavingEdit(true);
      try {
        const res = await fetch(`/api/keys/${key.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "rename", name: key.name }),
        });
        const body = await parseApiJson<ApiKeyListItem & { error?: string }>(res);
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
    },
    [loadKeys, notify],
  );

  const revokeKey = useCallback(
    async (id: string) => {
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
          const body = (await parseApiJson<{ error?: string }>(res).catch(() => ({}))) as {
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
    },
    [loadKeys, notify],
  );

  const deleteKey = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this key permanently?")) return;
      setBusyId(id);
      try {
        const res = await fetch(`/api/keys/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok && res.status !== 204) {
          const body = (await parseApiJson<{ error?: string }>(res).catch(() => ({}))) as {
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
    },
    [loadKeys, notify],
  );

  const copyNewKey = useCallback(async () => {
    if (!newKey?.key) return;
    try {
      await navigator.clipboard.writeText(newKey.key);
      setCopied(true);
      notify("Copied API key to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Could not copy to clipboard", "error");
    }
  }, [newKey, notify]);

  const copyPrefix = useCallback(
    async (prefix: string) => {
      try {
        await navigator.clipboard.writeText(prefix);
        notify("Copied prefix to clipboard");
      } catch {
        notify("Could not copy to clipboard", "error");
      }
    },
    [notify],
  );

  const closeNewKeyModal = useCallback(() => {
    setNewKey(null);
    setCopied(false);
  }, []);

  return {
    keys,
    loading,
    busyId,
    newKey,
    isCreateOpen,
    setIsCreateOpen,
    editingKey,
    setEditingKey,
    creating,
    savingEdit,
    copied,
    refresh,
    createKey,
    updateKey,
    revokeKey,
    deleteKey,
    copyNewKey,
    copyPrefix,
    closeNewKeyModal,
  };
}
