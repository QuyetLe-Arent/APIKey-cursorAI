"use client";

import { ApiKeysSection } from "@/components/api-keys-section";
import { CreateApiKeyModal } from "@/components/create-api-key-modal";
import { EditApiKeyModal } from "@/components/edit-api-key-modal";
import { NewKeySecretModal } from "@/components/new-key-secret-modal";
import { useApiKeys } from "@/hooks/use-api-keys";

export function KeysDashboard() {
  const {
    keys,
    loading,
    busyId,
    newKey,
    isCreateOpen,
    setIsCreateOpen,
    editingKey,
    setEditingKey,
    creating,
    savingEdit,
    copied,
    refresh,
    createKey,
    updateKey,
    revokeKey,
    deleteKey,
    copyNewKey,
    copyPrefix,
    closeNewKeyModal,
  } = useApiKeys();

  return (
    <>
      <ApiKeysSection
        keys={keys}
        loading={loading}
        busyId={busyId}
        onCreateClick={() => setIsCreateOpen(true)}
        onRefresh={() => void refresh()}
        onEdit={setEditingKey}
        onRevoke={(id) => void revokeKey(id)}
        onDelete={(id) => void deleteKey(id)}
        onCopyPrefix={(prefix) => void copyPrefix(prefix)}
      />

      <CreateApiKeyModal
        isOpen={isCreateOpen}
        creating={creating}
        onClose={() => setIsCreateOpen(false)}
        onCreate={(name) => void createKey(name)}
      />

      <EditApiKeyModal
        apiKey={editingKey}
        isOpen={Boolean(editingKey)}
        saving={savingEdit}
        onClose={() => setEditingKey(null)}
        onUpdate={(key) => void updateKey(key)}
      />

      {newKey && (
        <NewKeySecretModal
          newKey={newKey}
          copied={copied}
          onCopy={() => void copyNewKey()}
          onClose={closeNewKeyModal}
        />
      )}
    </>
  );
}
