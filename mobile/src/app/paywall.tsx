import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Banner,
  Button,
  ConfirmDialog,
  Icon,
  LoopColors,
  LoopMotion,
  LoopRadius,
  LoopText,
  PressScale,
  Screen,
  ScreenHeader,
} from '@loop/ui';
import {
  useEntitlement,
  useProPackage,
  usePurchasePro,
  useRestorePurchases,
} from '@/features/subscription/queries';
import { useI18n } from '@/lib/i18n';
import { purchasesAvailable } from '@/lib/purchases';

const BENEFITS = [
  'paywall.benefit.loopie',
  'paywall.benefit.flow',
  'paywall.benefit.support',
] as const;

/** Format an ISO date as Y.M.D (locale-agnostic — Hermes Intl is unreliable on Android). */
function shortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

export default function PaywallScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{ reason?: string; reset?: string }>();
  const { data: ent } = useEntitlement();
  const { data: pkg } = useProPackage();
  const purchase = usePurchasePro();
  const restore = useRestorePurchases();
  const [notice, setNotice] = useState<{ title: string; message?: string; done?: boolean } | null>(
    null,
  );

  const available = purchasesAvailable();
  const isPro = ent?.isPro ?? false;

  async function onSubscribe() {
    if (purchase.isPending) return;
    try {
      const res = await purchase.mutateAsync();
      if (res.purchased) {
        setNotice({
          title: t('paywall.purchased.title'),
          message: t('paywall.purchased.msg'),
          done: true,
        });
      }
      // cancelled → stay on the paywall, no message
    } catch (e) {
      const msg = e instanceof Error ? e.message : '';
      setNotice({
        title: t(msg === 'no_offering' ? 'paywall.unavailable' : 'paywall.purchase.fail'),
      });
    }
  }

  async function onRestore() {
    if (restore.isPending) return;
    try {
      const ok = await restore.mutateAsync();
      if (ok) {
        setNotice({
          title: t('paywall.purchased.title'),
          message: t('paywall.purchased.msg'),
          done: true,
        });
      } else {
        setNotice({ title: t('sub.restore.none') });
      }
    } catch {
      setNotice({ title: t('sub.restore.fail') });
    }
  }

  function dismissNotice() {
    const done = notice?.done;
    setNotice(null);
    if (done) router.back();
  }

  return (
    <Screen edges={['top']}>
      <ScreenHeader onBack={() => router.back()} backIcon="close" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.mark}>
            <Icon name="sparkle" size={30} color={LoopColors.white} />
          </View>
          <LoopText variant="display" style={styles.title}>
            {t('paywall.title')}
          </LoopText>
          <LoopText variant="body" color="ink3" style={styles.subtitle}>
            {t('paywall.subtitle')}
          </LoopText>
        </View>

        {params.reason === 'limit' && (
          <Banner
            tone="info"
            title={t('paywall.reached')}
            message={
              params.reset
                ? t('paywall.reached.reset', { date: shortDate(params.reset) })
                : undefined
            }
            style={styles.banner}
          />
        )}

        <View style={styles.benefits}>
          {BENEFITS.map((key) => (
            <View key={key} style={styles.benefitRow}>
              <View style={styles.check}>
                <Icon name="check-sm" size={15} color={LoopColors.good} />
              </View>
              <LoopText variant="body" color="ink2" style={styles.benefitText}>
                {t(key)}
              </LoopText>
            </View>
          ))}
        </View>

        {isPro ? (
          <Banner tone="good" title={t('paywall.alreadyPro')} style={styles.banner} />
        ) : (
          <>
            <LoopText variant="caption" color="ink4" style={styles.price}>
              {pkg ? t('paywall.price', { price: pkg.priceString }) : t('paywall.priceUnavailable')}
            </LoopText>
            <Button
              label={t('paywall.cta')}
              icon="sparkle"
              onPress={onSubscribe}
              disabled={!available}
              loading={purchase.isPending}
            />
            {!available && (
              <LoopText variant="caption" color="ink4" style={styles.unavailable}>
                {t('paywall.unavailable')}
              </LoopText>
            )}
            <PressScale onPress={onRestore} scaleTo={LoopMotion.scale.card} style={styles.restore}>
              <LoopText variant="bodyTight" color="warmDeep" style={styles.restoreText}>
                {t('paywall.restore')}
              </LoopText>
            </PressScale>
          </>
        )}

        <LoopText variant="small" color="ink4" style={styles.legal}>
          {t('paywall.legal')}
        </LoopText>
        <View style={styles.legalLinks}>
          {(['terms', 'privacy'] as const).map((doc) => (
            <PressScale key={doc} onPress={() => router.push(`/legal/${doc}`)} hitSlop={6}>
              <LoopText variant="small" color="ink3">
                {t(doc === 'privacy' ? 'legal.privacy' : 'legal.terms')}
              </LoopText>
            </PressScale>
          ))}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={!!notice}
        icon={notice?.done ? 'check' : undefined}
        title={notice?.title ?? ''}
        message={notice?.message}
        confirmLabel={t('common.ok')}
        onConfirm={dismissNotice}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 24, paddingBottom: 32 },
  hero: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
  mark: {
    width: 64,
    height: 64,
    borderRadius: LoopRadius.full,
    backgroundColor: LoopColors.warm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: 10 },
  banner: { marginTop: 18 },
  benefits: { marginTop: 24, gap: 14 },
  benefitRow: { flexDirection: 'row', alignItems: 'center' },
  check: {
    width: 24,
    height: 24,
    borderRadius: LoopRadius.full,
    backgroundColor: LoopColors.goodSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: { flex: 1 },
  price: { textAlign: 'center', marginTop: 28, marginBottom: 10 },
  unavailable: { textAlign: 'center', marginTop: 10 },
  restore: { alignSelf: 'center', marginTop: 18, padding: 6 },
  restoreText: { textAlign: 'center' },
  legal: { textAlign: 'center', marginTop: 28, lineHeight: 18 },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 12 },
});
