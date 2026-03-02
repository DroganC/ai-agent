import { AppState } from "../types/domain";

const STORAGE_KEY = "ehs_h5_training_state_v1";

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): AppState | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
};

export const clearState = () => {
  localStorage.removeItem(STORAGE_KEY);
};
