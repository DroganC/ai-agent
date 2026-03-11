import { RootStore } from './rootStore.js';
import { setStoreRef } from './storeRef.js';

const rootStore = new RootStore();
setStoreRef(rootStore);
export { rootStore };

