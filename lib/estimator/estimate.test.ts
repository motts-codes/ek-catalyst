// Run with: node --test lib/estimator/estimate.test.ts  (Node 24 runs TypeScript directly)
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

// eslint-disable-next-line import/extensions -- Node's test runner needs the extension
import { cabinetRunFt, estimate, priceBookFromCollections } from './estimate.ts';

const AVON = 3289.55;

// eslint-disable-next-line @typescript-eslint/no-floating-promises -- node:test registers synchronously
describe('estimator', () => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  it('converts walls to a cabinet run, minus one corner per inside corner', () => {
    assert.equal(cabinetRunFt('l', [10, 12]), 20);
    assert.equal(cabinetRunFt('u', [10, 12, 10]), 28);
    assert.equal(cabinetRunFt('straight', [14]), 14);
    assert.equal(cabinetRunFt('galley', [10, 10]), 20);
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  it('never estimates below the minimum run', () => {
    assert.equal(cabinetRunFt('l', [2, 2]), 6);
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  it('builds the price book from live collection prices', () => {
    const book = priceBookFromCollections([3004.98, AVON, 4100]);

    assert.deepEqual(book.tenByTen, { essentials: 3004.98, premium: AVON, luxe: 4100 });
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  it('falls back when the catalog has too few prices', () => {
    assert.equal(priceBookFromCollections([AVON]).tenByTen.premium, 3300);
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  it('matches the worked example in docs/ESTIMATOR-LOGIC.md', () => {
    const book = { tenByTen: { essentials: 2800, premium: AVON, luxe: 4100 }, rtaRatio: 0.91 };
    const result = estimate(
      { layout: 'l', walls: [10, 12], ceiling: 8, island: false, package: 'premium' },
      book,
    );

    assert.equal(result.runFt, 20);
    assert.equal(result.cabinets, 3290);
    assert.equal(result.counterSqft, 42);
    assert.equal(result.countertop, 2520);
    assert.equal(result.total, 6259);
    assert.equal(result.low, 5630);
    assert.equal(result.high, 7200);
    assert.equal(result.rtaSaving, 300);
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  it('adds the island, taller uppers and the luxe extras', () => {
    const book = { tenByTen: { essentials: 2800, premium: AVON, luxe: 4100 }, rtaRatio: 0.91 };
    const plain = estimate(
      { layout: 'u', walls: [10, 12, 10], ceiling: 8, island: false, package: 'luxe' },
      book,
    );
    const loaded = estimate(
      { layout: 'u', walls: [10, 12, 10], ceiling: 10, island: true, package: 'luxe' },
      book,
    );

    assert.ok(loaded.cabinets > plain.cabinets);
    assert.ok(loaded.island > 0);
    assert.ok(
      loaded.lines
        .map((l) => l.item)
        .includes('Appliance bundle — range, hood, dishwasher, fridge'),
    );
    assert.equal(loaded.total, loaded.cabinets + loaded.island + loaded.countertop + loaded.extras);
  });
});
