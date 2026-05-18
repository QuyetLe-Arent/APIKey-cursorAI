"use client";

import type { ApiKeyCreatedResponse } from "@/lib/api-key-types";

type NewKeySecretModalProps = {
  newKey: ApiKeyCreatedResponse;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
};

export function NewKeySecretModal({
  newKey,
  copied,
  onCopy,
  onClose,
}: NewKeySecretModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-key-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-700 dark:bg-zinc-900 sm:p-8">
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
            onClick={onCopy}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
  );
}
