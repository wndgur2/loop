// Weekly Loopie usage gating (payments). Pro benefit = Loopie usage (CLAUDE.md §2, adr-0006).
//
// The quota is enforced HERE, server-side, with a service-role client — client-side limits are
// only UX. Counting happens per LLM call (= per Loopie turn = the real cost). The window resets
// weekly (Monday, UTC). free = LOOPIE_FREE_WEEKLY_LIMIT; pro = free × LOOPIE_PRO_LIMIT_MULTIPLIER
// (a high fair-use cap that blocks abuse without feeling capped).

import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import type { SubscriptionPlan } from "../_shared/types.ts";

const DEFAULT_FREE_WEEKLY_LIMIT = 30;
const DEFAULT_PRO_MULTIPLIER = 20;

function envInt(name: string, fallback: number): number {
  const raw = Deno.env.get(name);
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Monday 00:00 UTC of the week containing `now`, as a YYYY-MM-DD date string. */
export function weekStartUTC(now: Date): string {
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const dow = d.getUTCDay(); // 0=Sun .. 6=Sat
  const sinceMonday = (dow + 6) % 7;
  d.setUTCDate(d.getUTCDate() - sinceMonday);
  return d.toISOString().slice(0, 10);
}

/** ISO timestamp of the next Monday 00:00 UTC after the given week start. */
function nextResetISO(periodStart: string): string {
  const d = new Date(`${periodStart}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 7);
  return d.toISOString();
}

export interface QuotaResult {
  allowed: boolean;
  plan: SubscriptionPlan;
  limit: number;
  used: number;
  resetAt: string;
}

/**
 * Reads the user's plan, atomically increments this week's Loopie counter, and reports whether the
 * call is allowed. Increment-then-check: the request that pushes the counter past the limit is the
 * one rejected (rejected requests stay over the limit — harmless). Uses the service-role client, so
 * `userId` must come from a verified token, never the request body.
 */
export async function enforceLoopieQuota(
  service: SupabaseClient,
  userId: string,
): Promise<QuotaResult> {
  const freeLimit = envInt(
    "LOOPIE_FREE_WEEKLY_LIMIT",
    DEFAULT_FREE_WEEKLY_LIMIT,
  );
  const proMultiplier = envInt(
    "LOOPIE_PRO_LIMIT_MULTIPLIER",
    DEFAULT_PRO_MULTIPLIER,
  );

  const { data: sub } = await service
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .maybeSingle();

  const isPro = sub?.plan === "pro" && sub?.status !== "expired";
  const plan: SubscriptionPlan = isPro ? "pro" : "free";
  const limit = isPro ? freeLimit * proMultiplier : freeLimit;

  const periodStart = weekStartUTC(new Date());
  const { data: used, error } = await service.rpc("increment_loopie_turns", {
    p_user: userId,
    p_period: periodStart,
  });
  if (error) throw error;

  const usedCount = typeof used === "number" ? used : 0;
  return {
    allowed: usedCount <= limit,
    plan,
    limit,
    used: usedCount,
    resetAt: nextResetISO(periodStart),
  };
}
