'use client';

import { getFormProps, SubmissionResult, useForm } from '@conform-to/react';
import { ReactNode, startTransition, useActionState, useEffect } from 'react';
import { requestFormReset } from 'react-dom';

import { toast } from '@/vibes/soul/primitives/toaster';
import { useRouter } from '~/i18n/routing';

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export type ProductCardAddToCartAction = (
  state: State,
  payload: FormData,
) => State | Promise<State>;

interface Props {
  id: string;
  action: ProductCardAddToCartAction;
}

// Shared CTA look for the card (Add to Cart / View Options): a full-width pill, red outline and
// red label at rest, filling red left-to-right on hover like the home card's "Shop Now".
export const CTA_BUTTON_CLASS =
  'relative inline-flex min-h-9 w-full items-center justify-center overflow-hidden rounded-full border border-[var(--button-primary-background,#d90716)] bg-transparent px-4 text-sm font-semibold text-[var(--button-primary-background,#d90716)] transition-colors after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:rounded-full after:bg-[var(--button-primary-background,#d90716)] after:duration-300 after:[animation-timing-function:cubic-bezier(0,0.25,0,1)] hover:text-white hover:after:translate-x-0 disabled:opacity-50';

// "Add to Cart" CTA for no-option products: fires the add-to-cart action directly.
export function AddToCartCta({ id, action }: Props) {
  const router = useRouter();
  const [{ lastResult, successMessage }, formAction, pending] = useActionState(action, {
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
      toast.success(successMessage);
      router.refresh();
    }
  }, [lastResult, successMessage, router]);

  useEffect(() => {
    form.errors?.forEach((error) => toast.error(error));
  }, [form.errors]);

  return (
    <form {...getFormProps(form)} action={formAction}>
      <input name="id" type="hidden" value={id} />
      <button className={CTA_BUTTON_CLASS} disabled={pending} type="submit">
        Add to Cart
      </button>
    </form>
  );
}
