import { KeysDashboard } from "@/components/keys-dashboard";
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

  return (
    <main className="mx-auto min-h-[60vh] max-w-4xl px-6 py-10">
      <header className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          API keys
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {session.user.email ?? session.user.name ?? "—"}
          </span>
        </p>
        <details className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          <summary className="cursor-pointer font-medium text-zinc-600 dark:text-zinc-300">
            Technical: user_id (Supabase)
          </summary>
          <p className="mt-2 font-mono break-all text-zinc-700 dark:text-zinc-300">
            {session.user.id}
          </p>
        </details>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Home
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm font-medium text-red-600 underline-offset-4 hover:underline dark:text-red-400"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <KeysDashboard />
    </main>
  );
}
