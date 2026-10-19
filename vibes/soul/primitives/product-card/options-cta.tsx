'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import { AddToCartCta, type ProductCardAddToCartAction } from './add-to-cart-cta';
import { type RequiredOption } from './options';
import { useCardVariant } from './variant-context';

export function SwatchAddToCart({
  id,
  option,
  action,
}: {
  id: string;
  option: RequiredOption;
  action: ProductCardAddToCartAction;
}) {
  const swatches = option.swatches ?? [];
  const state = useCardVariant();
  // Without variant data (no provider) the picker keeps its own selection.
  const [local, setLocal] = useState(
    () => swatches.find((swatch) => swatch.isDefault)?.id ?? swatches[0]?.id,
  );
  const selected = state?.selected != null ? Number(state.selected) : local;
  const current = swatches.find((swatch) => swatch.id === selected);
  const select = (valueId: number) => (state ? state.select(valueId) : setLocal(valueId));
  // Add waits until the card shows the chosen variant, and stays off for one that can't be bought.
  const blocked = state != null && (state.pending || state.variant?.purchasable === false);

  return (
    <div className="flex flex-col gap-2.5">
      <div aria-label={option.name} className="flex flex-wrap items-center gap-1" role="radiogroup">
        {swatches.map((swatch) => {
          const isSelected = swatch.id === selected;

          return (
            <button
              aria-checked={isSelected}
              aria-label={swatch.label}
              className={clsx(
                'size-6 shrink-0 rounded-full border p-[3px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)] focus-visible:ring-offset-1',
                // ~1mm (3px) of white between the colour dot and the ring: red when selected,
                // invisible otherwise (a faint hover hint). The dot carries its own hairline so
                // pale swatches (white) still read as dots.
                isSelected
                  ? 'border-[var(--button-primary-background,#d90716)]'
                  : 'border-transparent hover:border-contrast-300',
              )}
              key={swatch.id}
              onClick={() => select(swatch.id)}
              role="radio"
              title={swatch.label}
              type="button"
            >
              <span
                className="block size-full rounded-full ring-1 ring-inset ring-black/10"
                style={
                  swatch.image
                    ? { backgroundImage: `url(${swatch.image})`, backgroundSize: 'cover' }
                    : { backgroundColor: swatch.color ?? '#ccc' }
                }
              />
            </button>
          );
        })}
        {current != null && (
          <span className="ml-1 hidden min-w-0 truncate text-xs text-contrast-500 @[14rem]:inline">
            {current.label}
          </span>
        )}
      </div>
      <AddToCartCta
        action={action}
        disabled={blocked}
        id={id}
        selectedOption={selected != null ? `${option.id}:${selected}` : undefined}
      />
    </div>
  );
}
