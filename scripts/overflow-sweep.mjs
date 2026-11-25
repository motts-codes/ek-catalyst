#!/usr/bin/env node
// Phone-width overflow sweep.
//
// Opens every page in scripts/overflow-pages.txt (one path per line, # comments) at phone and
// tablet widths in headless Chromium and reports any page whose document is wider than the
// viewport, naming the elements that stick out. Run against the local dev server by default:
//
//   node scripts/overflow-sweep.mjs                      # all pages, 390 + 768 wide
//   node scripts/overflow-sweep.mjs /faq /cart           # just these paths
//   BASE_URL=https://ek-catalyst-live-test.vercel.app node scripts/overflow-sweep.mjs
//   WIDTHS=360,390,768 node scripts/overflow-sweep.mjs
//
// Exit code 1 when any page overflows, so it can gate a deploy. Needs Playwright's Chromium
// (`pnpm exec playwright install chromium`).

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from '@playwright/test';

const here = dirname(fileURLToPath(import.meta.url));
const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const WIDTHS = (process.env.WIDTHS ?? '390,768').split(',').map((w) => Number(w.trim()));
const SETTLE_MS = Number(process.env.SETTLE_MS ?? 1500);

const argPaths = process.argv.slice(2);
const paths =
  argPaths.length > 0
    ? argPaths
    : readFileSync(join(here, 'overflow-pages.txt'), 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#'));

// Runs in the page. Returns the overflow in px and the outermost offenders, skipping fixed
// elements and anything inside a scroll container (a carousel track or a scrolling table is
// allowed to be wider than the screen; it is the page that must not be).
function probe() {
  const vw = window.innerWidth;
  const docWidth = Math.max(
    document.documentElement.scrollWidth,
    document.body ? document.body.scrollWidth : 0,
  );
  const overflow = docWidth - vw;

  const inScroller = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;

      if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true;
    }

    return false;
  };

  const describe = (el) => {
    const cls =
      typeof el.className === 'string' ? el.className.split(/\s+/).slice(0, 5).join('.') : '';
    const text = (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
    const r = el.getBoundingClientRect();

    return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${cls ? `.${cls}` : ''} right=${Math.round(r.right)} “${text}”`;
  };

  const wide = [];

  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();

    if (r.width === 0 || r.right <= vw + 1) continue;

    const style = getComputedStyle(el);

    if (style.position === 'fixed' || style.visibility === 'hidden' || style.display === 'none')
      continue;
    if (inScroller(el)) continue;
    // Keep the outermost offender only: skip an element whose parent is already listed.
    if (wide.some((w) => w.contains(el))) continue;

    wide.push(el);

    if (wide.length >= 5) break;
  }

  return { vw, docWidth, overflow, offenders: wide.map(describe) };
}

const browser = await chromium.launch();
const results = [];
let failed = 0;

for (const width of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height: 844 },
    deviceScaleFactor: 2,
    isMobile: width < 700,
    hasTouch: width < 700,
    userAgent:
      width < 700
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined,
  });
  const page = await context.newPage();

  for (const path of paths) {
    const url = `${BASE_URL}${path}`;
    let status = 0;

    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });

      status = response?.status() ?? 0;
      // Let streamed sections and lazy images land, and scroll through once so content below the
      // fold has laid out before we measure.
      await page.waitForTimeout(SETTLE_MS);
      await page.evaluate(async () => {
        const step = window.innerHeight;

        for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 60));
        }

        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(300);

      const result = await page.evaluate(probe);
      const bad = result.overflow > 1;

      if (bad) failed += 1;
      results.push({ width, path, status, ...result, bad });
      process.stdout.write(
        `${bad ? '✗' : '✓'} ${String(width).padStart(4)}  ${String(status).padStart(3)}  ${path}${bad ? `  +${result.overflow}px` : ''}\n`,
      );

      if (bad) for (const o of result.offenders) process.stdout.write(`        ${o}\n`);
    } catch (error) {
      failed += 1;
      results.push({ width, path, status, error: String(error).split('\n')[0], bad: true });
      process.stdout.write(
        `! ${String(width).padStart(4)}  ${String(status).padStart(3)}  ${path}  ${String(error).split('\n')[0]}\n`,
      );
    }
  }

  await context.close();
}

await browser.close();

const checked = results.length;
const overflowing = results.filter((r) => r.bad && !r.error);
const errored = results.filter((r) => r.error);

process.stdout.write(
  `\n${checked} checks (${paths.length} pages × ${WIDTHS.join('/')}px): ${overflowing.length} overflow, ${errored.length} failed to load.\n`,
);

if (overflowing.length > 0) {
  process.stdout.write('\nOverflowing:\n');

  for (const r of overflowing)
    process.stdout.write(`  ${r.width}px  ${r.path}  +${r.overflow}px\n`);
}

process.exit(failed > 0 ? 1 : 0);
