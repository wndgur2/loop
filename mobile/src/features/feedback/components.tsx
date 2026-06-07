import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, LoopText } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
import { relativeTime } from '@/lib/date';
import { useI18n, useT } from '@/lib/i18n';
import type { FeedbackWithTakeaways, Importance } from '@/types/models';

/** 내재화 배지 — 닫힌 고리. */
export const InternalizedBadge = memo(function InternalizedBadge() {
  const t = useT();
  return (
    <View style={styles.badge}>
      <Icon name="check-sm" size={13} color={LoopColors.good} />
      <LoopText variant="small" color="good">
        {t('badge.internalized')}
      </LoopText>
    </View>
  );
});

/** Takeaway 실행 진척 — 막대 + n/m. */
export const TakeawayProgress = memo(function TakeawayProgress({ done, total }: { done: number; total: number }) {
  const t = useT();
  return (
    <View style={styles.progressRow}>
      <View style={styles.bars}>
        {Array.from({ length: total }).map((_, i) => (
          <View key={i} style={[styles.bar, { backgroundColor: i < done ? LoopColors.warm : LoopColors.line }]} />
        ))}
      </View>
      <LoopText variant="small" color="ink3" style={styles.progressLabel}>
        {t('home.takeawayDone', { done, total })}
      </LoopText>
    </View>
  );
});

const IMP_BAR: Record<Importance, string> = {
  high: LoopColors.warm,
  mid: LoopColors.ink4,
  low: LoopColors.line,
};

type FeedbackRowProps = {
  feedback: FeedbackWithTakeaways;
  subGoalName: string;
  first?: boolean;
  /** 안정적인 핸들러(useCallback). 행은 feedback.id로 호출한다 → memo 효과 유지. */
  onPress: (id: string) => void;
};

/**
 * 피드백 행 — demo home B(Quiet list) 이식.
 * 좌측 importance 색막대 + 카테고리·날짜 + 제목 + (열린 고리면) 실천 진척. hairline 구분.
 */
export const FeedbackRow = memo(function FeedbackRow({ feedback, subGoalName, first, onPress }: FeedbackRowProps) {
  const { lang } = useI18n();
  const total = feedback.takeaways.length;
  const done = feedback.takeaways.filter((tk) => tk.done).length;

  return (
    <Pressable onPress={() => onPress(feedback.id)} style={pressedStyle}>
      <View style={[styles.row, first && styles.rowFirst]}>
        <View style={[styles.impBar, { backgroundColor: IMP_BAR[feedback.importance] }]} />
        <View style={styles.content}>
          <View style={styles.meta}>
            <LoopText variant="small" color="warmDeep" style={styles.category} numberOfLines={1}>
              {subGoalName}
            </LoopText>
            <View style={styles.metaDot} />
            <LoopText variant="caption" color="ink4" style={styles.date}>
              {relativeTime(feedback.createdAt, lang)}
            </LoopText>
            {feedback.internalized && (
              <View style={styles.check}>
                <Icon name="check-sm" size={14} color={LoopColors.good} />
              </View>
            )}
          </View>
          <LoopText variant="cardTitle" style={styles.title} numberOfLines={2}>
            {feedback.title}
          </LoopText>
          {!feedback.internalized && total > 0 && (
            <View style={styles.progressWrap}>
              <TakeawayProgress done={done} total={total} />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

const pressedStyle = ({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? 0.6 : 1 });

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
    paddingLeft: 7,
    paddingRight: 9,
    borderRadius: 9999,
    backgroundColor: LoopColors.goodSoft,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bars: { flexDirection: 'row', gap: 3 },
  bar: { width: 14, height: 4, borderRadius: 9999 },
  progressLabel: { fontWeight: '600' },
  row: {
    flexDirection: 'row',
    gap: 13,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: LoopColors.lineSoft,
  },
  rowFirst: { borderTopWidth: 1, borderTopColor: LoopColors.lineSoft },
  impBar: { width: 3, borderRadius: 9999, alignSelf: 'stretch' },
  content: { flex: 1, minWidth: 0 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5 },
  category: { fontSize: 11, letterSpacing: 0.1 },
  metaDot: { width: 3, height: 3, borderRadius: 9999, backgroundColor: LoopColors.ink4 },
  date: { fontSize: 11 },
  check: { marginLeft: 'auto' },
  title: { fontSize: 14.5 },
  progressWrap: { marginTop: 8 },
});
