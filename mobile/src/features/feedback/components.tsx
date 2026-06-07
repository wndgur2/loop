import { Pressable, View } from 'react-native';

import { Card, Chip, Icon, ImportanceDots, LoopText } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
import { relativeKo } from '@/lib/date';
import type { FeedbackWithTakeaways } from '@/types/models';

/** 내재화 배지 — 닫힌 고리. */
export function InternalizedBadge() {
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
        내재화됨
      </LoopText>
    </View>
  );
}

/** Takeaway 실행 진척 — 막대 + n/m. */
export function TakeawayProgress({ done, total }: { done: number; total: number }) {
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
        {done}/{total} 실행
      </LoopText>
    </View>
  );
}

/** 피드백 카드 — demo home A(Calm cards) 이식. */
export function FeedbackCard({
  feedback,
  subGoalName,
  onPress,
}: {
  feedback: FeedbackWithTakeaways;
  subGoalName: string;
  onPress: () => void;
}) {
  const total = feedback.takeaways.length;
  const done = feedback.takeaways.filter((t) => t.done).length;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.95 : 1 })}>
      <Card radius={18} style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 9 }}>
          <Chip label={subGoalName} tone="warm" />
          <ImportanceDots level={feedback.importance} />
          <LoopText variant="caption" color="ink4" style={{ marginLeft: 'auto' }}>
            {relativeKo(feedback.createdAt)}
          </LoopText>
        </View>

        <LoopText variant="cardTitle" numberOfLines={2} style={{ marginBottom: 5 }}>
          {feedback.title}
        </LoopText>
        <LoopText variant="bodyTight" color="ink3" numberOfLines={1} style={{ marginBottom: 12 }}>
          {feedback.situation}
        </LoopText>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: LoopColors.lineSoft,
            paddingTop: 11,
          }}
        >
          {feedback.internalized ? <InternalizedBadge /> : <TakeawayProgress done={done} total={total} />}
          <View style={{ marginLeft: 'auto' }}>
            <Icon name="chevron-right" size={17} color={LoopColors.ink4} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
