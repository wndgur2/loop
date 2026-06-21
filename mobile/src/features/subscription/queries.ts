/**
 * Subscription + Loopie usage hooks (payments, adr-0006).
 *
 * Entitlement source of truth is the server `subscriptions` row (written by the RevenueCat webhook);
 * the client only reads it. Purchases go through the RevenueCat SDK wrapper (lib/purchases) and are
 * reconciled into the row by the webhook — we also update the cache optimistically so the UI flips
 * to Pro immediately. The weekly limits below are DISPLAY-only; the server enforces the real cap.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getProPackage, purchasePro, restorePurchases } from '@/lib/purchases';
import { qk } from '@/lib/query-keys';
import { getSupabase } from '@/lib/supabase';
import {
  type SubscriptionPlan,
  type SubscriptionStatus,
  toSubscription,
  toUsage,
} from '@/types/models';

// Display-only mirrors of the server env (LOOPIE_FREE_WEEKLY_LIMIT / LOOPIE_PRO_LIMIT_MULTIPLIER).
export const FREE_WEEKLY_LIMIT = Number(process.env.EXPO_PUBLIC_LOOPIE_FREE_WEEKLY_LIMIT ?? 30);
export const PRO_LIMIT_MULTIPLIER = Number(
  process.env.EXPO_PUBLIC_LOOPIE_PRO_LIMIT_MULTIPLIER ?? 20,
);

export interface Entitlement {
  isPro: boolean;
  plan: SubscriptionPlan;
  status: SubscriptionStatus | null;
  currentPeriodEnd: string | null;
}

const FREE_ENTITLEMENT: Entitlement = {
  isPro: false,
  plan: 'free',
  status: null,
  currentPeriodEnd: null,
};

/** Monday (UTC) of the current usage week, as YYYY-MM-DD. Mirrors the server's weekStartUTC. */
function weekStartUTC(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const sinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - sinceMonday);
  return d.toISOString().slice(0, 10);
}

function nextResetISO(periodStart: string): string {
  const d = new Date(`${periodStart}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString();
}

/** The weekly limit shown for a plan (display only — server is authoritative). */
export function weeklyLimitFor(isPro: boolean): number {
  return isPro ? FREE_WEEKLY_LIMIT * PRO_LIMIT_MULTIPLIER : FREE_WEEKLY_LIMIT;
}

/** Current entitlement from the server subscriptions row (free when there's no row). */
export function useEntitlement() {
  return useQuery<Entitlement>({
    queryKey: qk.subscription,
    queryFn: async () => {
      const { data, error } = await getSupabase().from('subscriptions').select('*').maybeSingle();
      if (error) throw error;
      if (!data) return FREE_ENTITLEMENT;
      const s = toSubscription(data);
      return {
        isPro: s.plan === 'pro' && s.status !== 'expired',
        plan: s.plan,
        status: s.status,
        currentPeriodEnd: s.currentPeriodEnd,
      };
    },
  });
}

export interface UsageView {
  used: number;
  periodStart: string;
  resetAt: string;
}

/** Loopie turns used in the current week (for "used / limit" display). */
export function useUsage() {
  return useQuery<UsageView>({
    queryKey: qk.usage,
    queryFn: async () => {
      const periodStart = weekStartUTC();
      const { data, error } = await getSupabase()
        .from('usage_counters')
        .select('*')
        .eq('period_start', periodStart)
        .maybeSingle();
      if (error) throw error;
      const used = data ? toUsage(data).loopieTurns : 0;
      return { used, periodStart, resetAt: nextResetISO(periodStart) };
    },
  });
}

/** The Pro package price string from the store (null on web / when not configured). */
export function useProPackage() {
  return useQuery<{ priceString: string } | null>({
    queryKey: qk.proPackage,
    queryFn: async () => {
      const pkg = await getProPackage();
      return pkg ? { priceString: pkg.product.priceString } : null;
    },
    staleTime: 5 * 60_000,
  });
}

/** Purchase Pro via RevenueCat; optimistically flip the cache to Pro, then let the webhook reconcile. */
export function usePurchasePro() {
  const qc = useQueryClient();
  return useMutation<{ purchased: boolean; cancelled: boolean }, Error, void>({
    mutationFn: () => purchasePro(),
    onSuccess: (res) => {
      if (!res.purchased) return;
      // Device customerInfo is authoritative for access right now; the webhook updates the row shortly.
      qc.setQueryData<Entitlement>(qk.subscription, (prev) => ({
        ...(prev ?? FREE_ENTITLEMENT),
        isPro: true,
        plan: 'pro',
        status: 'active',
      }));
      qc.invalidateQueries({ queryKey: qk.usage });
    },
  });
}

/** Restore purchases; returns whether Pro is active afterward. */
export function useRestorePurchases() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, void>({
    mutationFn: () => restorePurchases(),
    onSuccess: (isPro) => {
      if (isPro) {
        qc.setQueryData<Entitlement>(qk.subscription, (prev) => ({
          ...(prev ?? FREE_ENTITLEMENT),
          isPro: true,
          plan: 'pro',
          status: 'active',
        }));
      }
      qc.invalidateQueries({ queryKey: qk.subscription });
    },
  });
}
