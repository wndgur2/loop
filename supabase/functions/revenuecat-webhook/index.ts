// RevenueCat webhook → subscription entitlement sync (payments, adr-0006).
//
// This is the SOURCE OF TRUTH for a user's plan. RevenueCat calls this endpoint on every
// purchase/renewal/cancellation/expiration; we map the event to the user's `subscriptions` row
// using the service-role client (the only writer — the client has read-only access, CLAUDE.md §6).
//
// Setup (done in the RevenueCat dashboard, not here): set the webhook URL to
//   <SUPABASE_URL>/functions/v1/revenuecat-webhook
// and set the Authorization header value to REVENUECAT_WEBHOOK_SECRET. We require app_user_id to be
// the Supabase user id (the client calls Purchases.logIn(userId)).

import { createServiceClient } from "../_shared/client.ts";
import { jsonResponse } from "../_shared/cors.ts";
import type { SubscriptionPlan, SubscriptionStatus } from "../_shared/types.ts";

/** Constant-time string comparison (avoids leaking the secret via timing). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RcEvent {
  id?: string;
  type?: string;
  app_user_id?: string;
  product_id?: string;
  entitlement_ids?: string[] | null;
  entitlement_id?: string | null;
  expiration_at_ms?: number | null;
}

/** Maps a RevenueCat event type to our plan/status/auto-renew. Returns null for events we ignore. */
function mapEvent(type: string): {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  willRenew: boolean;
} | null {
  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "PRODUCT_CHANGE":
    case "UNCANCELLATION":
      return { plan: "pro", status: "active", willRenew: true };
    case "NON_RENEWING_PURCHASE":
      return { plan: "pro", status: "active", willRenew: false };
    case "CANCELLATION":
      // Auto-renew turned off, but access continues until expiry → keep pro until EXPIRATION.
      return { plan: "pro", status: "cancelled", willRenew: false };
    case "BILLING_ISSUE":
      // In the grace period the user keeps access while payment is retried.
      return { plan: "pro", status: "in_grace", willRenew: true };
    case "EXPIRATION":
      return { plan: "free", status: "expired", willRenew: false };
    default:
      // SUBSCRIBER_ALIAS / TRANSFER / TEST / etc. — nothing to apply for the MVP.
      return null;
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST")
    return jsonResponse({ error: "method_not_allowed" }, 405);

  // Authenticate the webhook via the shared secret (RevenueCat sends it in the Authorization header).
  const secret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET") ?? "";
  const provided = req.headers.get("Authorization") ?? "";
  if (!secret || !safeEqual(provided, secret)) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  try {
    const payload = (await req.json().catch(() => null)) as {
      event?: RcEvent;
    } | null;
    const ev = payload?.event;
    if (
      !ev ||
      typeof ev.type !== "string" ||
      typeof ev.app_user_id !== "string"
    ) {
      return jsonResponse({ error: "invalid_event" }, 400);
    }

    // app_user_id must be a Supabase user id. Anonymous RC ids ($RCAnonymousID:…) have no account yet.
    const userId = ev.app_user_id;
    if (!UUID_RE.test(userId))
      return jsonResponse({ ok: true, ignored: "non_user_id" });

    const mapped = mapEvent(ev.type);
    if (!mapped) return jsonResponse({ ok: true, ignored: ev.type });

    const service = createServiceClient();

    // Idempotency: if we already applied this exact event, do nothing (RevenueCat retries on non-2xx).
    const { data: existing } = await service
      .from("subscriptions")
      .select("last_event_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (ev.id && existing?.last_event_id === ev.id) {
      return jsonResponse({ ok: true, deduped: true });
    }

    const entitlement = ev.entitlement_ids?.[0] ?? ev.entitlement_id ?? null;
    const currentPeriodEnd = ev.expiration_at_ms
      ? new Date(ev.expiration_at_ms).toISOString()
      : null;

    const { error } = await service.from("subscriptions").upsert(
      {
        user_id: userId,
        plan: mapped.plan,
        status: mapped.status,
        will_renew: mapped.willRenew,
        rc_app_user_id: userId,
        rc_product_id: ev.product_id ?? null,
        rc_entitlement: entitlement,
        current_period_end: currentPeriodEnd,
        last_event_id: ev.id ?? null,
      },
      { onConflict: "user_id" },
    );
    if (error) throw error;

    return jsonResponse({ ok: true });
  } catch (err) {
    // Never log personal data (CLAUDE.md §6). Non-2xx makes RevenueCat retry the event.
    console.error(
      "revenuecat-webhook error:",
      err instanceof Error ? err.message : "unknown",
    );
    return jsonResponse({ error: "internal_error" }, 500);
  }
});
