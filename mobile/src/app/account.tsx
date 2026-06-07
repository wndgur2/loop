import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Icon, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useI18n } from '@/lib/i18n';

// 파괴적 액션 전용 빨강(팔레트엔 채도색이 warm 하나뿐이라 여기서만 쓰는 일회성 리터럴).
const DANGER = '#C0392B';

export default function AccountScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { session, updateDisplayName, deleteAccount, signOut } = useAuth();

  const email = session?.user.email ?? '';
  const currentName = (session?.user.user_metadata?.display_name as string | undefined) ?? '';

  const [name, setName] = useState(currentName);
  // 세션의 이름이 바뀌면(저장 성공 후) 입력값을 그 값으로 동기화(렌더 중 — effect 불필요).
  const [syncedName, setSyncedName] = useState(currentName);
  if (currentName !== syncedName) {
    setSyncedName(currentName);
    setName(currentName);
  }

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const nameChanged = name.trim().length > 0 && name.trim() !== currentName;

  async function saveName() {
    if (!nameChanged) return;
    setSaving(true);
    try {
      await updateDisplayName(name);
    } catch {
      Alert.alert(t('account.nameSaveFail'));
    } finally {
      setSaving(false);
    }
  }

  function confirmSignOut() {
    Alert.alert(t('settings.signout.title'), t('settings.signout.msg'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('account.signout'), style: 'destructive', onPress: () => signOut() },
    ]);
  }

  function confirmDelete() {
    Alert.alert(t('account.delete.title'), t('account.delete.msg'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('account.delete.confirm'),
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            // 성공 시 deleteAccount가 로그아웃 → 루트 네비게이터가 sign-in으로 보낸다.
            await deleteAccount();
          } catch {
            setDeleting(false);
            Alert.alert(t('account.delete.fail'));
          }
        },
      },
    ]);
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerBtn}>
          <Icon name="chevron-left" size={24} color={LoopColors.ink2} />
        </Pressable>
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

        <Button label={t('account.signout')} variant="secondary" onPress={confirmSignOut} style={styles.signout} />

        <Pressable onPress={confirmDelete} disabled={deleting} hitSlop={6} style={styles.deleteRow}>
          <Icon name="trash" size={18} color={DANGER} />
          <LoopText variant="label" style={[styles.deleteLabel, deleting && styles.deleteDisabled]}>
            {t('account.delete')}
          </LoopText>
        </Pressable>
      </ScrollView>
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
  deleteLabel: { color: DANGER },
  deleteDisabled: { opacity: 0.5 },
});
