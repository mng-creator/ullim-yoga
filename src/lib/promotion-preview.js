// Development-only URL override. No storage or global Date mutation.
// Offset-free values are explicitly interpreted as KST.
export function getPreviewClock(location, realNow = Date.now) {
  const value = new URLSearchParams(location.search).get('promo-preview');
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) return realNow;
  const timestamp = Date.parse(`${value}+09:00`);
  return Number.isFinite(timestamp) ? () => timestamp : realNow;
}
