import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

import { Button, Checkbox, Chip, Icon, IconButton, ImportanceDots, LoopText, Screen } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
import { fullDateKo, relativeKo } from '@/lib/date';
import {
  useDeleteFeedback,
  useFeedback,
  useSetInternalized,
  useToggleTakeaway,
} from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { IMPORTANCE_LABEL } from '@/types/models';

export default function FeedbackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: feedback, isLoading } = useFeedback(id);
  const { data: subGoals = [] } = useSubGoals();
  const toggleTakeaway = useToggleTakeaway();
  const setInternalized = useSetInternalized();
  const deleteFeedback = useDeleteFeedback();

  const subGoalName = useMemo(
    () => subGoals.find((s) => s.id === feedback?.subGoalId)?.name ?? '하위 목표',
    [subGoals, feedback?.subGoalId],
  );

  if (!feedback) {
    return (
      <Screen edges={['top', 'bottom']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <LoopText color="ink3">{isLoading ? '불러오는 중…' : '피드백을 찾을 수 없어요.'}</LoopText>
        </View>
      </Screen>
    );
  }

  const total = feedback.takeaways.length;
  const done = feedback.takeaways.filter((t) => t.done).length;
  const internalized = feedback.internalized;

  function confirmDelete() {
    Alert.alert('피드백 삭제', '이 피드백과 실천항목을 삭제할까요? 되돌릴 수 없어요.', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteFeedback.mutateAsync(feedback!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen edges={['top', 'bottom']}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 2, paddingBottom: 10 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={{ padding: 4 }}>
          <Icon name="chevron-left" size={24} color={LoopColors.ink2} />
        </Pressable>
        <View style={{ marginLeft: 'auto', flexDirection: 'row', gap: 4 }}>
          <Pressable onPress={() => router.push(`/feedback/new?id=${feedback.id}`)} hitSlop={8} style={{ padding: 6 }}>
            <Icon name="edit" size={21} color={LoopColors.ink3} />
          </Pressable>
          <Pressable onPress={confirmDelete} hitSlop={8} style={{ padding: 6 }}>
            <Icon name="trash" size={21} color={LoopColors.ink3} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {internalized ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: LoopColors.goodSoft,
              borderRadius: 16,
              padding: 14,
              marginBottom: 18,
            }}
          >
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 9999,
                backgroundColor: LoopColors.good,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="check" size={19} color={LoopColors.white} />
            </View>
            <View>
              <LoopText variant="label" color="good">
                고리를 닫았어요
              </LoopText>
              <LoopText variant="caption" color="ink3" style={{ marginTop: 2 }}>
                내재화 완료로 표시됨
              </LoopText>
            </View>
          </View>
        ) : (
          <StatusPill />
        )}

        <LoopText variant="heading" style={{ lineHeight: 31, marginBottom: 6 }}>
          {feedback.title}
        </LoopText>

        <MetaRow label="하위 목표">
          <Chip label={subGoalName} tone="warm" icon={<Icon name="target" size={13} color={LoopColors.warmDeep} />} />
        </MetaRow>
        <MetaRow label="중요도">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <ImportanceDots level={feedback.importance} />
            <LoopText variant="label" color="ink2">
              {IMPORTANCE_LABEL[feedback.importance]}
            </LoopText>
          </View>
        </MetaRow>
        <MetaRow label={internalized ? '내재화' : '작성'}>
          <LoopText variant="label" color={internalized ? 'good' : 'ink2'}>
            {internalized && feedback.internalizedAt
              ? `${fullDateKo(feedback.internalizedAt)}`
              : `${fullDateKo(feedback.createdAt)} · ${relativeKo(feedback.createdAt)}`}
          </LoopText>
        </MetaRow>

        <SectionLabel>상황 (FEEDBACK)</SectionLabel>
        <LoopText variant="body" color="ink2">
          {feedback.situation}
        </LoopText>

        <SectionLabel>근본 원인 (ROOT CAUSE)</SectionLabel>
        <LoopText variant="body" color="ink2">
          {feedback.rootCause}
        </LoopText>

        {total > 0 && (
          <>
            <SectionLabel>{`실천항목 · ${done}/${total}`}</SectionLabel>
            <View style={{ borderTopWidth: 1, borderTopColor: LoopColors.lineSoft }}>
              {feedback.takeaways.map((t) => (
                <View
                  key={t.id}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'flex-start',
                    paddingVertical: 13,
                    borderBottomWidth: 1,
                    borderBottomColor: LoopColors.lineSoft,
                  }}
                >
                  <Checkbox
                    done={t.done}
                    onPress={() =>
                      toggleTakeaway.mutate({ feedbackId: feedback.id, takeawayId: t.id, done: !t.done })
                    }
                  />
                  <LoopText
                    variant="bodyTight"
                    color={t.done ? 'ink4' : 'ink'}
                    style={{ flex: 1, textDecorationLine: t.done ? 'line-through' : 'none' }}
                  >
                    {t.text}
                  </LoopText>
                </View>
              ))}
            </View>
          </>
        )}

        {feedback.tags.length > 0 && (
          <>
            <SectionLabel>태그</SectionLabel>
            <View style={{ flexDirection: 'row', gap: 7, flexWrap: 'wrap' }}>
              {feedback.tags.map((tag) => (
                <Chip key={tag} label={tag} icon={<Icon name="tag" size={12} color={LoopColors.ink3} />} />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* footer actions */}
      <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 22, paddingTop: 10 }}>
        {internalized ? (
          <Button
            label="다시 열기"
            variant="secondary"
            icon="undo"
            style={{ flex: 1 }}
            onPress={() => setInternalized.mutate({ feedbackId: feedback.id, internalized: false })}
          />
        ) : (
          <IconButton icon="check" color={LoopColors.good} onPress={() => setInternalized.mutate({ feedbackId: feedback.id, internalized: true })} />
        )}
        <Button label="회고하기" icon="loop" style={{ flex: 1 }} onPress={() => router.push('/chat/reflect')} />
      </View>
    </Screen>
  );
}

function StatusPill() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        alignSelf: 'flex-start',
        height: 26,
        paddingLeft: 10,
        paddingRight: 12,
        borderRadius: 9999,
        backgroundColor: LoopColors.warmSoft,
        marginBottom: 14,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: LoopColors.warm }} />
      <LoopText variant="small" color="warmDeep" style={{ letterSpacing: 0.3 }}>
        열린 고리
      </LoopText>
    </View>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 11,
        borderBottomWidth: 1,
        borderBottomColor: LoopColors.lineSoft,
      }}
    >
      <LoopText variant="caption" color="ink4" style={{ width: 76 }}>
        {label}
      </LoopText>
      {children}
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <LoopText variant="eyebrow" color="ink4" style={{ marginTop: 24, marginBottom: 9 }}>
      {children}
    </LoopText>
  );
}
