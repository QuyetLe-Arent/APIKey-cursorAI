"use client";

import { useEffect, useState } from "react";

const DEFAULT_LIMIT = 1000;

type CreateApiKeyModalProps = {
  isOpen: boolean;
  creating: boolean;
  onClose: () => void;
  onCreate: (name: string, limit: number) => void;
};

export function CreateApiKeyModal({
  isOpen,
  creating,
  onClose,
  onCreate,
}: CreateApiKeyModalProps) {
  const [name, setName] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setLimit(DEFAULT_LIMIT);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCreate(name.trim(), limit);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-[2px]">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-key-title"
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <h2 id="create-key-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Create API Key
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Name your key and set a usage limit. The full secret is shown once after creation.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="create-key-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name
            </label>
            <input
              id="create-key-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
          <div>
            <label htmlFor="create-key-limit" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Usage limit
            </label>
            <input
              id="create-key-limit"
              type="number"
              min={1}
              max={1000000}
              value={limit}
              onChange={(e) => {
                const parsed = Number.parseInt(e.target.value, 10);
                setLimit(Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LIMIT);
              }}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Maximum number of requests allowed for this key (default {DEFAULT_LIMIT}).
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
