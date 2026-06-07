import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';

import { Icon, LoopText, Screen, TabHeader } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { computeStats } from '@/features/dashboard/stats';
import { TabComposer } from '@/features/chat/tab-composer';
import { FeedbackRow } from '@/features/feedback/components';
import { useFeedbacks } from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { useT } from '@/lib/i18n';

/** 피드백 홈 — 공통 레이아웃(헤더+본문) + 하단 작성 채팅 input. 목록은 demo B(Quiet list). */
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
      <TabHeader
        title={t('tab.feedback')}
        action={
          <Pressable
            onPress={() => router.push('/feedback/new')}
            style={{
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
        }
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <FlatList
          data={feedbacks}
          keyExtractor={(f) => f.id}
          contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{ paddingBottom: 6 }}>
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

        <TabComposer mode="write" placeholder={t('home.composer')} />
        <View style={{ height: 6 }} />
      </KeyboardAvoidingView>
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
