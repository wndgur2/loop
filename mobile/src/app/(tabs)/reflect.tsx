import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

import {
  Button,
  Card,
  EmptyState,
  Icon,
  type IconName,
  LoopText,
  PressScale,
  Ring,
  Screen,
  TabHeader,
} from '@/components/ui';
import { LoopColors, LoopMotion } from '@/constants/loop-theme';
import { TabComposer } from '@/features/chat/tab-composer';
import { useFeedbacks } from '@/features/feedback/queries';
import { useSubGoalName } from '@/features/goals/use-sub-goal-name';
import { buildRetroCards, type RetroCard } from '@/features/reflect/recommendations';
import { useT } from '@/lib/i18n';
import { impLabelKey } from '@/lib/importance';

export default function ReflectScreen() {
  const router = useRouter();
  const t = useT();
  const { data: feedbacks = [], isLoading } = useFeedbacks();
  const subGoalName = useSubGoalName();

  const cards = useMemo(() => buildRetroCards(feedbacks), [feedbacks]);
  const startReflect = () => router.push('/chat/reflect');

  return (
    <Screen edges={['top']}>
      <TabHeader title={t('reflect.title')} />

      <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={8}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <LoopText variant="bodyTight" color="ink3" style={styles.subtitle}>
            {t('reflect.subtitle')}
          </LoopText>

          <View style={styles.cards}>
            {cards.map((card, i) => (
              <RetroCardView key={i} card={card} subGoalName={subGoalName} onPress={startReflect} />
            ))}
            {cards.length === 0 && !isLoading && (
              <EmptyState title={t('reflect.empty.title')} body={t('reflect.empty.body')} />
            )}
          </View>
        </ScrollView>

        <TabComposer mode="reflect" placeholder={t('reflect.composer')} />
        <View style={styles.bottomSpacer} />
      </KeyboardAvoidingView>
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
      <View style={styles.todayCard}>
        <Kind icon="sparkle" label={t('reflect.kind.today')} />
        <LoopText variant="cardTitle" style={styles.todayTitle}>
          {card.title}
        </LoopText>
        <LoopText variant="caption" color="ink3" style={styles.todayMeta}>
          {t('reflect.meta', {
            sub: subGoalName(card.subGoalId),
            imp: t(impLabelKey(card.importance)),
            days: card.days,
          })}
        </LoopText>
        <Button label={t('reflect.today.cta')} icon="arrow-right" height={44} onPress={onPress} />
      </View>
    );
  }

  if (card.kind === 'repeat') {
    return (
      <PressScale onPress={onPress} scaleTo={LoopMotion.scale.card}>
        <Card radius={22} style={styles.repeatCard}>
          <Kind icon="undo" label={t('reflect.kind.repeat')} tone="neutral" />
          <LoopText variant="cardTitle" color="warmDeep" style={styles.repeatLine}>
            {t('reflect.repeat.line', { sub: subGoalName(card.subGoalId), count: card.count })}
          </LoopText>
          <View style={styles.samples}>
            {card.samples.map((title) => (
              <View key={title} style={styles.sampleRow}>
                <View style={styles.sampleDot} />
                <LoopText variant="caption" color="ink2" style={styles.flex} numberOfLines={1}>
                  {title}
                </LoopText>
              </View>
            ))}
          </View>
          <View style={styles.repeatCta}>
            <LoopText variant="label" color="warmDeep">
              {t('reflect.repeat.cta')}
            </LoopText>
            <Icon name="chevron-right" size={16} color={LoopColors.warmDeep} />
          </View>
        </Card>
      </PressScale>
    );
  }

  // area
  return (
    <PressScale onPress={onPress} scaleTo={LoopMotion.scale.card}>
      <Card radius={22} style={styles.areaCard}>
        <Ring value={card.total ? card.internalized / card.total : 0} size={52} stroke={6}>
          <LoopText variant="small" color="ink2">
            {card.internalized}/{card.total}
          </LoopText>
        </Ring>
        <View style={styles.flex}>
          <Kind icon="target" label={t('reflect.kind.area')} tone="neutral" />
          <LoopText variant="cardTitle" style={styles.areaName}>
            {subGoalName(card.subGoalId)}
          </LoopText>
          <LoopText variant="caption" color="ink4" style={styles.areaOpen}>
            {t('reflect.area.open', { open: card.open })}
          </LoopText>
        </View>
        <Icon name="chevron-right" size={20} color={LoopColors.ink4} />
      </Card>
    </PressScale>
  );
}

function Kind({
  icon,
  label,
  tone = 'warm',
}: {
  icon: IconName;
  label: string;
  tone?: 'warm' | 'neutral';
}) {
  const c = tone === 'warm' ? LoopColors.warmDeep : LoopColors.ink3;
  return (
    <View style={styles.kind}>
      <Icon name={icon} size={14} color={c} />
      <LoopText variant="small" color={c} style={styles.kindLabel}>
        {label}
      </LoopText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingBottom: 16 },
  subtitle: { marginBottom: 16 },
  cards: { gap: 14 },
  bottomSpacer: { height: 6 },
  todayCard: {
    backgroundColor: LoopColors.warmSoft,
    borderWidth: 1,
    borderColor: LoopColors.warmLine,
    borderRadius: 22,
    padding: 18,
  },
  todayTitle: { fontSize: 16, marginTop: 11, marginBottom: 7 },
  todayMeta: { marginBottom: 15 },
  repeatCard: { padding: 18 },
  repeatLine: { marginTop: 11, marginBottom: 11 },
  samples: { gap: 8 },
  sampleRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  sampleDot: { width: 5, height: 5, borderRadius: 9999, backgroundColor: LoopColors.warm },
  repeatCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 13 },
  areaCard: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 15 },
  areaName: { marginTop: 7 },
  areaOpen: { marginTop: 3 },
  kind: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kindLabel: { letterSpacing: 0.4, textTransform: 'uppercase' },
});
