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
};

/** Shell only — must not call useNotify / useApiKeys here (provider is inside DashboardLayout). */
export function KeysPageClient({ email }: KeysPageClientProps) {
  return (
    <DashboardLayout>
      <KeysPageContent email={email} />
    </DashboardLayout>
  );
}

function KeysPageContent({ email }: KeysPageClientProps) {
  const api = useApiKeys();
  const activeKeyCount = api.keys.filter((k) => !k.revoked_at).length;

  return (
    <>
      <DashboardOverview email={email} />
      <PlanOverviewCard activeKeyCount={activeKeyCount} keysLoading={api.loading} />

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
