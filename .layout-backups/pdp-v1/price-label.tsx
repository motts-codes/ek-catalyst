import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';

export type TaxMode = 'INC' | 'EX' | 'BOTH';

export interface Money {
  inc: string;
  ex: string;
}

export interface PricePlain {
  type: 'plain';
  money: Money;
  mode?: TaxMode;
}

export interface PriceRange {
  type: 'range';
  min: Money;
  max: Money;
  mode?: TaxMode;
}

export interface PriceSale {
  type: 'sale';
  previous: Money;
  current: Money;
  mode?: TaxMode;
}

export type Price = string | PricePlain | PriceRange | PriceSale;

interface Props {
  className?: string;
  colorScheme?: 'light' | 'dark';
  price: Price;
  // When true (and the price is a sale), render the detailed PDP layout:
  //   -XX%  <current>
  //   Price: <strikethrough original>   (1.5x smaller)
  // Defaults to false so shared surfaces (product cards, cart) keep the compact inline layout.
  showSavings?: boolean;
}

// Parse a formatted currency string (e.g. "$791.99") to a number for computing the discount.
// Returns null if it can't parse — callers must render no percentage in that case.
function parseAmount(formatted: string): number | null {
  const num = Number(formatted.replace(/[^0-9.]/g, ''));

  return Number.isFinite(num) ? num : null;
}

function discountPercent(previous: string, current: string): number | null {
  const prev = parseAmount(previous);
  const curr = parseAmount(current);

  if (prev == null || curr == null || prev <= 0 || curr >= prev) {
    return null;
  }

  return Math.round(((prev - curr) / prev) * 100);
}

// Render a formatted price (e.g. "$708.99") with the currency symbol and cents as superscript
// and the period dropped: $⁷⁰⁸ with a raised ⁹⁹. Falls back to the raw string if it doesn't match
// the expected <symbol><whole>.<cents> shape (e.g. ranges, unusual formats), so nothing breaks.
function SuperscriptPrice({ formatted }: { formatted: string }) {
  const match = formatted.match(/^(\D*)(\d[\d,]*)(?:[.,](\d+))?(\D*)$/);

  if (!match) {
    return <>{formatted}</>;
  }

  const [, symbol, whole, cents, suffix] = match;

  // Superscript pieces sit ~2px lower than the default super baseline (align-[1em] instead of
  // align-super). The whole-number portion is 1.5x the base size so it reads as the dominant price.
  return (
    <span aria-label={formatted}>
      {symbol ? (
        <span className="align-[1em] text-[0.6em]">{symbol}</span>
      ) : null}
      <span className="text-[1.5em]">{whole}</span>
      {cents ? <span className="align-[1em] text-[0.6em]">{cents}</span> : null}
      {suffix || null}
    </span>
  );
}

// The amount saved, formatted to match the store's currency string by reusing the currency
// symbol/prefix from the original price (e.g. "$791.99" → "$83.00"). Returns null when it can't
// compute. Assumes a leading currency symbol (correct for this store's USD formatting).
function savedAmount(previous: string, current: string): string | null {
  const prev = parseAmount(previous);
  const curr = parseAmount(current);

  if (prev == null || curr == null || curr >= prev) {
    return null;
  }

  const firstDigit = previous.search(/[0-9]/);
  const prefix = firstDigit > 0 ? previous.slice(0, firstDigit) : '';

  return `${prefix}${(prev - curr).toFixed(2)}`;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --price-light-text: hsl(var(--foreground));
 *   --price-light-sale-text: hsl(var(--foreground));
 *   --price-dark-text: hsl(var(--background));
 *   --price-dark-sale-text: hsl(var(--background));
 * }
 * ```
 */
export function PriceLabel({ className, colorScheme = 'light', price, showSavings = false }: Props) {
  const t = useTranslations('Components.Price');

  const baseColorClass = {
    light: 'text-[var(--price-light-text,hsl(var(--foreground)))]',
    dark: 'text-[var(--price-dark-text,hsl(var(--background)))]',
  }[colorScheme];

  if (typeof price === 'string') {
    return <span className={clsx('block font-semibold', baseColorClass, className)}>{price}</span>;
  }

  const mode: TaxMode = price.mode ?? 'EX';

  // Detailed sale layout (PDP): savings % before the current price, original price struck-through
  // on a line below. Only for actual sales — plain/range prices fall through to the default layout,
  // so products with no previous price never show a savings/original block.
  if (showSavings && price.type === 'sale' && mode !== 'BOTH') {
    const tax: 'inc' | 'ex' = mode === 'EX' ? 'ex' : 'inc';
    const previous = price.previous[tax];
    const current = price.current[tax];
    const percent = discountPercent(previous, current);
    const saved = savedAmount(previous, current);

    const saleColorClass = {
      light: 'text-[var(--price-light-sale-text,hsl(var(--foreground)))]',
      dark: 'text-[var(--price-dark-sale-text,hsl(var(--background)))]',
    }[colorScheme];

    return (
      <span className={clsx('block font-semibold', baseColorClass, className)}>
        <span className="flex items-baseline gap-2 leading-none">
          <span
            className={clsx(
              'font-[family-name:var(--font-family-heading)] font-bold',
              saleColorClass,
            )}
          >
            <span className="sr-only">{t('currentPrice', { price: current })}</span>
            <span aria-hidden="true">
              <SuperscriptPrice formatted={current} />
            </span>
          </span>
          {saved != null && percent != null && (
            <span className="text-[0.667em] font-normal">
              <span className="text-success">Save {saved}</span>{' '}
              <span className="text-error">(-{percent}%)</span>
            </span>
          )}
        </span>
        <span className="mt-[1px] block text-base font-normal text-contrast-400 line-through">
          <span className="sr-only">{t('originalPrice', { price: previous })}</span>
          <span aria-hidden="true">{previous}</span>
        </span>
      </span>
    );
  }

  if (mode === 'BOTH') {
    const includingTaxLabel = t('includingTax');
    const excludingTaxLabel = t('excludingTax');
    const includingTaxTooltip = t('includingTaxFull');
    const excludingTaxTooltip = t('excludingTaxFull');

    return (
      <span className={clsx('block font-semibold', baseColorClass, className)}>
        <span className="block">
          <PriceLine colorScheme={colorScheme} price={price} t={t} tax="inc" />{' '}
          <abbr className="cursor-help font-normal opacity-60" title={includingTaxTooltip}>
            {includingTaxLabel}
          </abbr>
        </span>
        <span className="block">
          <PriceLine colorScheme={colorScheme} dim price={price} t={t} tax="ex" />{' '}
          <abbr className="cursor-help font-normal opacity-60" title={excludingTaxTooltip}>
            {excludingTaxLabel}
          </abbr>
        </span>
      </span>
    );
  }

  const tax: 'inc' | 'ex' = mode === 'EX' ? 'ex' : 'inc';

  // PDP (showSavings) non-sale price: render the single amount with the superscript style.
  if (showSavings && price.type === 'plain') {
    return (
      <span
        className={clsx(
          'block font-[family-name:var(--font-family-heading)] font-bold',
          baseColorClass,
          className,
        )}
      >
        <SuperscriptPrice formatted={price.money[tax]} />
      </span>
    );
  }

  return (
    <span className={clsx('block font-semibold', baseColorClass, className)}>
      <PriceLine colorScheme={colorScheme} price={price} t={t} tax={tax} />
    </span>
  );
}

function PriceLine({
  price,
  tax,
  t,
  colorScheme,
  dim,
}: {
  price: PricePlain | PriceRange | PriceSale;
  tax: 'inc' | 'ex';
  t: ReturnType<typeof useTranslations<'Components.Price'>>;
  colorScheme: 'light' | 'dark';
  dim?: boolean;
}) {
  const dimClass = dim ? 'opacity-60' : undefined;
  const pick = (m: Money) => m[tax];

  if (price.type === 'plain') {
    return <span className={dimClass}>{pick(price.money)}</span>;
  }

  if (price.type === 'range') {
    return (
      <>
        <span className="sr-only">
          {t('range', { minValue: pick(price.min), maxValue: pick(price.max) })}
        </span>
        <span aria-hidden="true" className={dimClass}>
          {pick(price.min)} - {pick(price.max)}
        </span>
      </>
    );
  }

  const saleColorClass = {
    light: 'text-[var(--price-light-sale-text,hsl(var(--foreground)))]',
    dark: 'text-[var(--price-dark-sale-text,hsl(var(--background)))]',
  }[colorScheme];

  return (
    <>
      <span className="sr-only">{t('originalPrice', { price: pick(price.previous) })}</span>
      <span aria-hidden="true" className="font-normal line-through opacity-50">
        {pick(price.previous)}
      </span>{' '}
      <span className="sr-only">{t('currentPrice', { price: pick(price.current) })}</span>
      <span aria-hidden="true" className={clsx(saleColorClass, dimClass)}>
        {pick(price.current)}
      </span>
    </>
  );
}
