import { KeysPageClient } from "@/components/keys-page-client";
import { auth } from "@/auth";
import { listApiKeysForUser } from "@/lib/api-keys-repository";
import { redirect } from "next/navigation";

export default async function KeysPage() {
  const session = await auth();
  const userId = session?.user?.id?.trim();
  if (!session?.user || !userId) {
    redirect("/login?callbackUrl=/keys");
  }

  const email = session.user.email ?? session.user.name ?? "—";
  const initialKeys = await listApiKeysForUser(userId);

  return <KeysPageClient email={email} initialKeys={initialKeys} />;
}
