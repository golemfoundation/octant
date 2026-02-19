export const trackEventSafe = (
  category: string,
  action: string,
  label?: string,
  value?: number,
): void => {
  try {
    window._paq = window._paq || [];
    window._paq.push(['trackEvent', category, action, label, value]);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to track event:', e);
  }
};
