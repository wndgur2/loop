import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Button, Card, ComposerEntry, Icon, type IconName, LoopText, Ring, Screen } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
import { useFeedbacks } from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { buildRetroCards, type RetroCard } from '@/features/reflect/recommendations';
import { useT } from '@/lib/i18n';
import type { TKey } from '@/lib/translations';
import type { Importance } from '@/types/models';

function impLabelKey(imp: Importance): TKey {
  return imp === 'high' ? 'imp.high' : imp === 'low' ? 'imp.low' : 'imp.mid';
}

export default function ReflectScreen() {
  const router = useRouter();
  const t = useT();
  const { data: feedbacks = [], isLoading } = useFeedbacks();
  const { data: subGoals = [] } = useSubGoals();

  const subGoalName = useMemo(() => {
    const map = new Map(subGoals.map((s) => [s.id, s.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [subGoals]);

  const cards = useMemo(() => buildRetroCards(feedbacks), [feedbacks]);
  const startReflect = () => router.push('/chat/reflect');

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
            <LoopText variant="title">{t('reflect.title')}</LoopText>
            <Icon name="loop" size={21} color={LoopColors.warm} />
          </View>
          <LoopText variant="bodyTight" color="ink3" style={{ marginTop: 6 }}>
            {t('reflect.subtitle')}
          </LoopText>
        </View>

        <View style={{ paddingHorizontal: 22, gap: 14 }}>
          {cards.map((card, i) => (
            <RetroCardView key={i} card={card} subGoalName={subGoalName} onPress={startReflect} />
          ))}
          {cards.length === 0 && !isLoading && <EmptyReflect />}
        </View>
      </ScrollView>

      <ComposerEntry placeholder={t('reflect.composer')} onPress={startReflect} />
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
  const t = useT();

  if (card.kind === 'today') {
    return (
      <View style={{ backgroundColor: LoopColors.warmSoft, borderWidth: 1, borderColor: LoopColors.warmLine, borderRadius: 22, padding: 18 }}>
        <Kind icon="sparkle" label={t('reflect.kind.today')} />
        <LoopText variant="cardTitle" style={{ fontSize: 16, marginTop: 11, marginBottom: 7 }}>
          {card.title}
        </LoopText>
        <LoopText variant="caption" color="ink3" style={{ marginBottom: 15 }}>
          {t('reflect.meta', { sub: subGoalName(card.subGoalId), imp: t(impLabelKey(card.importance)), days: card.days })}
        </LoopText>
        <Button label={t('reflect.today.cta')} icon="arrow-right" height={44} onPress={onPress} />
      </View>
    );
  }

  if (card.kind === 'repeat') {
    return (
      <Pressable onPress={onPress}>
        <Card radius={22} style={{ padding: 18 }}>
          <Kind icon="undo" label={t('reflect.kind.repeat')} tone="neutral" />
          <LoopText variant="cardTitle" color="warmDeep" style={{ marginTop: 11, marginBottom: 11 }}>
            {t('reflect.repeat.line', { sub: subGoalName(card.subGoalId), count: card.count })}
          </LoopText>
          <View style={{ gap: 8 }}>
            {card.samples.map((title) => (
              <View key={title} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={{ width: 5, height: 5, borderRadius: 9999, backgroundColor: LoopColors.warm }} />
                <LoopText variant="caption" color="ink2" style={{ flex: 1 }} numberOfLines={1}>
                  {title}
                </LoopText>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13 }}>
            <LoopText variant="label" color="warmDeep">
              {t('reflect.repeat.cta')}
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
          <Kind icon="target" label={t('reflect.kind.area')} tone="neutral" />
          <LoopText variant="cardTitle" style={{ marginTop: 7 }}>
            {subGoalName(card.subGoalId)}
          </LoopText>
          <LoopText variant="caption" color="ink4" style={{ marginTop: 3 }}>
            {t('reflect.area.open', { open: card.open })}
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
  const t = useT();
  return (
    <Card radius={22} style={{ padding: 24, alignItems: 'center' }}>
      <Icon name="loop" size={28} color={LoopColors.warm} />
      <LoopText variant="cardTitle" style={{ marginTop: 12, textAlign: 'center' }}>
        {t('reflect.empty.title')}
      </LoopText>
      <LoopText variant="bodyTight" color="ink3" style={{ marginTop: 6, textAlign: 'center' }}>
        {t('reflect.empty.body')}
      </LoopText>
    </Card>
  );
}
