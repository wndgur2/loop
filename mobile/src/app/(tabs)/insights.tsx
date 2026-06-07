import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';

import { Card, Icon, LoopText, Ring, Screen, TabHeader } from '@/components/ui';
import { LoopColors } from '@/constants/loop-theme';
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
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {stats.total === 0 && !isLoading ? (
          <Card radius={22} style={{ padding: 24, alignItems: 'center' }}>
            <Icon name="chart" size={28} color={LoopColors.warm} />
            <LoopText variant="cardTitle" style={{ marginTop: 12, textAlign: 'center' }}>
              {t('dash.empty.title')}
            </LoopText>
            <LoopText variant="bodyTight" color="ink3" style={{ marginTop: 6, textAlign: 'center' }}>
              {t('dash.empty.body')}
            </LoopText>
          </Card>
        ) : (
          <>
            {/* 내재화율 hero */}
            <Card radius={24} style={{ padding: 22, flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <Ring value={stats.internalizationRate} size={120} stroke={11}>
                <LoopText style={{ fontSize: 32, fontWeight: '700', letterSpacing: -0.8 }}>
                  {pct}
                  <LoopText style={{ fontSize: 16, color: LoopColors.ink4, fontWeight: '700' }}>%</LoopText>
                </LoopText>
                <LoopText variant="eyebrow" color="ink4" style={{ marginTop: 2 }}>
                  {t('home.internalized')}
                </LoopText>
              </Ring>
              <View style={{ flex: 1 }}>
                <LoopText variant="body" color="ink2">
                  {t('dash.hero.line', { total: stats.total, internalized: stats.internalized })}
                </LoopText>
                <LoopText variant="caption" color="ink4" style={{ marginTop: 8 }}>
                  {t('dash.hero.sub', { done: stats.takeawayDone, total: stats.takeawayTotal })}
                </LoopText>
              </View>
            </Card>

            {/* 두 지표 타일 */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
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

            {/* 하위목표별 분포 */}
            <SectionTitle>{t('dash.section.subgoal')}</SectionTitle>
            <Card radius={20} style={{ padding: 16, gap: 13 }}>
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

            {/* 중요도 분포 */}
            <SectionTitle>{t('dash.section.importance')}</SectionTitle>
            <Card radius={20} style={{ padding: 16, gap: 13 }}>
              {(['high', 'mid', 'low'] as Importance[]).map((lv) => (
                <DistRow
                  key={lv}
                  label={t(impLabelKey(lv))}
                  count={stats.byImportance[lv]}
                  fraction={stats.total ? stats.byImportance[lv] / stats.total : 0}
                />
              ))}
            </Card>

            {/* 태그 빈도 */}
            {stats.tagFrequency.length > 0 && (
              <>
                <SectionTitle>{t('dash.section.tags')}</SectionTitle>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {stats.tagFrequency.slice(0, 12).map(({ tag, count }) => (
                    <View
                      key={tag}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: LoopColors.surface,
                        borderWidth: 1,
                        borderColor: LoopColors.line,
                        borderRadius: 9999,
                        paddingHorizontal: 12,
                        height: 32,
                      }}
                    >
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
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function MetricTile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card radius={20} style={{ flex: 1, padding: 16 }}>
      <LoopText variant="eyebrow" color="ink4">
        {label}
      </LoopText>
      <LoopText style={{ fontSize: 28, fontWeight: '700', letterSpacing: -0.6, marginTop: 8, color: LoopColors.warmDeep }}>
        {value}
      </LoopText>
      <LoopText variant="caption" color="ink4" style={{ marginTop: 4 }}>
        {sub}
      </LoopText>
    </Card>
  );
}

function DistRow({ label, count, fraction, caption }: { label: string; count: number; fraction: number; caption?: string }) {
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 }}>
        <LoopText variant="label" color="ink2" numberOfLines={1} style={{ flex: 1 }}>
          {label}
        </LoopText>
        {caption && (
          <LoopText variant="caption" color="ink4" style={{ marginRight: 8 }}>
            {caption}
          </LoopText>
        )}
        <LoopText variant="label" color="ink">
          {count}
        </LoopText>
      </View>
      <View style={{ height: 8, borderRadius: 9999, backgroundColor: LoopColors.ringTrack, overflow: 'hidden' }}>
        <View style={{ width: `${Math.max(4, Math.round(fraction * 100))}%`, height: '100%', borderRadius: 9999, backgroundColor: LoopColors.warm }} />
      </View>
    </View>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <LoopText variant="eyebrow" color="ink4" style={{ marginTop: 26, marginBottom: 11 }}>
      {children}
    </LoopText>
  );
}
