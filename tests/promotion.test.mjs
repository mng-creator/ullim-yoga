import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getPromotion, getPrice, nextBoundary } from '../src/lib/promotion.js';
import { renderPromotion, startPromotionRuntime } from '../src/lib/promotion-runtime.js';

// Minimal DOM adapter built from the actual generated HTML, exercising production selectors.
function page(path) {
  const html = readFileSync(path, 'utf8');
  const nodes = [...html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)].map(([, tag, attrs]) => {
    const attributes = Object.fromEntries([...attrs.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map(([, key, value]) => [key, value ?? '']));
    return {
      tag, attributes, hidden: 'hidden' in attributes, textContent: '',
      dataset: { classPrice: attributes['data-class-price'] },
      setAttribute(key, value) { this.attributes[key] = value; },
      removeAttribute(key) { delete this.attributes[key]; },
    };
  });
  const events = new Map();
  return {
    html, events,
    querySelectorAll(selector) { return nodes.filter(node => selector.slice(1, -1) in node.attributes); },
    addEventListener(name, fn) { events.set(name, fn); },
    removeEventListener(name) { events.delete(name); },
  };
}
const cases = [
  ['2026-10-20T23:59:59+09:00', 10, [216000, 302400, 540000, 777600]],
  ['2026-10-21T00:00:00+09:00', 5, [228000, 319200, 570000, 820800]],
  ['2026-10-31T23:59:59+09:00', 5, [228000, 319200, 570000, 820800]],
  ['2026-11-01T00:00:00+09:00', 0, [240000, 336000, 600000, 864000]],
];
for (const [time, percent, prices] of cases) {
  test(`${time}: home and price (${process.env.TZ})`, () => {
    const now = Date.parse(time);
    assert.equal(getPromotion(now)?.percent ?? 0, percent);
    const home = page('dist/index.html');
    const price = page('dist/price/index.html');
    for (const doc of [home, price]) {
      renderPromotion(doc, now);
      for (const el of doc.querySelectorAll('[data-promotion-only]')) assert.equal(el.hidden, !percent);
      for (const el of doc.querySelectorAll('[data-promotion-percent]')) assert.equal(el.textContent, percent ? `${percent}%` : '');
      for (const el of doc.querySelectorAll('[data-promotion-period]')) assert.equal(el.textContent, percent === 10 ? '10.11–10.20' : percent === 5 ? '10.21–10.31' : '');
      assert.equal(doc.querySelectorAll('[data-promotion-pending]').length, 0);
    }
    const [svg] = home.querySelectorAll('[data-promotion-svg]');
    assert.equal(svg.hidden, !percent);
    assert.equal(svg.attributes.src, percent ? `/svg/go-${percent}-off.svg` : undefined);
    assert.deepEqual(price.querySelectorAll('[data-class-price]').map(el => el.textContent), prices.map(value => `₩${value.toLocaleString('en-US')}`));
    for (const el of price.querySelectorAll('[data-regular-discount]')) assert.equal(el.hidden, !percent);
    assert.equal(price.querySelectorAll('[data-price-label]')[0].textContent, percent ? 'FINAL' : 'PRICE');
    assert.match(price.html, /₩35,000/);
    assert.match(price.html, /₩30,000/);
  });
}
test('current time and absolute UTC equivalence', () => {
  const now = Date.now();
  assert.equal(getPromotion(now), getPromotion(Date.parse(new Date(now).toISOString())));
  assert.equal(getPromotion(Date.parse('2026-10-20T15:00:00Z')).percent, 5);
  assert.equal(getPromotion(Date.parse('2026-10-10T23:59:59+09:00')), null);
  assert.equal(nextBoundary(Date.parse('2026-11-01T00:00:00+09:00')), undefined);
  for (const classes of [8, 12, 24, 36]) assert.ok(getPrice(classes, getPromotion(now)) > 0);
  console.log('Current runtime state:', new Date(now).toISOString(), getPromotion(now)?.percent ?? 0);
});
test('open tab timer, focus, visibility, pageshow and Astro navigation', () => {
  for (const path of ['dist/index.html', 'dist/price/index.html']) {
    const doc = page(path);
    let now = Date.parse('2026-10-20T23:59:59+09:00');
    const events = new Map();
    let callback, delay;
    const win = {
      setTimeout(fn, ms) { callback = fn; delay = ms; return 1; }, clearTimeout() {},
      addEventListener(name, fn) { events.set(name, fn); }, removeEventListener(name) { events.delete(name); },
    };
    const stop = startPromotionRuntime(doc, win, () => now);
    assert.equal(delay, 1000);
    now += 1000;
    callback();
    assert.equal(doc.querySelectorAll('[data-promotion-percent]')[0].textContent, '5%');
    for (const fn of [...events.values(), ...doc.events.values()]) {
      now = Date.parse('2026-11-01T00:00:00+09:00');
      fn();
      assert.ok(doc.querySelectorAll('[data-promotion-only]').every(el => el.hidden));
      now = Date.parse('2026-10-20T23:59:59+09:00');
      fn();
      assert.equal(doc.querySelectorAll('[data-promotion-percent]')[0].textContent, '10%');
    }
    stop();
    assert.equal(events.size + doc.events.size, 0);
  }
});
test('initial HTML contains no stale discount before runtime', () => {
  for (const path of ['dist/index.html', 'dist/price/index.html']) {
    const doc = page(path);
    assert.ok(doc.querySelectorAll('[data-promotion-only]').every(el => el.hidden));
    assert.ok(doc.querySelectorAll('[data-promotion-pending]').length > 0);
    assert.doesNotMatch(doc.html, /클래스 패스 10% 할인/);
  }
});
