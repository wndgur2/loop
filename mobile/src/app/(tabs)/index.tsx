import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { LoopMark } from '@/components/loop-mark';
import { ComposerEntry, Icon, LoopText, Ring, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { computeStats } from '@/features/dashboard/stats';
import { FeedbackCard } from '@/features/feedback/components';
import { useFeedbacks } from '@/features/feedback/queries';
import { useActiveGoal, useSubGoals } from '@/features/goals/queries';

export default function FeedbackHomeScreen() {
  const router = useRouter();
  const { data: feedbacks = [], isLoading } = useFeedbacks();
  const { data: subGoals = [] } = useSubGoals();
  const { data: goal } = useActiveGoal();

  const subGoalName = useMemo(() => {
    const map = new Map(subGoals.map((s) => [s.id, s.name]));
    return (id: string) => map.get(id) ?? '하위 목표';
  }, [subGoals]);

  const stats = useMemo(() => computeStats(feedbacks), [feedbacks]);

  return (
    <Screen edges={['top']}>
      <FlatList
        data={feedbacks}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <LoopMark height={21} />
              <Pressable
                onPress={() => router.push('/feedback/new')}
                style={{
                  marginLeft: 'auto',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 12,
                  height: 34,
                  borderRadius: LoopRadius.full,
                  borderWidth: 1,
                  borderColor: LoopColors.line,
                  backgroundColor: LoopColors.surface,
                }}
              >
                <Icon name="plus" size={16} color={LoopColors.warmDeep} />
                <LoopText variant="label" color="warmDeep">
                  직접 작성
                </LoopText>
              </Pressable>
            </View>

            <Hero
              rate={stats.internalizationRate}
              internalized={stats.internalized}
              total={stats.total}
              goalTitle={goal?.title ?? null}
            />

            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 26, marginBottom: 14 }}>
              <LoopText variant="heading2">내 피드백</LoopText>
              <LoopText variant="label" color="ink4" style={{ marginLeft: 8 }}>
                {stats.total}
              </LoopText>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <FeedbackCard
              feedback={item}
              subGoalName={subGoalName(item.subGoalId)}
              onPress={() => router.push(`/feedback/${item.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
      />

      <ComposerEntry placeholder="오늘 마음에 남은 순간이 있나요?" onPress={() => router.push('/chat/write')} />
      <View style={{ height: 6 }} />
    </Screen>
  );
}

function Hero({
  rate,
  internalized,
  total,
  goalTitle,
}: {
  rate: number;
  internalized: number;
  total: number;
  goalTitle: string | null;
}) {
  const pct = Math.round(rate * 100);
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 18,
        alignItems: 'center',
        backgroundColor: LoopColors.surface,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: LoopColors.lineSoft,
        padding: 20,
      }}
    >
      <Ring value={rate} size={96} stroke={9}>
        <LoopText style={{ fontSize: 25, fontWeight: '700', letterSpacing: -0.5 }}>
          {pct}
          <LoopText style={{ fontSize: 14, fontWeight: '700', color: LoopColors.ink4 }}>%</LoopText>
        </LoopText>
      </Ring>
      <View style={{ flex: 1 }}>
        <LoopText variant="eyebrow" color="ink4" style={{ marginBottom: 7 }}>
          내재화
        </LoopText>
        <LoopText variant="body" color="ink2" style={{ marginBottom: 10 }}>
          {total === 0 ? '아직 닫은 고리가 없어요.\n첫 피드백을 남겨보세요.' : `${total}개 중 ${internalized}개의 고리를 닫았어요.`}
        </LoopText>
        {goalTitle && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="target" size={15} color={LoopColors.warmDeep} />
            <LoopText variant="caption" color="warmDeep" style={{ fontWeight: '600' }} numberOfLines={1}>
              목표: {goalTitle}
            </LoopText>
          </View>
        )}
      </View>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 }}>
      <Icon name="sparkle" size={28} color={LoopColors.warm} />
      <LoopText variant="cardTitle" style={{ marginTop: 12, textAlign: 'center' }}>
        첫 되돌아보기를 시작해 보세요
      </LoopText>
      <LoopText variant="bodyTight" color="ink3" style={{ marginTop: 6, textAlign: 'center' }}>
        아래에 오늘 있었던 일을 적으면 Loopi가 근본 원인과 실천항목을 함께 정리해 드려요.
      </LoopText>
    </View>
  );
}
