import { DashboardLayout } from "@/components/dashboard-layout";
import { KeysDashboard } from "@/components/keys-dashboard";
import { PlanOverviewCard } from "@/components/plan-overview-card";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function KeysPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/keys");
  }

  const email = session.user.email ?? session.user.name ?? "—";

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          Overview
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{email}</span>
        </p>
      </div>

      <PlanOverviewCard />

      <details className="rounded-xl border border-zinc-200/90 bg-white/90 px-4 py-3 text-xs text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
          Technical: user_id (Supabase)
        </summary>
        <p className="mt-2 font-mono text-[11px] leading-relaxed break-all text-zinc-800 dark:text-zinc-300">
          {session.user.id}
        </p>
      </details>

      <KeysDashboard />
    </DashboardLayout>
  );
}
