import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Button,
  Card,
  ConfirmDialog,
  Icon,
  LoopText,
  PressScale,
  Screen,
  ScreenHeader,
  SectionLabel,
  TextField,
  LoopColors,
  LoopRadius,
} from '@loop/ui';
import { useAuth } from '@/features/auth/auth-context';
import { useSyncFromServer } from '@/hooks/use-sync-from-server';
import { useI18n } from '@/lib/i18n';

export default function AccountScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { session, updateDisplayName, deleteAccount, signOut } = useAuth();

  const email = session?.user.email ?? '';
  const currentName = (session?.user.user_metadata?.display_name as string | undefined) ?? '';

  const [name, setName] = useState(currentName);
  // When the session's name changes (after a successful save), sync the input value to it.
  useSyncFromServer(currentName, setName);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialog, setDialog] = useState<
    | { kind: 'signout' }
    | { kind: 'delete' }
    | { kind: 'info'; title: string; message?: string }
    | null
  >(null);

  const nameChanged = name.trim().length > 0 && name.trim() !== currentName;

  async function saveName() {
    if (!nameChanged) return;
    setSaving(true);
    try {
      await updateDisplayName(name);
    } catch {
      setDialog({ kind: 'info', title: t('account.nameSaveFail') });
    } finally {
      setSaving(false);
    }
  }

  function doSignOut() {
    setDialog(null);
    signOut();
  }

  async function doDelete() {
    setDeleting(true);
    try {
      // On success, deleteAccount signs out → the root navigator sends the user to sign-in.
      await deleteAccount();
    } catch {
      setDeleting(false);
      setDialog({ kind: 'info', title: t('account.delete.fail') });
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader onBack={() => router.back()} title={t('account.title')} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SectionLabel first>{t('account.section.profile')}</SectionLabel>
        <Card radius={20} style={styles.card}>
          <LoopText variant="caption" color="ink4">
            {t('account.email')}
          </LoopText>
          <LoopText variant="body" color="ink2" style={styles.email}>
            {email}
          </LoopText>

          <View style={styles.divider} />

          <LoopText variant="caption" color="ink4">
            {t('account.name')}
          </LoopText>
          <TextField
            variant="underline"
            value={name}
            onChangeText={setName}
            placeholder={t('account.namePlaceholder')}
            style={styles.nameInput}
          />
          {nameChanged && (
            <Button
              label={t('account.nameSave')}
              height={42}
              loading={saving}
              onPress={saveName}
              style={styles.nameSave}
            />
          )}
        </Card>

        <Button
          label={t('account.signout')}
          variant="secondary"
          onPress={() => setDialog({ kind: 'signout' })}
          style={styles.signout}
        />

        <PressScale
          onPress={() => setDialog({ kind: 'delete' })}
          disabled={deleting}
          hitSlop={6}
          style={styles.deleteRow}
        >
          <Icon name="trash" size={18} color={LoopColors.danger} />
          <LoopText variant="label" style={[styles.deleteLabel, deleting && styles.deleteDisabled]}>
            {t('account.delete')}
          </LoopText>
        </PressScale>
      </ScrollView>

      <ConfirmDialog
        visible={dialog?.kind === 'signout'}
        title={t('settings.signout.title')}
        message={t('settings.signout.msg')}
        confirmLabel={t('account.signout')}
        cancelLabel={t('common.cancel')}
        onConfirm={doSignOut}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        visible={dialog?.kind === 'delete'}
        icon="trash"
        title={t('account.delete.title')}
        message={t('account.delete.msg')}
        confirmLabel={t('account.delete.confirm')}
        cancelLabel={t('common.cancel')}
        destructive
        loading={deleting}
        onConfirm={doDelete}
        onCancel={() => setDialog(null)}
      />

      <ConfirmDialog
        visible={dialog?.kind === 'info'}
        title={dialog?.kind === 'info' ? dialog.title : ''}
        message={dialog?.kind === 'info' ? dialog.message : undefined}
        confirmLabel={t('common.ok')}
        onConfirm={() => setDialog(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 22, paddingBottom: 24 },
  card: { padding: 16 },
  email: { marginTop: 4 },
  divider: { height: 1, backgroundColor: LoopColors.lineSoft, marginVertical: 16 },
  nameInput: { marginTop: 4 },
  nameSave: { marginTop: 14 },
  signout: { marginTop: 28 },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    marginTop: 14,
    borderRadius: LoopRadius.xl,
  },
  deleteLabel: { color: LoopColors.danger },
  deleteDisabled: { opacity: 0.5 },
});
