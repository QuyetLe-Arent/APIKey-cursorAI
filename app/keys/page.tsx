import { KeysPageClient } from "@/components/keys-page-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function KeysPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/keys");
  }

  const email = session.user.email ?? session.user.name ?? "—";

  return <KeysPageClient email={email} userId={session.user.id} />;
}
