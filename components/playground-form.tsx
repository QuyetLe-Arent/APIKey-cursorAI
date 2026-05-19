"use client";

import { useNotify } from "@/components/notification-context";
import Link from "next/link";
import { useState } from "react";

type PlaygroundResponse = {
  status: number;
  body: unknown;
};

export function PlaygroundForm() {
  const notify = useNotify();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [message, setMessage] = useState("hello");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlaygroundResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      notify("Enter your full API key (akm_...)", "error");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/playground/echo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": trimmedKey,
        },
        body: JSON.stringify({ message: message.trim() || "hello" }),
      });
      const text = await res.text();
      let body: unknown;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }
      setResult({ status: res.status, body });
      if (res.ok) {
        notify("Request succeeded");
      } else {
        const err =
          body && typeof body === "object" && "error" in body
            ? String((body as { error: unknown }).error)
            : "Request failed";
        notify(err, "error");
      }
    } catch {
      notify("Network error — could not reach the API", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Paste the full secret you copied when creating a key. It is sent only with this request and is
        not stored in the browser.{" "}
        <Link href="/keys" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          Manage keys
        </Link>
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 rounded-2xl border border-zinc-200/90 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-900/[0.04] dark:border-zinc-800 dark:bg-zinc-900/60 dark:ring-white/[0.06]">
        <div>
          <label htmlFor="playground-api-key" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            API Key
          </label>
          <div className="mt-1 flex gap-2">
            <input
              id="playground-api-key"
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="akm_..."
              autoComplete="off"
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="playground-message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Message
          </label>
          <textarea
            id="playground-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={500}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
          />
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Sent to <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">POST /api/playground/echo</code>
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Send request"}
        </button>
      </form>

      {result && (
        <div className="rounded-2xl border border-zinc-200/90 bg-zinc-950 p-4 dark:border-zinc-800">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            Response — HTTP {result.status}
          </p>
          <pre className="overflow-x-auto text-xs leading-relaxed text-zinc-100">
            {JSON.stringify(result.body, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
