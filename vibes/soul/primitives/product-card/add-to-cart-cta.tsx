'use client';

import { getFormProps, SubmissionResult, useForm } from '@conform-to/react';
import { clsx } from 'clsx';
import { ReactNode, startTransition, useActionState, useEffect } from 'react';
import { requestFormReset } from 'react-dom';

import { toast } from '@/vibes/soul/primitives/toaster';
import { useRouter } from '~/i18n/routing';

import { AddToCartIcon } from './cta-icons';

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export type ProductCardAddToCartAction = (state: State, payload: FormData) => State | Promise<State>;

interface Props {
  id: string;
  action: ProductCardAddToCartAction;
}

/**
 * Icon-only "Add to Cart" CTA for no-option products: a red-outline circle with a cart icon that
 * fires the add-to-cart action directly (no label, no hover-reveal — the cart icon is universally
 * understood). Shares the PDP button's slide-fill hover.
 */
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
      <button
        aria-label="Add to cart"
        className={clsx(
          'group/cta relative inline-flex size-9 items-center justify-center overflow-hidden rounded-full border border-[var(--button-primary-background,hsl(var(--primary)))] bg-transparent text-[var(--button-primary-background,hsl(var(--primary)))] transition-colors after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:rounded-full after:bg-[var(--button-primary-background,hsl(var(--primary)))] after:duration-300 after:[animation-timing-function:cubic-bezier(0,0.25,0,1)] hover:text-white hover:after:translate-x-0 disabled:opacity-50',
        )}
        disabled={pending}
        type="submit"
      >
        <AddToCartIcon className="size-6" />
      </button>
    </form>
  );
}
