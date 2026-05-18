"use client";

import { useNotify } from "@/components/notification-context";
import { useEffect, useState } from "react";

const REQUEST_LIMIT = 1000;

export function PlanOverviewCard() {
  const notify = useNotify();
  const [activeKeys, setActiveKeys] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/keys", { credentials: "include" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { revoked_at?: string | null }[];
        if (!Array.isArray(data) || cancelled) return;
        setActiveKeys(data.filter((k) => !k.revoked_at).length);
      } catch {
        /* placeholder usage stays static */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const used = 24;
  const pct = Math.min(100, (used / REQUEST_LIMIT) * 100);

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 p-6 text-white shadow-lg shadow-purple-900/20 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
          Current plan
        </span>
        <button
          type="button"
          onClick={() => notify("Plan management is coming soon")}
          className="w-fit rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/30"
        >
          Manage plan
        </button>
      </div>

      <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">API Key Manager</h2>

      {activeKeys !== null && (
        <p className="mt-2 text-sm text-white/85">
          {activeKeys} active {activeKeys === 1 ? "key" : "keys"} on your account
        </p>
      )}

      <div className="mt-5">
        <span className="text-xs font-medium uppercase tracking-wide text-white/80">
          API limit
        </span>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="mt-2 inline-block text-sm font-medium text-white/95">
          {used.toLocaleString()} / {REQUEST_LIMIT.toLocaleString()} requests
        </span>
        <p className="mt-1 text-xs text-white/70">Usage shown is a demo placeholder.</p>
      </div>
    </section>
  );
}
