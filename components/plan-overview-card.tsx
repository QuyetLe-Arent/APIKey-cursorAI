"use client";

import { useNotify } from "@/components/notification-context";

export function PlanOverviewCard() {
  const notify = useNotify();
  const used = 24;
  const limit = 1000;
  const pct = Math.min(100, (used / limit) * 100);

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-lg shadow-indigo-600/20 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
          Current plan
        </span>
        <button
          type="button"
          onClick={() => notify("Plan management is coming soon")}
          className="w-fit rounded-lg bg-white/20 px-3 py-1 text-xs font-medium text-white/90 transition hover:bg-white/30"
        >
          Manage plan
        </button>
      </div>
      <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">API Key Manager</h2>
      <div className="mt-5">
        <span className="text-xs font-medium text-white/80">API limit</span>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="mt-2 inline-block text-sm text-white/90">
          {used} / {limit.toLocaleString()} requests
        </span>
      </div>
    </section>
  );
}
