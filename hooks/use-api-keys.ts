"use client";

import { useNotify } from "@/components/notification-context";
import type { ApiKeyCreatedResponse, ApiKeyListItem } from "@/lib/api-key-types";
import {
  createApiKey,
  deleteApiKey,
  isValidCreatedKey,
  listApiKeys,
  renameApiKey,
  revokeApiKey,
} from "@/lib/api-keys-client";
import { useCallback, useEffect, useState } from "react";

export function useApiKeys(initialKeys?: ApiKeyListItem[]) {
  const notify = useNotify();
  const hasServerKeys = initialKeys !== undefined;
  const [keys, setKeys] = useState<ApiKeyListItem[]>(initialKeys ?? []);
  const [loading, setLoading] = useState(!hasServerKeys);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<ApiKeyCreatedResponse | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyListItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(
    async (options?: { keepExistingOnError?: boolean }): Promise<boolean> => {
      const result = await listApiKeys();
      if (!result.ok) {
        notify(result.message, "error");
        if (result.status === 401) {
          window.location.href = "/login?callbackUrl=/keys";
        }
        if (!options?.keepExistingOnError) {
          setKeys([]);
        }
        return false;
      }
      setKeys(result.data);
      return true;
    },
    [notify],
  );

  useEffect(() => {
    if (hasServerKeys) {
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadKeys();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [hasServerKeys, loadKeys]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const ok = await loadKeys();
      if (ok) notify("List refreshed");
    } finally {
      setRefreshing(false);
    }
  }, [loadKeys, notify]);

  const createKey = useCallback(
    async (name: string, limit: number) => {
      setCreating(true);
      try {
        const result = await createApiKey(name, limit);
        if (!result.ok) {
          notify(result.message, "error");
          return;
        }
        if (!isValidCreatedKey(result.data)) {
          notify("Server response missing key secret", "error");
          return;
        }
        setIsCreateOpen(false);
        setNewKey(result.data);
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
        const result = await renameApiKey(key.id, key.name);
        if (!result.ok) {
          notify(result.message, "error");
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
        const result = await revokeApiKey(id);
        if (!result.ok) {
          notify(result.message, "error");
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

  const deleteKeyHandler = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this key permanently?")) return;
      setBusyId(id);
      try {
        const result = await deleteApiKey(id);
        if (!result.ok) {
          notify(result.message, "error");
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

  /** Full secret copy — only used from the one-time secret modal (Part 5.3). */
  const copyNewKey = useCallback(async () => {
    if (!newKey?.key) return;
    try {
      await navigator.clipboard.writeText(newKey.key);
      setCopied(true);
      notify("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify("Could not copy to clipboard", "error");
    }
  }, [newKey, notify]);

  const closeNewKeyModal = useCallback(() => {
    setNewKey(null);
    setCopied(false);
  }, []);

  return {
    keys,
    loading,
    refreshing,
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
    deleteKey: deleteKeyHandler,
    copyNewKey,
    closeNewKeyModal,
  };
}
