import { PlaygroundPageClient } from "@/components/playground-page-client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PlaygroundPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/playground");
  }

  const email = session.user.email ?? session.user.name ?? "—";

  return <PlaygroundPageClient email={email} />;
}
