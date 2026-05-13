import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/keys");
  }

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-zinc-50 font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,120,120,0.15),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(250,250,250,0.08),transparent)]"
        aria-hidden
      />

      <header className="relative z-10 border-b border-zinc-200/80 bg-white/70 px-6 py-4 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="text-sm font-semibold tracking-tight">
            API Key Manager
          </span>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-16 sm:py-24">
        <p className="mb-4 inline-flex w-fit items-center rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-xs font-medium text-zinc-600 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300">
          Welcome — sign in to continue
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Manage API keys securely in one place.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Create keys with a secret shown only once, revoke when you no longer
          need them, and store only safe metadata in the cloud — built with
          Next.js, Google sign-in, and Supabase.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-zinc-900 px-8 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-none dark:hover:bg-zinc-200"
          >
            Get started
          </Link>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            You will sign in with your Google account.
          </p>
        </div>

        <ul className="mt-20 grid gap-6 sm:grid-cols-3">
          <li className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              One-time secret reveal
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              The full key string is shown only when you create it. After that,
              the UI shows a prefix and status only.
            </p>
          </li>
          <li className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Stored as a hash
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Keys are stored with a strong hash — no plaintext — tied to your
              account.
            </p>
          </li>
          <li className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/60">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Google sign-in
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              No separate app password. After OAuth you land on the dashboard.
            </p>
          </li>
        </ul>
      </main>

      <footer className="relative z-10 border-t border-zinc-200/80 px-6 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800/80 dark:text-zinc-500">
        <p>
          After signing in, you can create, list, revoke, and delete keys from
          the management page.
        </p>
      </footer>
    </div>
  );
}
