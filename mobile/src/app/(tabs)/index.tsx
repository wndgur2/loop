import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { FlatList, type ListRenderItem, StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import {
  EmptyState,
  FeedbackListSkeleton,
  Icon,
  LoopText,
  PressScale,
  ProgressBar,
  Screen,
  TabHeader,
} from '@/components/ui';
import { LoopColors, LoopRadius } from '@/constants/loop-theme';
import { computeStats } from '@/features/dashboard/stats';
import { TabComposer } from '@/features/chat/tab-composer';
import { FeedbackRow } from '@/features/feedback/components';
import { useFeedbacks } from '@/features/feedback/queries';
import { useSubGoalName } from '@/features/goals/use-sub-goal-name';
import { useT } from '@/lib/i18n';
import type { FeedbackWithTakeaways } from '@/types/models';

/** Feedback home — shared layout (header + body) + bottom write chat input. List uses demo B (Quiet list). */
export default function FeedbackHomeScreen() {
  const router = useRouter();
  const t = useT();
  const { data: feedbacks = [], isLoading } = useFeedbacks();
  const subGoalName = useSubGoalName();

  const stats = useMemo(() => computeStats(feedbacks), [feedbacks]);
  const pct = Math.round(stats.internalizationRate * 100);

  const handlePress = useCallback((id: string) => router.push(`/feedback/${id}`), [router]);
  const keyExtractor = useCallback((f: FeedbackWithTakeaways) => f.id, []);
  const renderItem = useCallback<ListRenderItem<FeedbackWithTakeaways>>(
    ({ item, index }) => (
      <FeedbackRow
        feedback={item}
        subGoalName={subGoalName(item.subGoalId)}
        first={index === 0}
        onPress={handlePress}
      />
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
        <ProgressBar value={stats.internalizationRate} height={7} />
      </View>
    ),
    [t, stats.internalized, stats.total, stats.internalizationRate, pct],
  );

  return (
    <Screen edges={['top']}>
      <TabHeader
        title={t('tab.feedback')}
        action={
          <WriteButton onPress={() => router.push('/feedback/new')} label={t('home.directWrite')} />
        }
      />

      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={8}>
        <FlatList
          data={feedbacks}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={isLoading ? null : listHeader}
          ListEmptyComponent={
            isLoading ? (
              <FeedbackListSkeleton />
            ) : (
              <EmptyState plain title={t('home.empty.title')} body={t('home.empty.body')} />
            )
          }
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
    <PressScale onPress={onPress} style={styles.writeBtn}>
      <Icon name="plus" size={16} color={LoopColors.warmDeep} />
      <LoopText variant="label" color="warmDeep">
        {label}
      </LoopText>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingHorizontal: 22, paddingBottom: 12 },
  barWrap: { paddingBottom: 6 },
  barTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  pct: { fontSize: 12 },
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
});
