export const nowIso = () => new Date().toISOString();

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const uid = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const delay = (ms = 280) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const formatDuration = (durationMs: number) => {
  if (!Number.isFinite(durationMs) || durationMs < 0) return "--:--";
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${month}-${day} ${hours}:${minutes}`;
};

export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const maskName = (name: string, enabled: boolean) => {
  if (!enabled || name.length <= 1) return name;
  return `${name.slice(0, 1)}*${name.slice(2)}`;
};

export const copyText = async (text: string) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  const result = document.execCommand("copy");
  document.body.removeChild(el);
  return result;
};

export const shortId = (id: string) => id.replace(/^[^_]+_/, "");
