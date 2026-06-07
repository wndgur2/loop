import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, type ListRenderItem, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Icon, LoopText, Screen, TabHeader } from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { computeStats } from '@/features/dashboard/stats';
import { TabComposer } from '@/features/chat/tab-composer';
import { FeedbackRow } from '@/features/feedback/components';
import { useFeedbacks } from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { useT } from '@/lib/i18n';
import type { FeedbackWithTakeaways } from '@/types/models';

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

  const handlePress = useCallback((id: string) => router.push(`/feedback/${id}`), [router]);
  const keyExtractor = useCallback((f: FeedbackWithTakeaways) => f.id, []);
  const renderItem = useCallback<ListRenderItem<FeedbackWithTakeaways>>(
    ({ item, index }) => (
      <FeedbackRow feedback={item} subGoalName={subGoalName(item.subGoalId)} first={index === 0} onPress={handlePress} />
    ),
    [handlePress, subGoalName],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.barWrap}>
        <View style={styles.barTop}>
          <LoopText variant="eyebrow" color="ink4">
            {t('home.internalizedOf', { done: stats.internalized, total: stats.total })}
          </LoopText>
          <LoopText variant="label" color="warmDeep" style={styles.pct}>
            {pct}%
          </LoopText>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>
    ),
    [t, stats.internalized, stats.total, pct],
  );

  return (
    <Screen edges={['top']}>
      <TabHeader title={t('tab.feedback')} action={<WriteButton onPress={() => router.push('/feedback/new')} label={t('home.directWrite')} />} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={8}>
        <FlatList
          data={feedbacks}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={!isLoading ? <EmptyState /> : null}
          removeClippedSubviews
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={10}
        />

        <TabComposer mode="write" placeholder={t('home.composer')} />
        <View style={styles.bottomSpacer} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

function WriteButton({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} style={styles.writeBtn}>
      <Icon name="plus" size={16} color={LoopColors.warmDeep} />
      <LoopText variant="label" color="warmDeep">
        {label}
      </LoopText>
    </Pressable>
  );
}

function EmptyState() {
  const t = useT();
  return (
    <View style={styles.empty}>
      <Icon name="sparkle" size={28} color={LoopColors.warm} />
      <LoopText variant="cardTitle" style={styles.emptyTitle}>
        {t('home.empty.title')}
      </LoopText>
      <LoopText variant="bodyTight" color="ink3" style={styles.emptyBody}>
        {t('home.empty.body')}
      </LoopText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingHorizontal: 22, paddingBottom: 12 },
  barWrap: { paddingBottom: 6 },
  barTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  pct: { fontSize: 12 },
  track: { height: 7, borderRadius: 9999, backgroundColor: LoopColors.ringTrack, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 9999, backgroundColor: LoopColors.warm },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: LoopRadius.full,
    borderWidth: 1,
    borderColor: LoopColors.line,
    backgroundColor: LoopColors.surface,
  },
  bottomSpacer: { height: 6 },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 14 },
  emptyTitle: { marginTop: 12, textAlign: 'center' },
  emptyBody: { marginTop: 6, textAlign: 'center' },
});
