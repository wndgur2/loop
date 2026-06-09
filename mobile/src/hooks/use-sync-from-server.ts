import { useState } from 'react';

/**
 * Initialize/refresh local editable state from server data during render
 * (React's recommended alternative to a sync effect). `apply` runs once per
 * distinct non-null `key` — pass the server row's id (or the value itself)
 * so local edits are only overwritten when the server data actually changes.
 */
export function useSyncFromServer<K>(key: K | null | undefined, apply: (key: K) => void) {
  const [synced, setSynced] = useState<K | null | undefined>(undefined);
  if (key != null && key !== synced) {
    setSynced(key);
    apply(key);
  }
}
