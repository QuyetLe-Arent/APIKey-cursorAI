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
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col gap-6 px-6 py-12">
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          API keys
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {session.user.email ?? session.user.name ?? "—"}
          </span>
        </p>
        <p className="mt-3 rounded-md bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <span className="text-zinc-500 dark:text-zinc-400">user_id</span>{" "}
          {session.user.id}
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Use this id as{" "}
          <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">user_id</code>{" "}
          when calling the repository (Step 5).
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
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
    </main>
  );
}
