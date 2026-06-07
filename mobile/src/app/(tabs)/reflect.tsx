import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button, Card, ComposerEntry, Icon, type IconName, LoopText, Ring, Screen } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
import { useFeedbacks } from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { buildRetroCards, type RetroCard } from '@/features/reflect/recommendations';
import { IMPORTANCE_LABEL } from '@/types/models';

export default function ReflectScreen() {
  const router = useRouter();
  const { data: feedbacks = [], isLoading } = useFeedbacks();
  const { data: subGoals = [] } = useSubGoals();

  const subGoalName = useMemo(() => {
    const map = new Map(subGoals.map((s) => [s.id, s.name]));
    return (id: string) => map.get(id) ?? '하위 목표';
  }, [subGoals]);

  const cards = useMemo(() => buildRetroCards(feedbacks), [feedbacks]);
  const startReflect = () => router.push('/chat/reflect');

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <LoopText variant="title">회고</LoopText>
            <Icon name="loop" size={21} color={LoopColors.warm} />
          </View>
          <LoopText variant="bodyTight" color="ink3" style={{ marginTop: 6 }}>
            되새길 만한 고리를 골라 떠먹여 드려요.
          </LoopText>
        </View>

        <View style={{ paddingHorizontal: 22, gap: 14 }}>
          {cards.map((card, i) => (
            <RetroCardView key={i} card={card} subGoalName={subGoalName} onPress={startReflect} />
          ))}
          {cards.length === 0 && !isLoading && <EmptyReflect />}
        </View>
      </ScrollView>

      <ComposerEntry placeholder="되새기고 싶은 것을 말해 주세요…" onPress={startReflect} />
      <View style={{ height: 6 }} />
    </Screen>
  );
}

function RetroCardView({
  card,
  subGoalName,
  onPress,
}: {
  card: RetroCard;
  subGoalName: (id: string) => string;
  onPress: () => void;
}) {
  if (card.kind === 'today') {
    return (
      <View style={{ backgroundColor: LoopColors.warmSoft, borderWidth: 1, borderColor: LoopColors.warmLine, borderRadius: 22, padding: 18 }}>
        <Kind icon="sparkle" label="오늘의 되새김" />
        <LoopText variant="cardTitle" style={{ fontSize: 16, marginTop: 11, marginBottom: 7 }}>
          {card.title}
        </LoopText>
        <LoopText variant="caption" color="ink3" style={{ marginBottom: 15 }}>
          {subGoalName(card.subGoalId)} · {IMPORTANCE_LABEL[card.importance]} · {card.days}일째 열림
        </LoopText>
        <Button label="이 고리 되새기기" icon="arrow-right" height={44} onPress={onPress} />
      </View>
    );
  }

  if (card.kind === 'repeat') {
    return (
      <Pressable onPress={onPress}>
        <Card radius={22} style={{ padding: 18 }}>
          <Kind icon="undo" label="또 반복됐어요" tone="neutral" />
          <LoopText variant="cardTitle" style={{ marginTop: 11, marginBottom: 11 }}>
            {subGoalName(card.subGoalId)}에서 열린 <LoopText variant="cardTitle" color="warmDeep">{card.count}번째 고리</LoopText>예요.
          </LoopText>
          <View style={{ gap: 8 }}>
            {card.samples.map((t) => (
              <View key={t} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={{ width: 5, height: 5, borderRadius: 9999, backgroundColor: LoopColors.warm }} />
                <LoopText variant="caption" color="ink2" style={{ flex: 1 }} numberOfLines={1}>
                  {t}
                </LoopText>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13 }}>
            <LoopText variant="label" color="warmDeep">
              패턴 짚어 보기
            </LoopText>
            <Icon name="chevron-right" size={16} color={LoopColors.warmDeep} />
          </View>
        </Card>
      </Pressable>
    );
  }

  // area
  return (
    <Pressable onPress={onPress}>
      <Card radius={22} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 15 }}>
        <Ring value={card.total ? card.internalized / card.total : 0} size={52} stroke={6}>
          <LoopText variant="small" color="ink2">
            {card.internalized}/{card.total}
          </LoopText>
        </Ring>
        <View style={{ flex: 1 }}>
          <Kind icon="target" label="영역 통째 되짚기" tone="neutral" />
          <LoopText variant="cardTitle" style={{ marginTop: 7 }}>
            {subGoalName(card.subGoalId)}
          </LoopText>
          <LoopText variant="caption" color="ink4" style={{ marginTop: 3 }}>
            {card.open}개 고리가 열려 있어요
          </LoopText>
        </View>
        <Icon name="chevron-right" size={20} color={LoopColors.ink4} />
      </Card>
    </Pressable>
  );
}

function Kind({ icon, label, tone = 'warm' }: { icon: IconName; label: string; tone?: 'warm' | 'neutral' }) {
  const c = tone === 'warm' ? LoopColors.warmDeep : LoopColors.ink3;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={14} color={c} />
      <LoopText variant="small" color={c} style={{ letterSpacing: 0.4, textTransform: 'uppercase' }}>
        {label}
      </LoopText>
    </View>
  );
}

function EmptyReflect() {
  return (
    <Card radius={22} style={{ padding: 24, alignItems: 'center' }}>
      <Icon name="loop" size={28} color={LoopColors.warm} />
      <LoopText variant="cardTitle" style={{ marginTop: 12, textAlign: 'center' }}>
        되새길 고리가 아직 없어요
      </LoopText>
      <LoopText variant="bodyTight" color="ink3" style={{ marginTop: 6, textAlign: 'center' }}>
        피드백을 쌓으면, 되새길 만한 것을 Loopi가 골라 드릴게요.
      </LoopText>
    </Card>
  );
}
