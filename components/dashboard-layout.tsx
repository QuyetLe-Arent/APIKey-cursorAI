"use client";

import type { ReactNode } from "react";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#18181b06_1px,transparent_1px),linear-gradient(to_bottom,#18181b06_1px,transparent_1px)] bg-[size:28px_28px] dark:bg-[linear-gradient(to_right,#fafafa05_1px,transparent_1px),linear-gradient(to_bottom,#fafafa05_1px,transparent_1px)]"
        aria-hidden
      />
      <DashboardSidebar />
      <div className="relative z-10 min-h-screen w-full md:pl-64">
        <div className="mx-auto max-w-6xl space-y-6 p-4 pt-16 md:p-8 md:pt-8">{children}</div>
      </div>
    </div>
  );
}
