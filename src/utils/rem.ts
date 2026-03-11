type SetupRemOptions = {
  designWidth?: number;
  rootValue?: number;
  minFontSize?: number;
  maxFontSize?: number;
};

export function setupRem(options: SetupRemOptions = {}) {
  const {
    designWidth = 375,
    rootValue = 37.5,
    minFontSize = 32,
    maxFontSize = 54,
  } = options;

  const docEl = document.documentElement;

  const refresh = () => {
    const width = Math.min(window.innerWidth, 540);
    const next = (width / designWidth) * rootValue;
    const clamped = Math.max(minFontSize, Math.min(maxFontSize, next));
    docEl.style.fontSize = `${clamped}px`;
  };

  refresh();
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('orientationchange', refresh, { passive: true });

  return () => {
    window.removeEventListener('resize', refresh);
    window.removeEventListener('orientationchange', refresh);
  };
}

