import { SiteHeader } from "@/components/site-header";
import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/keys");
  }

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b08_1px,transparent_1px),linear-gradient(to_bottom,#18181b08_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(to_right,#fafafa06_1px,transparent_1px),linear-gradient(to_bottom,#fafafa06_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgb(99_102_241/0.18),transparent_55%)] dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgb(139_92_246/0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-50 dark:to-zinc-950" />
      </div>

      <SiteHeader
        end={
          <Link
            href="/login"
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-md shadow-zinc-900/15 transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:shadow-none dark:hover:bg-zinc-100"
          >
            Sign in
          </Link>
        }
      />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16 sm:py-24 lg:py-28">
        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-3.5 py-1.5 text-xs font-medium text-indigo-900 shadow-sm backdrop-blur dark:border-indigo-500/30 dark:bg-indigo-950/60 dark:text-indigo-100">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
          </span>
          Welcome — sign in to continue
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem]">
          Manage API keys{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
            securely
          </span>{" "}
          in one place.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Create keys with a secret shown only once, revoke when you no longer
          need them, and store only safe metadata in the cloud — built with
          Next.js, Google sign-in, and Supabase.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:shadow-indigo-500/20"
          >
            Get started
          </Link>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            You will sign in with your Google account.
          </p>
        </div>

        <ul className="mt-20 grid gap-5 sm:grid-cols-3 lg:gap-6">
          {[
            {
              title: "One-time secret reveal",
              body: "The full key string is shown only when you create it. After that, the UI shows a prefix and status only.",
              icon: (
                <>
                  <path
                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.75"
                  />
                </>
              ),
            },
            {
              title: "Stored as a hash",
              body: "Keys are stored with a strong hash — no plaintext — tied to your account.",
              icon: (
                <path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
              ),
            },
            {
              title: "Google sign-in",
              body: "No separate app password. After OAuth you land on the dashboard.",
              icon: (
                <path
                  d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ),
            },
          ].map((item) => (
            <li
              key={item.title}
              className="group relative rounded-2xl border border-zinc-200/90 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-900/[0.04] backdrop-blur-sm transition hover:border-indigo-200/80 hover:shadow-md hover:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/50 dark:ring-white/[0.06] dark:hover:border-indigo-500/30"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  {item.icon}
                </svg>
              </div>
              <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="relative z-10 border-t border-zinc-200/70 px-6 py-8 text-center text-xs leading-relaxed text-zinc-500 dark:border-zinc-800/70 dark:text-zinc-500">
        <p className="mx-auto max-w-md">
          After signing in, you can create, list, revoke, and delete keys from
          the management page.
        </p>
      </footer>
    </div>
  );
}
