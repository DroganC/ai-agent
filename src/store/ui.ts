export { UIStore } from '../stores/uiStore';
import { rootStore } from '../stores/singleton';
export { rootStore } from '../stores/singleton';

export const uiStore = rootStore.uiStore;
