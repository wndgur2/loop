import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Icon, ImportanceDots, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import {
  type FeedbackInput,
  useCreateFeedback,
  useFeedback,
  useUpdateFeedback,
} from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { useT } from '@/lib/i18n';
import type { TKey } from '@/lib/translations';
import { IMPORTANCE_VALUES, type Importance } from '@/types/models';

function impLabelKey(imp: Importance): TKey {
  return imp === 'high' ? 'imp.high' : imp === 'low' ? 'imp.low' : 'imp.mid';
}

export default function FeedbackFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const t = useT();
  const isEdit = !!id;

  const { data: subGoals = [] } = useSubGoals();
  const { data: existing } = useFeedback(id);
  const create = useCreateFeedback();
  const update = useUpdateFeedback();

  const [title, setTitle] = useState('');
  const [subGoalId, setSubGoalId] = useState<string | null>(null);
  const [importance, setImportance] = useState<Importance>('mid');
  const [situation, setSituation] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [takeaways, setTakeaways] = useState<string[]>(['']);
  const [tagsText, setTagsText] = useState('');
  const [error, setError] = useState<TKey | null>(null);

  // 서버 데이터 도착 시 폼을 초기화 — 렌더 중 동기화(effect 불필요, React 권장 패턴).
  const [syncedId, setSyncedId] = useState<string | null>(null);
  if (isEdit && existing && syncedId !== existing.id) {
    setSyncedId(existing.id);
    setTitle(existing.title);
    setSubGoalId(existing.subGoalId);
    setImportance(existing.importance);
    setSituation(existing.situation);
    setRootCause(existing.rootCause);
    setTakeaways(existing.takeaways.length ? existing.takeaways.map((tk) => tk.text) : ['']);
    setTagsText(existing.tags.join(', '));
  }
  // 새 작성: 하위목표 기본 선택(첫 로드 1회)
  if (!isEdit && subGoalId === null && subGoals.length > 0) {
    setSubGoalId(subGoals[0].id);
  }

  const busy = create.isPending || update.isPending;

  async function save() {
    setError(null);
    if (!title.trim() || !situation.trim() || !rootCause.trim()) {
      setError('form.err.required');
      return;
    }
    if (!subGoalId) {
      setError('form.err.subgoal');
      return;
    }
    const payload: FeedbackInput = {
      title,
      situation,
      rootCause,
      subGoalId,
      importance,
      tags: tagsText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      takeaways: takeaways.map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (isEdit && id) {
        await update.mutateAsync({ id, ...payload });
        router.back();
      } else {
        const fb = await create.mutateAsync(payload);
        router.replace(`/feedback/${fb.id}`);
      }
    } catch {
      setError('form.err.save');
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerBack}>
          <Icon name="close" size={24} color={LoopColors.ink2} />
        </Pressable>
        <LoopText variant="heading2" style={styles.headerTitle}>
          {isEdit ? t('form.edit') : t('form.new')}
        </LoopText>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <FieldLabel>{t('form.label.title')}</FieldLabel>
          <TextInput value={title} onChangeText={setTitle} placeholder={t('form.ph.title')} placeholderTextColor={LoopColors.ink4} style={styles.input} />

          <FieldLabel>{t('form.label.subgoal')}</FieldLabel>
          {subGoals.length === 0 ? (
            <LoopText variant="caption" color="ink4">
              {t('form.nosubgoal')}
            </LoopText>
          ) : (
            <View style={styles.chipsWrap}>
              {subGoals.map((sg) => {
                const on = sg.id === subGoalId;
                return (
                  <Pressable key={sg.id} onPress={() => setSubGoalId(sg.id)}>
                    <View style={[styles.selChip, on && styles.selChipOn]}>
                      <LoopText variant="label" color={on ? 'white' : 'ink2'}>
                        {sg.name}
                      </LoopText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <FieldLabel>{t('form.label.importance')}</FieldLabel>
          <View style={styles.impRow}>
            {IMPORTANCE_VALUES.map((lv) => {
              const on = lv === importance;
              return (
                <Pressable key={lv} onPress={() => setImportance(lv)} style={styles.flex}>
                  <View style={[styles.selChip, styles.impChip, on && styles.impChipOn]}>
                    <ImportanceDots level={lv} />
                    <LoopText variant="label" color={on ? 'warmDeep' : 'ink3'}>
                      {t(impLabelKey(lv))}
                    </LoopText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <FieldLabel>{t('form.label.situation')}</FieldLabel>
          <TextInput
            value={situation}
            onChangeText={setSituation}
            placeholder={t('form.ph.situation')}
            placeholderTextColor={LoopColors.ink4}
            multiline
            style={[styles.input, styles.multiline]}
          />

          <FieldLabel>{t('form.label.rootcause')}</FieldLabel>
          <TextInput
            value={rootCause}
            onChangeText={setRootCause}
            placeholder={t('form.ph.rootcause')}
            placeholderTextColor={LoopColors.ink4}
            multiline
            style={[styles.input, styles.multiline]}
          />

          <FieldLabel>{t('form.label.takeaways')}</FieldLabel>
          {takeaways.map((val, i) => (
            <View key={i} style={styles.takeawayRow}>
              <TextInput
                value={val}
                onChangeText={(v) => setTakeaways((cur) => cur.map((x, j) => (j === i ? v : x)))}
                placeholder={t('form.ph.takeaway', { n: i + 1 })}
                placeholderTextColor={LoopColors.ink4}
                style={[styles.input, styles.takeawayInput]}
              />
              {takeaways.length > 1 && (
                <Pressable onPress={() => setTakeaways((cur) => cur.filter((_, j) => j !== i))} hitSlop={8} style={styles.takeawayRemove}>
                  <Icon name="close" size={18} color={LoopColors.ink4} />
                </Pressable>
              )}
            </View>
          ))}
          <Pressable onPress={() => setTakeaways((cur) => [...cur, ''])} style={styles.addRow}>
            <Icon name="plus" size={18} color={LoopColors.warmDeep} />
            <LoopText variant="label" color="warmDeep">
              {t('form.addTakeaway')}
            </LoopText>
          </Pressable>

          <FieldLabel>{t('form.label.tags')}</FieldLabel>
          <TextInput
            value={tagsText}
            onChangeText={setTagsText}
            placeholder={t('form.ph.tags')}
            placeholderTextColor={LoopColors.ink4}
            autoCapitalize="none"
            style={styles.input}
          />

          {error && (
            <LoopText variant="caption" color="warmDeep" style={styles.error}>
              {t(error)}
            </LoopText>
          )}

          <Button label={isEdit ? t('form.saveEdit') : t('form.save')} onPress={save} loading={busy} style={styles.submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <LoopText variant="eyebrow" color="ink4" style={styles.fieldLabel}>
      {children}
    </LoopText>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
  headerBack: { padding: 4 },
  headerTitle: { marginLeft: 8 },
  scroll: { padding: 22, paddingBottom: 40 },
  fieldLabel: { marginTop: 22, marginBottom: 9 },
  input: {
    backgroundColor: LoopColors.surface,
    borderWidth: 1,
    borderColor: LoopColors.line,
    borderRadius: LoopRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: LoopColors.ink,
  },
  multiline: { minHeight: 92, textAlignVertical: 'top' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selChip: {
    paddingHorizontal: 14,
    height: 40,
    borderRadius: LoopRadius.full,
    borderWidth: 1,
    borderColor: LoopColors.line,
    backgroundColor: LoopColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selChipOn: { backgroundColor: LoopColors.warm, borderColor: LoopColors.warm },
  impRow: { flexDirection: 'row', gap: 8 },
  impChip: { flexDirection: 'row', justifyContent: 'center', gap: 7 },
  impChipOn: { backgroundColor: LoopColors.warmSoft, borderColor: LoopColors.warmLine },
  takeawayRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  takeawayInput: { flex: 1 },
  takeawayRemove: { padding: 6 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  error: { marginTop: 6 },
  submit: { marginTop: 22 },
});
