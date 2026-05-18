"use client";

import { ApiKeysSection } from "@/components/api-keys-section";
import { CreateApiKeyModal } from "@/components/create-api-key-modal";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardOverview } from "@/components/dashboard-overview";
import { EditApiKeyModal } from "@/components/edit-api-key-modal";
import { NewKeySecretModal } from "@/components/new-key-secret-modal";
import { PlanOverviewCard } from "@/components/plan-overview-card";
import { useApiKeys } from "@/hooks/use-api-keys";

type KeysPageClientProps = {
  email: string;
  userId: string;
};

/** Shell only — must not call useNotify / useApiKeys here (provider is inside DashboardLayout). */
export function KeysPageClient({ email, userId }: KeysPageClientProps) {
  return (
    <DashboardLayout>
      <KeysPageContent email={email} userId={userId} />
    </DashboardLayout>
  );
}

function KeysPageContent({ email, userId }: KeysPageClientProps) {
  const api = useApiKeys();
  const activeKeyCount = api.keys.filter((k) => !k.revoked_at).length;

  return (
    <>
      <DashboardOverview email={email} />
      <PlanOverviewCard activeKeyCount={activeKeyCount} keysLoading={api.loading} />
      <details className="rounded-xl border border-zinc-200/90 bg-white/90 px-4 py-3 text-xs text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
        <summary className="cursor-pointer font-medium text-zinc-700 dark:text-zinc-300">
          Technical: user_id (Supabase)
        </summary>
        <p className="mt-2 font-mono text-[11px] leading-relaxed break-all text-zinc-800 dark:text-zinc-300">
          {userId}
        </p>
      </details>

      <ApiKeysSection
        keys={api.keys}
        loading={api.loading}
        refreshing={api.refreshing}
        busyId={api.busyId}
        onCreateClick={() => api.setIsCreateOpen(true)}
        onRefresh={() => void api.refresh()}
        onEdit={api.setEditingKey}
        onRevoke={(id) => void api.revokeKey(id)}
        onDelete={(id) => void api.deleteKey(id)}
        onCopyPrefix={(prefix) => void api.copyPrefix(prefix)}
      />

      <CreateApiKeyModal
        isOpen={api.isCreateOpen}
        creating={api.creating}
        onClose={() => api.setIsCreateOpen(false)}
        onCreate={(name, limit) => void api.createKey(name, limit)}
      />

      <EditApiKeyModal
        apiKey={api.editingKey}
        isOpen={Boolean(api.editingKey)}
        saving={api.savingEdit}
        onClose={() => api.setEditingKey(null)}
        onUpdate={(key) => void api.updateKey(key)}
      />

      {api.newKey && (
        <NewKeySecretModal
          newKey={api.newKey}
          copied={api.copied}
          onCopy={() => void api.copyNewKey()}
          onClose={api.closeNewKeyModal}
        />
      )}
    </>
  );
}
