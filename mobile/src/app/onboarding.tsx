import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Button, Icon, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useCreateGoalWithSubGoals } from '@/features/goals/queries';
import { useI18n } from '@/lib/i18n';
import { SUGGESTED_SUBGOALS, type TKey } from '@/lib/translations';

export default function OnboardingScreen() {
  const { session } = useAuth();
  const { t, lang } = useI18n();
  // AI 추천 자리 — MVP는 정본 직군 후보를 정적으로 떠먹인다(언어별, Edge Function 추천은 v1.1).
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
      // 성공 → goal 쿼리 무효화 → 루트 컨트롤러가 탭으로 라우팅.
    } catch {
      setError('ob.err.save');
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <LoopText variant="eyebrow" color="ink4">
            {t('ob.step1')}
          </LoopText>
          <LoopText variant="title" style={{ marginTop: 8 }}>
            {t('ob.goalTitle')}
          </LoopText>
          <LoopText variant="body" color="ink3" style={{ marginTop: 8, marginBottom: 18 }}>
            {t('ob.goalDesc')}
          </LoopText>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('ob.goalPlaceholder')}
            placeholderTextColor={LoopColors.ink4}
            style={inputStyle}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={t('ob.goalDescPlaceholder')}
            placeholderTextColor={LoopColors.ink4}
            multiline
            style={[inputStyle, { marginTop: 12, minHeight: 64, textAlignVertical: 'top' }]}
          />

          <LoopText variant="eyebrow" color="ink4" style={{ marginTop: 32 }}>
            {t('ob.step2')}
          </LoopText>
          <LoopText variant="title" style={{ marginTop: 8 }}>
            {t('ob.subTitle')}
          </LoopText>
          <LoopText variant="body" color="ink3" style={{ marginTop: 8, marginBottom: 16 }}>
            {t('ob.subDesc')}
          </LoopText>

          {selected.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {selected.map((name) => (
                <Pressable key={name} onPress={() => toggle(name)}>
                  <View style={[chip, { backgroundColor: LoopColors.warm, borderColor: LoopColors.warm }]}>
                    <LoopText variant="label" color="white">
                      {name}
                    </LoopText>
                    <Icon name="close" size={14} color={LoopColors.white} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {suggestions.map((name) => (
              <Pressable key={name} onPress={() => toggle(name)}>
                <View style={chip}>
                  <Icon name="plus" size={14} color={LoopColors.ink3} />
                  <LoopText variant="label" color="ink2">
                    {name}
                  </LoopText>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, alignItems: 'center' }}>
            <TextInput
              value={custom}
              onChangeText={setCustom}
              placeholder={t('ob.addPlaceholder')}
              placeholderTextColor={LoopColors.ink4}
              onSubmitEditing={addCustom}
              style={[inputStyle, { flex: 1, paddingVertical: 11 }]}
            />
            <Pressable onPress={addCustom} style={addBtn}>
              <Icon name="plus" size={20} color={LoopColors.warmDeep} />
            </Pressable>
          </View>

          {error && (
            <LoopText variant="caption" color="warmDeep" style={{ marginTop: 16 }}>
              {t(error)}
            </LoopText>
          )}

          <Button label={t('ob.cta')} onPress={submit} disabled={!canSubmit} loading={create.isPending} style={{ marginTop: 28 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const inputStyle = {
  backgroundColor: LoopColors.surface,
  borderWidth: 1,
  borderColor: LoopColors.line,
  borderRadius: LoopRadius.xl,
  paddingHorizontal: 16,
  paddingVertical: 15,
  fontSize: 15,
  color: LoopColors.ink,
} as const;

const chip = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: 5,
  paddingHorizontal: 13,
  height: 38,
  borderRadius: LoopRadius.full,
  borderWidth: 1,
  borderColor: LoopColors.line,
  backgroundColor: LoopColors.surface,
};

const addBtn = {
  width: 46,
  height: 46,
  borderRadius: LoopRadius.xl,
  borderWidth: 1,
  borderColor: LoopColors.warmLine,
  backgroundColor: LoopColors.warmSoft,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
