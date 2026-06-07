import { Pressable, View } from 'react-native';

import { Icon, LoopText } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
import { relativeTime } from '@/lib/date';
import { useI18n, useT } from '@/lib/i18n';
import type { FeedbackWithTakeaways, Importance } from '@/types/models';

/** 내재화 배지 — 닫힌 고리. */
export function InternalizedBadge() {
  const t = useT();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        height: 24,
        paddingLeft: 7,
        paddingRight: 9,
        borderRadius: 9999,
        backgroundColor: LoopColors.goodSoft,
      }}
    >
      <Icon name="check-sm" size={13} color={LoopColors.good} />
      <LoopText variant="small" color="good">
        {t('badge.internalized')}
      </LoopText>
    </View>
  );
}

/** Takeaway 실행 진척 — 막대 + n/m. */
export function TakeawayProgress({ done, total }: { done: number; total: number }) {
  const t = useT();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 3 }}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 14,
              height: 4,
              borderRadius: 9999,
              backgroundColor: i < done ? LoopColors.warm : LoopColors.line,
            }}
          />
        ))}
      </View>
      <LoopText variant="small" color="ink3" style={{ fontWeight: '600' }}>
        {t('home.takeawayDone', { done, total })}
      </LoopText>
    </View>
  );
}

const IMP_BAR: Record<Importance, string> = {
  high: LoopColors.warm,
  mid: LoopColors.ink4,
  low: LoopColors.line,
};

/**
 * 피드백 행 — demo home B(Quiet list) 이식.
 * 좌측 importance 색막대 + 카테고리·날짜 + 제목 + (열린 고리면) 실천 진척. hairline 구분.
 */
export function FeedbackRow({
  feedback,
  subGoalName,
  first,
  onPress,
}: {
  feedback: FeedbackWithTakeaways;
  subGoalName: string;
  first?: boolean;
  onPress: () => void;
}) {
  const { lang } = useI18n();
  const total = feedback.takeaways.length;
  const done = feedback.takeaways.filter((tk) => tk.done).length;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
      <View
        style={{
          flexDirection: 'row',
          gap: 13,
          paddingVertical: 15,
          borderTopWidth: first ? 1 : 0,
          borderTopColor: LoopColors.lineSoft,
          borderBottomWidth: 1,
          borderBottomColor: LoopColors.lineSoft,
        }}
      >
        <View style={{ width: 3, borderRadius: 9999, backgroundColor: IMP_BAR[feedback.importance], alignSelf: 'stretch' }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <LoopText variant="small" color="warmDeep" style={{ fontSize: 11, letterSpacing: 0.1 }} numberOfLines={1}>
              {subGoalName}
            </LoopText>
            <View style={{ width: 3, height: 3, borderRadius: 9999, backgroundColor: LoopColors.ink4 }} />
            <LoopText variant="caption" color="ink4" style={{ fontSize: 11 }}>
              {relativeTime(feedback.createdAt, lang)}
            </LoopText>
            {feedback.internalized && (
              <View style={{ marginLeft: 'auto' }}>
                <Icon name="check-sm" size={14} color={LoopColors.good} />
              </View>
            )}
          </View>
          <LoopText variant="cardTitle" style={{ fontSize: 14.5 }} numberOfLines={2}>
            {feedback.title}
          </LoopText>
          {!feedback.internalized && total > 0 && (
            <View style={{ marginTop: 8 }}>
              <TakeawayProgress done={done} total={total} />
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
