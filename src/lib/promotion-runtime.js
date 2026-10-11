import { getPromotion, getPrice, nextBoundary } from './promotion.js';

export function renderPromotion(doc, now) {
  const promotion = getPromotion(now);
  const active = Boolean(promotion);
  doc.querySelectorAll('[data-promotion-only]').forEach(el => { el.hidden = !active; });
  doc.querySelectorAll('[data-promotion-period]').forEach(el => { el.textContent = promotion?.period ?? ''; });
  doc.querySelectorAll('[data-promotion-percent]').forEach(el => { el.textContent = promotion ? `${promotion.percent}%` : ''; });
  doc.querySelectorAll('[data-promotion-svg]').forEach(el => {
    el.hidden = !active;
    if (promotion) {
      el.setAttribute('src', promotion.svg);
      el.setAttribute('alt', `정식 오픈 혜택: ${promotion.period} 클래스 패스 ${promotion.percent}% 할인`);
    } else {
      el.removeAttribute('src');
      el.setAttribute('alt', '');
    }
  });
  doc.querySelectorAll('[data-class-price]').forEach(el => {
    el.textContent = `₩${getPrice(el.dataset.classPrice, promotion).toLocaleString('en-US')}`;
  });
  doc.querySelectorAll('[data-regular-discount]').forEach(el => { el.hidden = !active; });
  doc.querySelectorAll('[data-price-label]').forEach(el => { el.textContent = active ? 'FINAL' : 'PRICE'; });
  doc.querySelectorAll('[data-promotion-pending]').forEach(el => { el.removeAttribute('data-promotion-pending'); });
}

export function startPromotionRuntime(doc = document, win = window, now = Date.now) {
  let timer;
  const refresh = () => {
    win.clearTimeout(timer);
    const current = now();
    renderPromotion(doc, current);
    const boundary = nextBoundary(current);
    // Recheck at least once a minute for clock changes; avoid setTimeout overflow.
    timer = win.setTimeout(refresh, boundary ? Math.min(60000, Math.max(1, boundary - current)) : 60000);
  };
  doc.addEventListener('visibilitychange', refresh);
  doc.addEventListener('astro:page-load', refresh);
  win.addEventListener('pageshow', refresh);
  win.addEventListener('focus', refresh);
  refresh();
  return () => {
    win.clearTimeout(timer);
    doc.removeEventListener('visibilitychange', refresh);
    doc.removeEventListener('astro:page-load', refresh);
    win.removeEventListener('pageshow', refresh);
    win.removeEventListener('focus', refresh);
  };
}
