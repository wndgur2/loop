import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * 웹 정적 렌더링 지원: 색상 스킴은 클라이언트에서 다시 계산해야 한다.
 * useSyncExternalStore는 서버 스냅샷(false)을 주다가 hydration 후 클라이언트
 * 스냅샷(true)으로 바뀌므로, effect에서 setState 하는 hydration 플래그가 필요 없다.
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
