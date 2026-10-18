'use client';

import { getFormProps, SubmissionResult, useForm } from '@conform-to/react';
import { ReactNode, startTransition, useActionState, useEffect } from 'react';
import { requestFormReset } from 'react-dom';

import { type CartDrawerData, openCartDrawer } from '@/vibes/soul/primitives/cart-drawer/store';
import { toast } from '@/vibes/soul/primitives/toaster';
import { useRouter } from '~/i18n/routing';

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
  cartDrawer?: CartDrawerData | null;
}

export type ProductCardAddToCartAction = (
  state: State,
  payload: FormData,
) => State | Promise<State>;

interface Props {
  id: string;
  action: ProductCardAddToCartAction;
  /** A chosen option value as "optionId:valueId" (swatches on the card). */
  selectedOption?: string;
  /** Held off while the card is still switching to the chosen variant, or it can't be bought. */
  disabled?: boolean;
}

// Shared CTA look for the card (Add to Cart / Shop Now): a full-width pill, red outline and
// red label at rest, filling red left-to-right on hover like the home card's "Shop Now".
export const CTA_BUTTON_CLASS =
  'relative inline-flex min-h-10 w-full items-center justify-center overflow-hidden rounded-full border border-[var(--button-primary-background,#d90716)] bg-transparent px-3 py-2.5 text-xs font-semibold @[14rem]:px-4 @[14rem]:text-sm text-[var(--button-primary-background,#d90716)] transition-colors after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:rounded-full after:bg-[var(--button-primary-background,#d90716)] after:duration-300 after:[animation-timing-function:cubic-bezier(0,0.25,0,1)] hover:text-white hover:after:translate-x-0 disabled:opacity-50';

// "Add to Cart" CTA for no-option products: fires the add-to-cart action directly.
export function AddToCartCta({ id, action, selectedOption, disabled = false }: Props) {
  const router = useRouter();
  const [{ lastResult, successMessage, cartDrawer }, formAction, pending] = useActionState(action, {
    lastResult: null,
    successMessage: undefined,
  });

  const [form] = useForm({
    lastResult,
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        requestFormReset(event.currentTarget);
        formAction(formData);
      });
    },
  });

  useEffect(() => {
    if (lastResult?.status === 'success') {
      // The drawer shows what was added; the toast is the fallback when the cart couldn't be read.
      if (cartDrawer) openCartDrawer(cartDrawer);
      else toast.success(successMessage);

      router.refresh();
    }
  }, [lastResult, successMessage, cartDrawer, router]);

  useEffect(() => {
    form.errors?.forEach((error) => toast.error(error));
  }, [form.errors]);

  return (
    <form {...getFormProps(form)} action={formAction}>
      <input name="id" type="hidden" value={id} />
      {selectedOption != null && <input name="option" type="hidden" value={selectedOption} />}
      <button className={CTA_BUTTON_CLASS} disabled={pending || disabled} type="submit">
        Add to Cart
      </button>
    </form>
  );
}
