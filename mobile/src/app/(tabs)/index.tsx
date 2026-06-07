import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { ComposerEntry, Icon, LoopText, Screen } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { computeStats } from '@/features/dashboard/stats';
import { FeedbackRow } from '@/features/feedback/components';
import { useFeedbacks } from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { useT } from '@/lib/i18n';

/** 피드백 홈 — demo home B(Quiet list): 큰 타이틀 + 슬림 내재화 바 + dense 행 목록. */
export default function FeedbackHomeScreen() {
  const router = useRouter();
  const t = useT();
  const { data: feedbacks = [], isLoading } = useFeedbacks();
  const { data: subGoals = [] } = useSubGoals();

  const subGoalName = useMemo(() => {
    const map = new Map(subGoals.map((s) => [s.id, s.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [subGoals]);

  const stats = useMemo(() => computeStats(feedbacks), [feedbacks]);
  const pct = Math.round(stats.internalizationRate * 100);

  return (
    <Screen edges={['top']}>
      <FlatList
        data={feedbacks}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ paddingBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
              <LoopText variant="title">{t('tab.feedback')}</LoopText>
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
                  {t('home.directWrite')}
                </LoopText>
              </Pressable>
            </View>

            {/* 슬림 내재화 바 */}
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
                <LoopText variant="eyebrow" color="ink4">
                  {t('home.internalizedOf', { done: stats.internalized, total: stats.total })}
                </LoopText>
                <LoopText variant="label" color="warmDeep" style={{ fontSize: 12 }}>
                  {pct}%
                </LoopText>
              </View>
              <View style={{ height: 7, borderRadius: 9999, backgroundColor: LoopColors.ringTrack, overflow: 'hidden' }}>
                <View style={{ width: `${pct}%`, height: '100%', borderRadius: 9999, backgroundColor: LoopColors.warm }} />
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <FeedbackRow
            feedback={item}
            subGoalName={subGoalName(item.subGoalId)}
            first={index === 0}
            onPress={() => router.push(`/feedback/${item.id}`)}
          />
        )}
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
      />

      <ComposerEntry placeholder={t('home.composer')} onPress={() => router.push('/chat/write')} />
      <View style={{ height: 6 }} />
    </Screen>
  );
}

function EmptyState() {
  const t = useT();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 14 }}>
      <Icon name="sparkle" size={28} color={LoopColors.warm} />
      <LoopText variant="cardTitle" style={{ marginTop: 12, textAlign: 'center' }}>
        {t('home.empty.title')}
      </LoopText>
      <LoopText variant="bodyTight" color="ink3" style={{ marginTop: 6, textAlign: 'center' }}>
        {t('home.empty.body')}
      </LoopText>
    </View>
  );
}
