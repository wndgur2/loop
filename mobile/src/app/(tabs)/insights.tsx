import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Card, Icon, InsightsSkeleton, LoopText, ProgressBar, Ring, Screen, TabHeader } from '@/components/ui';
import { LoopColors, LoopMotion } from '@/constants/loop-theme';
import { computeStats } from '@/features/dashboard/stats';
import { useFeedbacks } from '@/features/feedback/queries';
import { useSubGoals } from '@/features/goals/queries';
import { useT } from '@/lib/i18n';
import type { TKey } from '@/lib/translations';
import type { Importance } from '@/types/models';

function impLabelKey(imp: Importance): TKey {
  return imp === 'high' ? 'imp.high' : imp === 'low' ? 'imp.low' : 'imp.mid';
}

export default function InsightsScreen() {
  const t = useT();
  const { data: feedbacks = [], isLoading } = useFeedbacks();
  const { data: subGoals = [] } = useSubGoals();
  const stats = useMemo(() => computeStats(feedbacks), [feedbacks]);

  const subGoalName = (id: string) => subGoals.find((s) => s.id === id)?.name ?? '—';
  const pct = Math.round(stats.internalizationRate * 100);

  return (
    <Screen edges={['top']}>
      <TabHeader title={t('dash.title')} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <InsightsSkeleton />
        ) : stats.total === 0 ? (
          <Card radius={22} style={styles.emptyCard}>
            <Icon name="chart" size={28} color={LoopColors.warm} />
            <LoopText variant="cardTitle" style={styles.emptyTitle}>
              {t('dash.empty.title')}
            </LoopText>
            <LoopText variant="bodyTight" color="ink3" style={styles.emptyBody}>
              {t('dash.empty.body')}
            </LoopText>
          </Card>
        ) : (
          <Animated.View entering={FadeIn.duration(LoopMotion.timing.base)}>
            {/* Internalization rate hero */}
            <Card radius={24} style={styles.hero}>
              <Ring value={stats.internalizationRate} size={132} stroke={10} animated>
                <LoopText style={styles.heroPct}>
                  {pct}
                  <LoopText style={styles.heroPctUnit}>%</LoopText>
                </LoopText>
                <LoopText variant="eyebrow" color="ink4" style={styles.heroEyebrow}>
                  {t('home.internalized')}
                </LoopText>
              </Ring>
              <View style={styles.flex}>
                <LoopText variant="body" color="ink2">
                  {t('dash.hero.line', { total: stats.total, internalized: stats.internalized })}
                </LoopText>
                <LoopText variant="caption" color="ink4" style={styles.heroSub}>
                  {t('dash.hero.sub', { done: stats.takeawayDone, total: stats.takeawayTotal })}
                </LoopText>
              </View>
            </Card>

            {/* Two metric tiles */}
            <View style={styles.tiles}>
              <MetricTile
                label={t('dash.metric.rate')}
                value={`${pct}%`}
                sub={t('dash.metric.rateSub', { internalized: stats.internalized, total: stats.total })}
              />
              <MetricTile
                label={t('dash.metric.takeaway')}
                value={`${Math.round(stats.takeawayRate * 100)}%`}
                sub={t('dash.metric.takeawaySub', { done: stats.takeawayDone, total: stats.takeawayTotal })}
              />
            </View>

            {/* Distribution by sub-goal */}
            <SectionTitle>{t('dash.section.subgoal')}</SectionTitle>
            <Card radius={20} style={styles.distCard}>
              {Object.entries(stats.bySubGoal)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([id, b]) => (
                  <DistRow
                    key={id}
                    label={subGoalName(id)}
                    count={b.count}
                    fraction={stats.total ? b.count / stats.total : 0}
                    caption={t('dash.subgoal.internalized', { n: b.internalized })}
                  />
                ))}
            </Card>

            {/* Distribution by importance */}
            <SectionTitle>{t('dash.section.importance')}</SectionTitle>
            <Card radius={20} style={styles.distCard}>
              {(['high', 'mid', 'low'] as Importance[]).map((lv) => (
                <DistRow
                  key={lv}
                  label={t(impLabelKey(lv))}
                  count={stats.byImportance[lv]}
                  fraction={stats.total ? stats.byImportance[lv] / stats.total : 0}
                />
              ))}
            </Card>

            {/* Tag frequency */}
            {stats.tagFrequency.length > 0 && (
              <>
                <SectionTitle>{t('dash.section.tags')}</SectionTitle>
                <View style={styles.tagsWrap}>
                  {stats.tagFrequency.slice(0, 12).map(({ tag, count }) => (
                    <View key={tag} style={styles.tag}>
                      <LoopText variant="label" color="ink2">
                        {tag}
                      </LoopText>
                      <LoopText variant="caption" color="warmDeep">
                        {count}
                      </LoopText>
                    </View>
                  ))}
                </View>
              </>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </Screen>
  );
}

function MetricTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card radius={20} style={styles.tile}>
      <LoopText variant="eyebrow" color="ink4">
        {label}
      </LoopText>
      <LoopText style={styles.tileValue}>{value}</LoopText>
      <LoopText variant="caption" color="ink4" style={styles.tileSub}>
        {sub}
      </LoopText>
    </Card>
  );
}

function DistRow({ label, count, fraction, caption }: { label: string; count: number; fraction: number; caption?: string }) {
  return (
    <View>
      <View style={styles.distHead}>
        <LoopText variant="label" color="ink2" numberOfLines={1} style={styles.flex}>
          {label}
        </LoopText>
        {caption && (
          <LoopText variant="caption" color="ink4" style={styles.distCaption}>
            {caption}
          </LoopText>
        )}
        <LoopText variant="label" color="ink">
          {count}
        </LoopText>
      </View>
      <ProgressBar value={fraction} height={8} minPct={4} />
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <LoopText variant="eyebrow" color="ink4" style={styles.sectionTitle}>
      {children}
    </LoopText>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingBottom: 24 },
  emptyCard: { padding: 24, alignItems: 'center' },
  emptyTitle: { marginTop: 12, textAlign: 'center' },
  emptyBody: { marginTop: 6, textAlign: 'center' },
  hero: { padding: 22, flexDirection: 'row', alignItems: 'center', gap: 20 },
  heroPct: { fontSize: 32, lineHeight: 38, fontWeight: '700', letterSpacing: -0.8 },
  heroPctUnit: { fontSize: 16, color: LoopColors.ink4, fontWeight: '700' },
  heroEyebrow: { marginTop: 2 },
  heroSub: { marginTop: 8 },
  tiles: { flexDirection: 'row', gap: 12, marginTop: 12 },
  tile: { flex: 1, padding: 16 },
  tileValue: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.6, marginTop: 8, color: LoopColors.warmDeep },
  tileSub: { marginTop: 4 },
  distCard: { padding: 16, gap: 13 },
  distHead: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 },
  distCaption: { marginRight: 8 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: LoopColors.surface,
    borderWidth: 1,
    borderColor: LoopColors.line,
    borderRadius: 9999,
    paddingHorizontal: 12,
    height: 32,
  },
  sectionTitle: { marginTop: 26, marginBottom: 11 },
});
