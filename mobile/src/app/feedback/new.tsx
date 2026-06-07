import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Button, Icon, ImportanceDots, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import {
  type FeedbackInput,
  useCreateFeedback,
  useFeedback,
  useUpdateFeedback,
} from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { IMPORTANCE_LABEL, IMPORTANCE_VALUES, type Importance } from '@/types/models';

export default function FeedbackFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
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
  const [error, setError] = useState<string | null>(null);

  // 서버 데이터 도착 시 폼을 초기화 — 렌더 중 동기화(effect 불필요, React 권장 패턴).
  const [syncedId, setSyncedId] = useState<string | null>(null);
  if (isEdit && existing && syncedId !== existing.id) {
    setSyncedId(existing.id);
    setTitle(existing.title);
    setSubGoalId(existing.subGoalId);
    setImportance(existing.importance);
    setSituation(existing.situation);
    setRootCause(existing.rootCause);
    setTakeaways(existing.takeaways.length ? existing.takeaways.map((t) => t.text) : ['']);
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
      setError('제목·상황·근본 원인을 모두 채워 주세요.');
      return;
    }
    if (!subGoalId) {
      setError('하위 목표를 하나 선택해 주세요.');
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
        .map((t) => t.trim())
        .filter(Boolean),
      takeaways: takeaways.map((t) => t.trim()).filter(Boolean),
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
      setError('저장에 실패했어요. 잠시 후 다시 시도해 주세요.');
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Icon name="close" size={24} color={LoopColors.ink2} />
        </Pressable>
        <LoopText variant="heading2" style={{ marginLeft: 8 }}>
          {isEdit ? '피드백 수정' : '직접 작성'}
        </LoopText>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <FieldLabel>제목</FieldLabel>
          <TextInput value={title} onChangeText={setTitle} placeholder="한 줄로 요약하면?" placeholderTextColor={LoopColors.ink4} style={input} />

          <FieldLabel>하위 목표</FieldLabel>
          {subGoals.length === 0 ? (
            <LoopText variant="caption" color="ink4">
              설정에서 하위 목표를 먼저 추가해 주세요.
            </LoopText>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {subGoals.map((s) => {
                const on = s.id === subGoalId;
                return (
                  <Pressable key={s.id} onPress={() => setSubGoalId(s.id)}>
                    <View style={[selChip, on && { backgroundColor: LoopColors.warm, borderColor: LoopColors.warm }]}>
                      <LoopText variant="label" color={on ? 'white' : 'ink2'}>
                        {s.name}
                      </LoopText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <FieldLabel>중요도</FieldLabel>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {IMPORTANCE_VALUES.map((lv) => {
              const on = lv === importance;
              return (
                <Pressable key={lv} onPress={() => setImportance(lv)} style={{ flex: 1 }}>
                  <View
                    style={[
                      selChip,
                      { flexDirection: 'row', justifyContent: 'center', gap: 7 },
                      on && { backgroundColor: LoopColors.warmSoft, borderColor: LoopColors.warmLine },
                    ]}
                  >
                    <ImportanceDots level={lv} />
                    <LoopText variant="label" color={on ? 'warmDeep' : 'ink3'}>
                      {IMPORTANCE_LABEL[lv]}
                    </LoopText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <FieldLabel>상황</FieldLabel>
          <TextInput
            value={situation}
            onChangeText={setSituation}
            placeholder="무슨 일이 있었나요?"
            placeholderTextColor={LoopColors.ink4}
            multiline
            style={[input, multiline]}
          />

          <FieldLabel>근본 원인</FieldLabel>
          <TextInput
            value={rootCause}
            onChangeText={setRootCause}
            placeholder="왜 그렇게 됐을까요?"
            placeholderTextColor={LoopColors.ink4}
            multiline
            style={[input, multiline]}
          />

          <FieldLabel>실천항목</FieldLabel>
          {takeaways.map((t, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <TextInput
                value={t}
                onChangeText={(v) => setTakeaways((cur) => cur.map((x, j) => (j === i ? v : x)))}
                placeholder={`다음엔 이렇게 (${i + 1})`}
                placeholderTextColor={LoopColors.ink4}
                style={[input, { flex: 1, marginBottom: 0 }]}
              />
              {takeaways.length > 1 && (
                <Pressable onPress={() => setTakeaways((cur) => cur.filter((_, j) => j !== i))} hitSlop={8} style={{ padding: 6 }}>
                  <Icon name="close" size={18} color={LoopColors.ink4} />
                </Pressable>
              )}
            </View>
          ))}
          <Pressable onPress={() => setTakeaways((cur) => [...cur, ''])} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 }}>
            <Icon name="plus" size={18} color={LoopColors.warmDeep} />
            <LoopText variant="label" color="warmDeep">
              실천항목 추가
            </LoopText>
          </Pressable>

          <FieldLabel>태그</FieldLabel>
          <TextInput
            value={tagsText}
            onChangeText={setTagsText}
            placeholder="쉼표로 구분 (예: 회의, 발언)"
            placeholderTextColor={LoopColors.ink4}
            autoCapitalize="none"
            style={input}
          />

          {error && (
            <LoopText variant="caption" color="warmDeep" style={{ marginTop: 6 }}>
              {error}
            </LoopText>
          )}

          <Button label={isEdit ? '수정 저장' : '피드백 저장'} onPress={save} loading={busy} style={{ marginTop: 22 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <LoopText variant="eyebrow" color="ink4" style={{ marginTop: 22, marginBottom: 9 }}>
      {children}
    </LoopText>
  );
}

const input = {
  backgroundColor: LoopColors.surface,
  borderWidth: 1,
  borderColor: LoopColors.line,
  borderRadius: LoopRadius.xl,
  paddingHorizontal: 16,
  paddingVertical: 13,
  fontSize: 15,
  color: LoopColors.ink,
  marginBottom: 0,
} as const;

const multiline = { minHeight: 92, textAlignVertical: 'top' as const };

const selChip = {
  paddingHorizontal: 14,
  height: 40,
  borderRadius: LoopRadius.full,
  borderWidth: 1,
  borderColor: LoopColors.line,
  backgroundColor: LoopColors.surface,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
