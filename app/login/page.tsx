import { signIn } from "@/auth";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const redirectTo =
    callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/keys";

  async function loginWithGoogle() {
    "use server";
    await signIn("google", { redirectTo });
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Use your Google account to manage API keys.
        </p>
      </div>
      <form action={loginWithGoogle}>
        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Continue with Google
        </button>
      </form>
    </main>
  );
}
