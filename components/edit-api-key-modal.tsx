"use client";

import type { ApiKeyListItem } from "@/lib/api-key-types";
import { useEffect, useState } from "react";

type EditApiKeyModalProps = {
  apiKey: ApiKeyListItem | null;
  isOpen: boolean;
  saving: boolean;
  onClose: () => void;
  onUpdate: (key: ApiKeyListItem) => void;
};

export function EditApiKeyModal({
  apiKey,
  isOpen,
  saving,
  onClose,
  onUpdate,
}: EditApiKeyModalProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(apiKey?.name ?? "");
  }, [apiKey]);

  if (!isOpen || !apiKey) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey) return;
    onUpdate({ ...apiKey, name: name.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-key-title"
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h3 id="edit-key-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Edit API key
        </h3>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="edit-key-name"
              className="block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
            >
              Label
            </label>
            <input
              id="edit-key-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={200}
              required
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
