import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import { Button, Icon, LoopText, PressScale, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useCreateGoalWithSubGoals } from '@/features/goals/queries';
import { useI18n } from '@/lib/i18n';
import { SUGGESTED_SUBGOALS, type TKey } from '@/lib/translations';

export default function OnboardingScreen() {
  const { session } = useAuth();
  const { t, lang } = useI18n();
  // Placeholder for AI recommendations — the MVP statically serves canonical role candidates (per language; Edge Function recommendations land in v1.1).
  const SUGGESTED = SUGGESTED_SUBGOALS[lang];
  const create = useCreateGoalWithSubGoals();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [error, setError] = useState<TKey | null>(null);

  const canSubmit = title.trim().length > 0 && selected.length > 0 && !create.isPending;

  const suggestions = SUGGESTED.filter((s) => !selected.includes(s));

  function toggle(name: string) {
    setSelected((cur) => (cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name]));
  }

  function addCustom() {
    const name = custom.trim();
    if (!name) return;
    if (!selected.includes(name)) setSelected((cur) => [...cur, name]);
    setCustom('');
  }

  async function submit() {
    setError(null);
    const userId = session?.user.id;
    if (!userId) {
      setError('ob.err.session');
      return;
    }
    try {
      await create.mutateAsync({
        userId,
        title,
        description: description.trim() || null,
        subGoals: selected.map((name) => ({
          name,
          source: SUGGESTED.includes(name) ? 'ai_suggested' : 'user_added',
        })),
      });
      // Success → invalidate the goal query → the root controller routes to the tabs.
    } catch {
      setError('ob.err.save');
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <LoopText variant="eyebrow" color="ink4">
            {t('ob.step1')}
          </LoopText>
          <LoopText variant="title" style={styles.gap8}>
            {t('ob.goalTitle')}
          </LoopText>
          <LoopText variant="body" color="ink3" style={styles.lead}>
            {t('ob.goalDesc')}
          </LoopText>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('ob.goalPlaceholder')}
            placeholderTextColor={LoopColors.ink4}
            style={styles.input}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('ob.goalDescPlaceholder')}
            placeholderTextColor={LoopColors.ink4}
            multiline
            style={[styles.input, styles.descInput]}
          />

          <LoopText variant="eyebrow" color="ink4" style={styles.step2}>
            {t('ob.step2')}
          </LoopText>
          <LoopText variant="title" style={styles.gap8}>
            {t('ob.subTitle')}
          </LoopText>
          <LoopText variant="body" color="ink3" style={styles.subLead}>
            {t('ob.subDesc')}
          </LoopText>

          {selected.length > 0 && (
            <View style={styles.selectedWrap}>
              {selected.map((name) => (
                <PressScale key={name} onPress={() => toggle(name)} haptic="select">
                  <View style={[styles.chip, styles.chipOn]}>
                    <LoopText variant="label" color="white">
                      {name}
                    </LoopText>
                    <Icon name="close" size={14} color={LoopColors.white} />
                  </View>
                </PressScale>
              ))}
            </View>
          )}

          <View style={styles.chipsWrap}>
            {suggestions.map((name) => (
              <PressScale key={name} onPress={() => toggle(name)} haptic="select">
                <View style={styles.chip}>
                  <Icon name="plus" size={14} color={LoopColors.ink3} />
                  <LoopText variant="label" color="ink2">
                    {name}
                  </LoopText>
                </View>
              </PressScale>
            ))}
          </View>

          <View style={styles.customRow}>
            <TextInput
              value={custom}
              onChangeText={setCustom}
              placeholder={t('ob.addPlaceholder')}
              placeholderTextColor={LoopColors.ink4}
              onSubmitEditing={addCustom}
              style={[styles.input, styles.customInput]}
            />
            <PressScale onPress={addCustom} haptic style={styles.addBtn}>
              <Icon name="plus" size={20} color={LoopColors.warmDeep} />
            </PressScale>
          </View>

          {error && (
            <LoopText variant="caption" color="warmDeep" style={styles.error}>
              {t(error)}
            </LoopText>
          )}

          <Button label={t('ob.cta')} onPress={submit} disabled={!canSubmit} loading={create.isPending} style={styles.submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40 },
  gap8: { marginTop: 8 },
  lead: { marginTop: 8, marginBottom: 18 },
  step2: { marginTop: 32 },
  subLead: { marginTop: 8, marginBottom: 16 },
  input: {
    backgroundColor: LoopColors.surface,
    borderWidth: 1,
    borderColor: LoopColors.line,
    borderRadius: LoopRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: LoopColors.ink,
  },
  descInput: { marginTop: 12, minHeight: 64, textAlignVertical: 'top' },
  selectedWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    height: 38,
    borderRadius: LoopRadius.full,
    borderWidth: 1,
    borderColor: LoopColors.line,
    backgroundColor: LoopColors.surface,
  },
  chipOn: { backgroundColor: LoopColors.warm, borderColor: LoopColors.warm },
  customRow: { flexDirection: 'row', gap: 8, marginTop: 14, alignItems: 'center' },
  customInput: { flex: 1, paddingVertical: 11 },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: LoopRadius.xl,
    borderWidth: 1,
    borderColor: LoopColors.warmLine,
    backgroundColor: LoopColors.warmSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { marginTop: 16 },
  submit: { marginTop: 28 },
});
