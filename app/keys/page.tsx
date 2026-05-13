import { KeysDashboard } from "@/components/keys-dashboard";
import { SiteHeader } from "@/components/site-header";
import { auth, signOut } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function KeysPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/keys");
  }

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const email = session.user.email ?? session.user.name ?? "—";
  const initial = email !== "—" ? email.charAt(0).toUpperCase() : "?";

  return (
    <div className="relative flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#18181b06_1px,transparent_1px),linear-gradient(to_bottom,#18181b06_1px,transparent_1px)] bg-[size:28px_28px] dark:bg-[linear-gradient(to_right,#fafafa05_1px,transparent_1px),linear-gradient(to_bottom,#fafafa05_1px,transparent_1px)]" aria-hidden />

      <SiteHeader
        end={
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="hidden max-w-[200px] truncate text-sm text-zinc-600 sm:inline dark:text-zinc-400"
              title={email}
            >
              {email}
            </span>
            <span
              className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 sm:hidden"
              aria-hidden
            >
              {initial}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              >
                Sign out
              </button>
            </form>
          </div>
        }
      />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 py-8 sm:py-10">
        <div className="mb-8 rounded-2xl border border-zinc-200/90 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-900/[0.04] backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:ring-white/[0.06] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            API keys
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Signed in as{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {email}
            </span>
          </p>
          <details className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950/50 dark:text-zinc-400">
            <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
              Technical: user_id (Supabase)
            </summary>
            <p className="mt-2 font-mono text-[11px] leading-relaxed break-all text-zinc-800 dark:text-zinc-300">
              {session.user.id}
            </p>
          </details>
          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex text-sm font-medium text-indigo-600 underline-offset-4 hover:text-indigo-500 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              ← Back to home
            </Link>
          </div>
        </div>

        <KeysDashboard />
      </main>
    </div>
  );
}
