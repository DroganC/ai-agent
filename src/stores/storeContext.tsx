import React from 'react';
import type { RootStore } from './rootStore';
import { RootStoreContext } from './rootStoreContext';

export function RootStoreProvider({ store, children }: { store: RootStore; children: React.ReactNode }) {
  return <RootStoreContext.Provider value={store}>{children}</RootStoreContext.Provider>;
}

