import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

import { LoopColors } from '@/constants/loop-theme';

/**
 * Pull-to-refresh element for list/scroll screens backed by a query.
 * Tracks its own `refreshing` so background refetches (e.g. invalidations)
 * don't surface the spinner — it only shows for an actual pull gesture.
 */
export function usePullToRefresh(refetch: () => Promise<unknown>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={LoopColors.warm}
      colors={[LoopColors.warm]}
    />
  );
}
