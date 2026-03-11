import { useContext } from 'react';
import { RootStoreContext } from './rootStoreContext';
import type { RootStore } from './rootStore';

export function useStores(): RootStore {
  const store = useContext(RootStoreContext);
  if (!store) throw new Error('RootStoreProvider is missing');
  return store;
}

