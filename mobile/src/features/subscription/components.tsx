/** Settings "Subscription" section — plan badge, weekly usage, upgrade/restore. */
import { useRouter } from 'expo-router';
import { memo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  Badge,
  Card,
  ConfirmDialog,
  Icon,
  LoopColors,
  LoopMotion,
  LoopText,
  PressScale,
  SectionLabel,
} from '@loop/ui';
import { useT } from '@/lib/i18n';

import { useEntitlement, useRestorePurchases, useUsage, weeklyLimitFor } from './queries';

export const SubscriptionSection = memo(function SubscriptionSection() {
  const t = useT();
  const router = useRouter();
  const { data: ent } = useEntitlement();
  const { data: usage } = useUsage();
  const restore = useRestorePurchases();
  const [notice, setNotice] = useState<string | null>(null);

  const isPro = ent?.isPro ?? false;
  const limit = weeklyLimitFor(isPro);
  const used = usage?.used ?? 0;

  async function onRestore() {
    if (restore.isPending) return;
    try {
      const ok = await restore.mutateAsync();
      setNotice(t(ok ? 'sub.restore.done' : 'sub.restore.none'));
    } catch {
      setNotice(t('sub.restore.fail'));
    }
  }

  return (
    <>
      <SectionLabel>{t('settings.section.subscription')}</SectionLabel>
      <Card radius={20} style={styles.card}>
        <View style={styles.planRow}>
          <Badge
            label={isPro ? t('sub.plan.pro') : t('sub.plan.free')}
            tone={isPro ? 'warm' : 'neutral'}
          />
          <LoopText variant="bodyTight" color="ink3" style={styles.usage}>
            {isPro ? t('sub.usage.pro') : t('sub.usage', { used, limit })}
          </LoopText>
        </View>

        {!isPro && (
          <PressScale onPress={() => router.push('/paywall')} scaleTo={LoopMotion.scale.card}>
            <View style={[styles.row, styles.divider]}>
              <Icon name="sparkle" size={17} color={LoopColors.warmDeep} />
              <LoopText variant="body" color="warmDeep" style={styles.rowLabel}>
                {t('sub.upgrade')}
              </LoopText>
              <Icon name="chevron-right" size={18} color={LoopColors.ink4} />
            </View>
          </PressScale>
        )}

        <PressScale onPress={onRestore} scaleTo={LoopMotion.scale.card}>
          <View style={[styles.row, styles.divider]}>
            <LoopText variant="body" color="ink2" style={styles.flex}>
              {t('sub.restore')}
            </LoopText>
            {restore.isPending ? (
              <ActivityIndicator color={LoopColors.ink4} size="small" />
            ) : (
              <Icon name="chevron-right" size={18} color={LoopColors.ink4} />
            )}
          </View>
        </PressScale>
      </Card>

      <ConfirmDialog
        visible={!!notice}
        title={notice ?? ''}
        confirmLabel={t('common.ok')}
        onConfirm={() => setNotice(null)}
      />
    </>
  );
});

const styles = StyleSheet.create({
  card: { padding: 8 },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  usage: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10 },
  rowLabel: { flex: 1, marginLeft: 10 },
  divider: { borderTopWidth: 1, borderTopColor: LoopColors.lineSoft },
  flex: { flex: 1 },
});
