// Explicit KST offsets make these instants independent of the visitor's timezone.
export const promotions = [
  { start: Date.parse('2026-10-11T00:00:00+09:00'), end: Date.parse('2026-10-21T00:00:00+09:00'), percent: 10, period: '10.11–10.20', svg: '/svg/go-10-off.svg' },
  { start: Date.parse('2026-10-21T00:00:00+09:00'), end: Date.parse('2026-11-01T00:00:00+09:00'), percent: 5, period: '10.21–10.31', svg: '/svg/go-5-off.svg' },
];
export const regularPrices = { 8: 240000, 12: 336000, 24: 600000, 36: 864000 };
export function getPromotion(now = Date.now()) {
  return promotions.find(({ start, end }) => now >= start && now < end) ?? null;
}
export function getPrice(classes, promotion) {
  return Math.round(regularPrices[classes] * (100 - (promotion?.percent ?? 0)) / 100);
}
export function nextBoundary(now) {
  return promotions.flatMap(({ start, end }) => [start, end]).filter(time => time > now).sort((a, b) => a - b)[0];
}
