import { createContext } from 'react';
import type { RootStore } from './rootStore';

export const RootStoreContext = createContext<RootStore | null>(null);

