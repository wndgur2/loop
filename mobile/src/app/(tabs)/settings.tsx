import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Button, Card, Icon, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  useActiveGoal,
  useAddSubGoal,
  useDeleteSubGoal,
  useSubGoals,
  useUpdateGoal,
} from '@/features/goals/queries';

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const { data: goal } = useActiveGoal();
  const { data: subGoals = [] } = useSubGoals();
  const updateGoal = useUpdateGoal();
  const addSubGoal = useAddSubGoal();
  const deleteSubGoal = useDeleteSubGoal();

  const [goalTitle, setGoalTitle] = useState('');
  const [newSub, setNewSub] = useState('');

  // 서버 목표가 도착/변경되면 편집 필드를 그 값으로 초기화(렌더 중 동기화 — effect 불필요).
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

  function removeSub(id: string, name: string) {
    Alert.alert('하위 목표 삭제', `"${name}"을(를) 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSubGoal.mutateAsync(id);
          } catch {
            Alert.alert('삭제할 수 없어요', '이 하위 목표에 연결된 피드백이 있어요. 먼저 피드백의 하위 목표를 옮겨 주세요.');
          }
        },
      },
    ]);
  }

  function confirmSignOut() {
    Alert.alert('로그아웃', '로그아웃할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => signOut() },
    ]);
  }

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <LoopText variant="title" style={{ marginBottom: 18 }}>
          설정
        </LoopText>

        <SectionTitle>계정</SectionTitle>
        <Card radius={20} style={{ padding: 16, gap: 4 }}>
          {!!displayName && (
            <LoopText variant="cardTitle">{displayName}</LoopText>
          )}
          <LoopText variant="bodyTight" color="ink3">
            {email}
          </LoopText>
        </Card>

        <SectionTitle>최종 목표</SectionTitle>
        <Card radius={20} style={{ padding: 16 }}>
          <TextInput
            value={goalTitle}
            onChangeText={setGoalTitle}
            placeholder="최종 목표"
            placeholderTextColor={LoopColors.ink4}
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: LoopColors.ink,
              borderBottomWidth: 1,
              borderBottomColor: LoopColors.lineSoft,
              paddingVertical: 8,
            }}
          />
          {goalChanged && (
            <Button label="목표 저장" height={42} loading={updateGoal.isPending} onPress={saveGoal} style={{ marginTop: 14 }} />
          )}
        </Card>

        <SectionTitle>하위 목표</SectionTitle>
        <Card radius={20} style={{ padding: 8 }}>
          {subGoals.map((s, i) => (
            <View
              key={s.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: LoopColors.lineSoft,
              }}
            >
              <Icon name="target" size={17} color={LoopColors.warmDeep} />
              <LoopText variant="body" color="ink2" style={{ flex: 1, marginLeft: 10 }}>
                {s.name}
              </LoopText>
              <Pressable onPress={() => removeSub(s.id, s.name)} hitSlop={8} style={{ padding: 4 }}>
                <Icon name="trash" size={18} color={LoopColors.ink4} />
              </Pressable>
            </View>
          ))}

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', padding: 8 }}>
            <TextInput
              value={newSub}
              onChangeText={setNewSub}
              placeholder="하위 목표 추가"
              placeholderTextColor={LoopColors.ink4}
              onSubmitEditing={addSub}
              style={{
                flex: 1,
                backgroundColor: LoopColors.canvas,
                borderRadius: LoopRadius.lg,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 14,
                color: LoopColors.ink,
              }}
            />
            <Pressable
              onPress={addSub}
              style={{
                width: 40,
                height: 40,
                borderRadius: LoopRadius.lg,
                backgroundColor: LoopColors.warmSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="plus" size={20} color={LoopColors.warmDeep} />
            </Pressable>
          </View>
        </Card>

        <Button label="로그아웃" variant="secondary" onPress={confirmSignOut} style={{ marginTop: 28 }} />

        <LoopText variant="caption" color="ink4" style={{ textAlign: 'center', marginTop: 20 }}>
          Loop · 피드백을 목표 달성으로, with Loopi
        </LoopText>
      </ScrollView>
    </Screen>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <LoopText variant="eyebrow" color="ink4" style={{ marginTop: 24, marginBottom: 11 }}>
      {children}
    </LoopText>
  );
}
