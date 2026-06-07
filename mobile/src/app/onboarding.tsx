import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Button, Icon, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { useAuth } from '@/features/auth/auth-context';
import { useCreateGoalWithSubGoals } from '@/features/goals/queries';

// AI 추천 자리 — MVP는 정본 직군 후보를 정적으로 떠먹인다(Edge Function 추천은 v1.1).
const SUGGESTED = ['협업', '커뮤니케이션', '제품 기획', '문제 정의', '의사결정', '실행력', '데이터 분석', '리더십'];

export default function OnboardingScreen() {
  const { session } = useAuth();
  const create = useCreateGoalWithSubGoals();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [error, setError] = useState<string | null>(null);

  const canSubmit = title.trim().length > 0 && selected.length > 0 && !create.isPending;

  const suggestions = useMemo(() => SUGGESTED.filter((s) => !selected.includes(s)), [selected]);

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
      setError('세션이 만료됐어요. 다시 로그인해 주세요.');
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
      setError('저장에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <LoopText variant="eyebrow" color="ink4">
            1. 최종 목표
          </LoopText>
          <LoopText variant="title" style={{ marginTop: 8 }}>
            어디로 향하고 있나요?
          </LoopText>
          <LoopText variant="body" color="ink3" style={{ marginTop: 8, marginBottom: 18 }}>
            모든 피드백을 이 커리어 목표에 정렬해 드려요.
          </LoopText>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="예: Product Owner 달성"
            placeholderTextColor={LoopColors.ink4}
            style={inputStyle}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="목표에 대한 한 줄 설명 (선택)"
            placeholderTextColor={LoopColors.ink4}
            multiline
            style={[inputStyle, { marginTop: 12, minHeight: 64, textAlignVertical: 'top' }]}
          />

          <LoopText variant="eyebrow" color="ink4" style={{ marginTop: 32 }}>
            2. 하위 목표
          </LoopText>
          <LoopText variant="title" style={{ marginTop: 8 }}>
            어떤 영역을 키울까요?
          </LoopText>
          <LoopText variant="body" color="ink3" style={{ marginTop: 8, marginBottom: 16 }}>
            모든 피드백은 하나의 하위 목표에 속해요. 추천을 누르거나 직접 더하세요.
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
              placeholder="직접 추가"
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
              {error}
            </LoopText>
          )}

          <Button label="Loop 시작하기" onPress={submit} disabled={!canSubmit} loading={create.isPending} style={{ marginTop: 28 }} />
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
