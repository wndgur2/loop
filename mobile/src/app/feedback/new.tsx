import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import {
  Button,
  Icon,
  ImportanceDots,
  LoopText,
  PressScale,
  Screen,
  ScreenHeader,
  SectionLabel,
  SelectChip,
  TextField,
} from '@/components/ui';
import { LoopColors, LoopMotion } from '@/constants/loop-theme';
import {
  type FeedbackInput,
  useCreateFeedback,
  useFeedback,
  useUpdateFeedback,
} from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { useSyncFromServer } from '@/hooks/use-sync-from-server';
import { useT } from '@/lib/i18n';
import { impLabelKey } from '@/lib/importance';
import type { TKey } from '@/lib/translations';
import { IMPORTANCE_VALUES, type Importance } from '@/types/models';

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
  const situationRef = useRef<TextInput>(null);

  // Initialize the form when the server row arrives (edit mode).
  useSyncFromServer(isEdit ? existing?.id : null, () => {
    if (!existing) return;
    setTitle(existing.title);
    setSubGoalId(existing.subGoalId);
    setImportance(existing.importance);
    setSituation(existing.situation);
    setRootCause(existing.rootCause);
    setTakeaways(existing.takeaways.length ? existing.takeaways.map((tk) => tk.text) : ['']);
    setTagsText(existing.tags.join(', '));
  });
  // New entry: default sub-goal selection (once on first load)
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
      <ScreenHeader
        onBack={() => router.back()}
        backIcon="close"
        title={isEdit ? t('form.edit') : t('form.new')}
      />

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <SectionLabel style={styles.firstLabel}>{t('form.label.title')}</SectionLabel>
          <TextField
            value={title}
            onChangeText={setTitle}
            placeholder={t('form.ph.title')}
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => situationRef.current?.focus()}
          />

          <SectionLabel>{t('form.label.subgoal')}</SectionLabel>
          {subGoals.length === 0 ? (
            <LoopText variant="caption" color="ink4">
              {t('form.nosubgoal')}
            </LoopText>
          ) : (
            <View style={styles.chipsWrap}>
              {subGoals.map((sg) => (
                <SelectChip
                  key={sg.id}
                  label={sg.name}
                  selected={sg.id === subGoalId}
                  onPress={() => setSubGoalId(sg.id)}
                />
              ))}
            </View>
          )}

          <SectionLabel>{t('form.label.importance')}</SectionLabel>
          <View style={styles.impRow}>
            {IMPORTANCE_VALUES.map((lv) => (
              <SelectChip
                key={lv}
                label={t(impLabelKey(lv))}
                selected={lv === importance}
                onPress={() => setImportance(lv)}
                tone="soft"
                leading={<ImportanceDots level={lv} />}
                style={styles.flex}
              />
            ))}
          </View>

          <SectionLabel>{t('form.label.situation')}</SectionLabel>
          <TextField
            ref={situationRef}
            value={situation}
            onChangeText={setSituation}
            placeholder={t('form.ph.situation')}
            multiline
            style={styles.multiline}
          />

          <SectionLabel>{t('form.label.rootcause')}</SectionLabel>
          <TextField
            value={rootCause}
            onChangeText={setRootCause}
            placeholder={t('form.ph.rootcause')}
            multiline
            style={styles.multiline}
          />

          <SectionLabel>{t('form.label.takeaways')}</SectionLabel>
          {takeaways.map((val, i) => (
            <View key={i} style={styles.takeawayRow}>
              <TextField
                value={val}
                onChangeText={(v) => setTakeaways((cur) => cur.map((x, j) => (j === i ? v : x)))}
                placeholder={t('form.ph.takeaway', { n: i + 1 })}
                style={styles.takeawayInput}
              />
              {takeaways.length > 1 && (
                <PressScale
                  onPress={() => setTakeaways((cur) => cur.filter((_, j) => j !== i))}
                  hitSlop={8}
                  scaleTo={LoopMotion.scale.icon}
                  style={styles.takeawayRemove}
                >
                  <Icon name="close" size={18} color={LoopColors.ink4} />
                </PressScale>
              )}
            </View>
          ))}
          <PressScale onPress={() => setTakeaways((cur) => [...cur, ''])} style={styles.addRow}>
            <Icon name="plus" size={18} color={LoopColors.warmDeep} />
            <LoopText variant="label" color="warmDeep">
              {t('form.addTakeaway')}
            </LoopText>
          </PressScale>

          <SectionLabel>{t('form.label.tags')}</SectionLabel>
          <TextField
            value={tagsText}
            onChangeText={setTagsText}
            placeholder={t('form.ph.tags')}
            autoCapitalize="none"
            returnKeyType="done"
          />

          {error && (
            <LoopText variant="caption" color="warmDeep" style={styles.error}>
              {t(error)}
            </LoopText>
          )}

          <Button
            label={isEdit ? t('form.saveEdit') : t('form.save')}
            onPress={save}
            loading={busy}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 40 },
  firstLabel: { marginTop: 0 },
  multiline: { minHeight: 92, textAlignVertical: 'top' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  impRow: { flexDirection: 'row', gap: 8 },
  takeawayRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  takeawayInput: { flex: 1 },
  takeawayRemove: { padding: 6 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  error: { marginTop: 6 },
  submit: { marginTop: 22 },
});
