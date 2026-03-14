import { useCallback, useSyncExternalStore } from 'react';
import { store } from '@/lib/store';

export function useStore() {
  const subscribe = useCallback((fn: () => void) => store.subscribe(fn), []);
  const getSnapshot = useCallback(() => store.version, []);

  useSyncExternalStore(subscribe, getSnapshot);

  return store;
}
