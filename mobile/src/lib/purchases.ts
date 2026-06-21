/**
 * RevenueCat (in-app purchase) wrapper — payments, adr-0006.
 *
 * Guarded so it NEVER crashes on web / Expo Go / when the SDK key is unset: those degrade to the
 * free tier, so the paywall UI stays previewable. The real purchase flow only runs on a device dev
 * build configured with RevenueCat. Entitlement is mirrored server-side by the webhook → the
 * `subscriptions` table is the durable source of truth; this device-side info is just for instant UX.
 */
import { Platform } from 'react-native';

import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

/** The entitlement identifier configured in the RevenueCat dashboard. */
export const PRO_ENTITLEMENT = 'pro';

function apiKey(): string | undefined {
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS,
    android: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID,
    default: undefined,
  });
}

/** Whether IAP can actually run here (native platform + a configured key). */
export function purchasesAvailable(): boolean {
  return Platform.OS !== 'web' && !!apiKey();
}

// Loaded lazily and only when available, so web never bundles/executes the native path.
let mod: typeof import('react-native-purchases') | null = null;
let configured = false;

async function getPurchases() {
  if (!purchasesAvailable()) return null;
  if (!mod) mod = await import('react-native-purchases');
  const Purchases = mod.default;
  if (!configured) {
    Purchases.configure({ apiKey: apiKey()! });
    configured = true;
  }
  return Purchases;
}

/** Configure the SDK once (no-op when unavailable). Safe to call on every app start. */
export async function initPurchases(): Promise<void> {
  await getPurchases();
}

/** Identify the RevenueCat customer as the Supabase user, so the webhook's app_user_id matches. */
export async function loginPurchases(userId: string): Promise<void> {
  const Purchases = await getPurchases();
  if (!Purchases) return;
  try {
    await Purchases.logIn(userId);
  } catch {
    // Best-effort: entitlement still reconciles server-side via the webhook.
  }
}

export async function logoutPurchases(): Promise<void> {
  const Purchases = await getPurchases();
  if (!Purchases) return;
  try {
    await Purchases.logOut();
  } catch {
    // ignore
  }
}

/** The Pro offering's first package (what we sell), or null when unavailable/not configured. */
export async function getProPackage(): Promise<PurchasesPackage | null> {
  const Purchases = await getPurchases();
  if (!Purchases) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages[0] ?? null;
  } catch {
    return null;
  }
}

function hasPro(info: CustomerInfo): boolean {
  return !!info.entitlements.active[PRO_ENTITLEMENT];
}

/** Purchase Pro. Returns {purchased, cancelled}. Throws on real errors (not on user cancel). */
export async function purchasePro(): Promise<{ purchased: boolean; cancelled: boolean }> {
  const Purchases = await getPurchases();
  if (!Purchases) return { purchased: false, cancelled: false };
  const pkg = await getProPackage();
  if (!pkg) throw new Error('no_offering');
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { purchased: hasPro(customerInfo), cancelled: false };
  } catch (e: unknown) {
    if (
      e &&
      typeof e === 'object' &&
      'userCancelled' in e &&
      (e as { userCancelled?: boolean }).userCancelled
    ) {
      return { purchased: false, cancelled: true };
    }
    throw e;
  }
}

/** Restore purchases. Returns whether Pro is active afterward. */
export async function restorePurchases(): Promise<boolean> {
  const Purchases = await getPurchases();
  if (!Purchases) return false;
  const info = await Purchases.restorePurchases();
  return hasPro(info);
}

/** Current entitlement read from the device (instant; complements the server subscriptions row). */
export async function isProActive(): Promise<boolean> {
  const Purchases = await getPurchases();
  if (!Purchases) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return hasPro(info);
  } catch {
    return false;
  }
}
