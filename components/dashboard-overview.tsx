type DashboardOverviewProps = {
  email: string;
};

export function DashboardOverview({ email }: DashboardOverviewProps) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Overview
      </h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Signed in as{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{email}</span>
      </p>
      <p className="text-sm text-zinc-500 dark:text-zinc-500">
        Manage API keys, view usage limits, and monitor key status from this dashboard.
      </p>
    </header>
  );
}
