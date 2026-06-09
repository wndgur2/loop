import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Web static rendering support: the color scheme must be recomputed on the client.
 * useSyncExternalStore returns the server snapshot (false) and then switches to the client
 * snapshot (true) after hydration, so no effect-based setState hydration flag is needed.
 */
const subscribe = () => () => {};

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
