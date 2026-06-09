import type { TKey } from '@/lib/translations';
import type { Importance } from '@/types/models';

/** Translation key for an importance level label. */
export function impLabelKey(imp: Importance): TKey {
  return imp === 'high' ? 'imp.high' : imp === 'low' ? 'imp.low' : 'imp.mid';
}
