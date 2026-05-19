"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { PlaygroundForm } from "@/components/playground-form";

type PlaygroundPageClientProps = {
  email: string;
};

export function PlaygroundPageClient({ email }: PlaygroundPageClientProps) {
  return (
    <DashboardLayout>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          API Playground
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{email}</span>
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          Test your API keys against the echo endpoint. Each successful call increments usage on the
          Overview page.
        </p>
      </header>

      <PlaygroundForm />
    </DashboardLayout>
  );
}
