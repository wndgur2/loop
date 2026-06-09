import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, ConfirmDialog, Icon, LoopText, PressScale, Screen } from '@/components/ui';
import { LoopColors, LoopMotion, LoopRadius } from '@/constants/loop-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useI18n } from '@/lib/i18n';

export default function AccountScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { session, updateDisplayName, deleteAccount, signOut } = useAuth();

  const email = session?.user.email ?? '';
  const currentName = (session?.user.user_metadata?.display_name as string | undefined) ?? '';

  const [name, setName] = useState(currentName);
  // When the session's name changes (after a successful save), sync the input value to it (during render — no effect needed).
  const [syncedName, setSyncedName] = useState(currentName);
  if (currentName !== syncedName) {
    setSyncedName(currentName);
    setName(currentName);
  }

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dialog, setDialog] = useState<
    { kind: 'signout' } | { kind: 'delete' } | { kind: 'info'; title: string; message?: string } | null
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
      <View style={styles.header}>
        <PressScale onPress={() => router.back()} hitSlop={8} scaleTo={LoopMotion.scale.icon} style={styles.headerBtn}>
          <Icon name="chevron-left" size={24} color={LoopColors.ink2} />
        </PressScale>
        <LoopText variant="heading2">{t('account.title')}</LoopText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SectionTitle>{t('account.section.profile')}</SectionTitle>
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
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('account.namePlaceholder')}
            placeholderTextColor={LoopColors.ink4}
            style={styles.nameInput}
          />
          {nameChanged && (
            <Button label={t('account.nameSave')} height={42} loading={saving} onPress={saveName} style={styles.nameSave} />
          )}
        </Card>

        <Button label={t('account.signout')} variant="secondary" onPress={() => setDialog({ kind: 'signout' })} style={styles.signout} />

        <PressScale onPress={() => setDialog({ kind: 'delete' })} disabled={deleting} hitSlop={6} haptic style={styles.deleteRow}>
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <LoopText variant="eyebrow" color="ink4" style={styles.sectionTitle}>
      {children}
    </LoopText>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 },
  headerBtn: { padding: 4 },
  scroll: { paddingHorizontal: 22, paddingBottom: 24 },
  sectionTitle: { marginTop: 4, marginBottom: 11 },
  card: { padding: 16 },
  email: { marginTop: 4 },
  divider: { height: 1, backgroundColor: LoopColors.lineSoft, marginVertical: 16 },
  nameInput: {
    fontSize: 16,
    fontWeight: '600',
    color: LoopColors.ink,
    borderBottomWidth: 1,
    borderBottomColor: LoopColors.lineSoft,
    paddingVertical: 8,
    marginTop: 4,
  },
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
