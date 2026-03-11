export type { UserInfo } from '../stores/authStore';
export { AuthStore } from '../stores/authStore';
import { rootStore } from '../stores/singleton';
export { rootStore } from '../stores/singleton';

export const authStore = rootStore.authStore;
