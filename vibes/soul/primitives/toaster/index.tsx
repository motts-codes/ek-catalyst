'use client';

import { ReactNode } from 'react';
import { Toaster as Sonner, toast as SonnerToast } from 'sonner';

import { Alert } from '@/vibes/soul/primitives/alert';

type ToasterProps = React.ComponentProps<typeof Sonner>;

interface ToastOptions {
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
  position?: ToasterProps['position'];
  dismissLabel?: string;
  /** How long the toast stays, in ms (Sonner's default otherwise). */
  duration?: number;
}

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'group focus-visible:ring-0 right-0',
        },
      }}
      {...props}
    />
  );
};

// The action button closes the toast once pressed: a second press must not repeat the action
// (the cart's Undo re-adds the line every time it is run).
function once(options: ToastOptions | undefined, dismiss: () => void): ToastOptions | undefined {
  const action = options?.action;

  if (!action) return options;

  let done = false;

  return {
    ...options,
    action: {
      label: action.label,
      onClick: () => {
        if (done) return;

        done = true;
        dismiss();
        action.onClick();
      },
    },
  };
}

export const toast = {
  success: (message: ReactNode, options?: ToastOptions) => {
    const position = options?.position;

    const toastId = SonnerToast(
      <Alert
        message={message}
        onDismiss={() => SonnerToast.dismiss(toastId)}
        variant="success"
        {...once(options, () => SonnerToast.dismiss(toastId))}
      />,
      { position, duration: options?.duration },
    );
  },
  error: (message: ReactNode, options?: ToastOptions) => {
    const position = options?.position;

    const toastId = SonnerToast(
      <Alert
        message={message}
        onDismiss={() => SonnerToast.dismiss(toastId)}
        variant="error"
        {...once(options, () => SonnerToast.dismiss(toastId))}
      />,
      { position },
    );
  },
  warning: (message: ReactNode, options?: ToastOptions) => {
    const position = options?.position;

    const toastId = SonnerToast(
      <Alert
        message={message}
        onDismiss={() => SonnerToast.dismiss(toastId)}
        variant="warning"
        {...once(options, () => SonnerToast.dismiss(toastId))}
      />,
      { position },
    );
  },
  info: (message: ReactNode, options?: ToastOptions) => {
    const position = options?.position;

    const toastId = SonnerToast(
      <Alert
        message={message}
        onDismiss={() => SonnerToast.dismiss(toastId)}
        variant="info"
        {...once(options, () => SonnerToast.dismiss(toastId))}
      />,
      { position },
    );
  },
};
