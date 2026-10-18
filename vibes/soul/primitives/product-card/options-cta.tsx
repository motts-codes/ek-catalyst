'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import { AddToCartCta, type ProductCardAddToCartAction } from './add-to-cart-cta';
import { type RequiredOption } from './options';

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
  const [selected, setSelected] = useState(
    () => swatches.find((swatch) => swatch.isDefault)?.id ?? swatches[0]?.id,
  );
  const current = swatches.find((swatch) => swatch.id === selected);

  return (
    <div className="flex flex-col gap-2.5">
      <div aria-label={option.name} className="flex items-center gap-2" role="radiogroup">
        {swatches.map((swatch) => {
          const isSelected = swatch.id === selected;

          return (
            <button
              aria-checked={isSelected}
              aria-label={swatch.label}
              className={clsx(
                'box-content size-4 rounded-full border p-[3px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-primary-background,#d90716)]',
                isSelected
                  ? 'border-[var(--button-primary-background,#d90716)]'
                  : 'border-transparent hover:border-contrast-300',
              )}
              key={swatch.id}
              onClick={() => setSelected(swatch.id)}
              role="radio"
              title={swatch.label}
              type="button"
            >
              <span
                className="block size-full rounded-full border border-black/10"
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
          <span className="ml-1 truncate text-xs text-contrast-500">{current.label}</span>
        )}
      </div>
      <AddToCartCta
        action={action}
        id={id}
        selectedOption={selected != null ? `${option.id}:${selected}` : undefined}
      />
    </div>
  );
}
