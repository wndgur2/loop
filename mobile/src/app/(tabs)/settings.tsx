import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, ConfirmDialog, Icon, LoopText, Screen, TabHeader } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  useActiveGoal,
  useAddSubGoal,
  useDeleteSubGoal,
  useSubGoals,
  useUpdateGoal,
} from '@/features/goals/queries';
import { useI18n } from '@/lib/i18n';

export default function SettingsScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const { t, lang, setLang } = useI18n();
  const { data: goal } = useActiveGoal();
  const { data: subGoals = [] } = useSubGoals();
  const updateGoal = useUpdateGoal();
  const addSubGoal = useAddSubGoal();
  const deleteSubGoal = useDeleteSubGoal();

  const [goalTitle, setGoalTitle] = useState('');
  const [newSub, setNewSub] = useState('');
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  // When the server goal arrives/changes, initialize the edit field with that value (sync during render — no effect needed).
  const [syncedGoalId, setSyncedGoalId] = useState<string | undefined>(undefined);
  if (goal && goal.id !== syncedGoalId) {
    setSyncedGoalId(goal.id);
    setGoalTitle(goal.title);
  }

  const email = session?.user.email ?? '';
  const displayName = (session?.user.user_metadata?.display_name as string | undefined) ?? '';
  const goalChanged = !!goal && goalTitle.trim().length > 0 && goalTitle.trim() !== goal.title;

  async function saveGoal() {
    if (!goal || !goalChanged) return;
    await updateGoal.mutateAsync({ id: goal.id, title: goalTitle, description: goal.description });
  }

  async function addSub() {
    const name = newSub.trim();
    if (!name || !goal) return;
    await addSubGoal.mutateAsync({ goalId: goal.id, name, sortOrder: subGoals.length });
    setNewSub('');
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteSubGoal.mutateAsync(pendingDelete.id);
      setPendingDelete(null);
    } catch {
      setPendingDelete(null);
      Alert.alert(t('settings.subgoal.delete.failTitle'), t('settings.subgoal.delete.failMsg'));
    }
  }

  return (
    <Screen edges={['top']}>
      <TabHeader title={t('settings.title')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SectionTitle first>{t('settings.section.account')}</SectionTitle>
        <Pressable onPress={() => router.push('/account')}>
          <Card radius={20} style={styles.accountCard}>
            <View style={styles.accountInfo}>
              {!!displayName && <LoopText variant="cardTitle">{displayName}</LoopText>}
              <LoopText variant="bodyTight" color="ink3">
                {email}
              </LoopText>
            </View>
            <Icon name="chevron-right" size={20} color={LoopColors.ink4} />
          </Card>
        </Pressable>

        <SectionTitle>{t('settings.section.language')}</SectionTitle>
        <View style={styles.langRow}>
          <LangPill label="한국어" active={lang === 'ko'} onPress={() => setLang('ko')} />
          <LangPill label="English" active={lang === 'en'} onPress={() => setLang('en')} />
        </View>

        <SectionTitle>{t('settings.section.goal')}</SectionTitle>
        <Card radius={20} style={styles.goalCard}>
          <TextInput
            value={goalTitle}
            onChangeText={setGoalTitle}
            placeholder={t('settings.goalPlaceholder')}
            placeholderTextColor={LoopColors.ink4}
            style={styles.goalInput}
          />
          {goalChanged && (
            <Button label={t('settings.goalSave')} height={42} loading={updateGoal.isPending} onPress={saveGoal} style={styles.goalSave} />
          )}
        </Card>

        <SectionTitle>{t('settings.section.subgoals')}</SectionTitle>
        <Card radius={20} style={styles.subCard}>
          {subGoals.map((s, i) => (
            <View key={s.id} style={[styles.subRow, i > 0 && styles.subDivider]}>
              <Icon name="target" size={17} color={LoopColors.warmDeep} />
              <LoopText variant="body" color="ink2" style={styles.subName}>
                {s.name}
              </LoopText>
              <Pressable
                onPress={() => setPendingDelete({ id: s.id, name: s.name })}
                hitSlop={8}
                style={styles.subDelete}
              >
                <Icon name="trash" size={18} color={LoopColors.ink4} />
              </Pressable>
            </View>
          ))}

          <View style={styles.addRow}>
            <TextInput
              value={newSub}
              onChangeText={setNewSub}
              placeholder={t('settings.addSubgoal')}
              placeholderTextColor={LoopColors.ink4}
              onSubmitEditing={addSub}
              style={styles.addInput}
            />
            <Pressable onPress={addSub} style={styles.addBtn}>
              <Icon name="plus" size={20} color={LoopColors.warmDeep} />
            </Pressable>
          </View>
        </Card>

        <LoopText variant="caption" color="ink4" style={styles.tagline}>
          {t('settings.tagline')}
        </LoopText>
      </ScrollView>

      <ConfirmDialog
        visible={!!pendingDelete}
        icon="trash"
        title={t('settings.subgoal.delete.title')}
        message={pendingDelete ? t('settings.subgoal.delete.msg', { name: pendingDelete.name }) : undefined}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        loading={deleteSubGoal.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}

function LangPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.flex}>
      <View style={[styles.langPill, active ? styles.langPillOn : styles.langPillOff]}>
        <LoopText variant="label" color={active ? 'warmDeep' : 'ink3'}>
          {label}
        </LoopText>
      </View>
    </Pressable>
  );
}

function SectionTitle({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <LoopText variant="eyebrow" color="ink4" style={[styles.sectionTitle, first && styles.sectionTitleFirst]}>
      {children}
    </LoopText>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingBottom: 24 },
  accountCard: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  accountInfo: { flex: 1, gap: 4 },
  langRow: { flexDirection: 'row', gap: 8 },
  langPill: { height: 46, borderRadius: LoopRadius.xl, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  langPillOn: { borderColor: LoopColors.warm, backgroundColor: LoopColors.warmSoft },
  langPillOff: { borderColor: LoopColors.line, backgroundColor: LoopColors.surface },
  goalCard: { padding: 16 },
  goalInput: {
    fontSize: 16,
    fontWeight: '600',
    color: LoopColors.ink,
    borderBottomWidth: 1,
    borderBottomColor: LoopColors.lineSoft,
    paddingVertical: 8,
  },
  goalSave: { marginTop: 14 },
  subCard: { padding: 8 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10 },
  subDivider: { borderTopWidth: 1, borderTopColor: LoopColors.lineSoft },
  subName: { flex: 1, marginLeft: 10 },
  subDelete: { padding: 4 },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 8 },
  addInput: {
    flex: 1,
    backgroundColor: LoopColors.canvas,
    borderRadius: LoopRadius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: LoopColors.ink,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: LoopRadius.lg,
    backgroundColor: LoopColors.warmSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: { textAlign: 'center', marginTop: 20 },
  sectionTitle: { marginTop: 24, marginBottom: 11 },
  sectionTitleFirst: { marginTop: 4 },
});
