import { PasswordComplexitySettings } from '@/vibes/soul/form/dynamic-form/schema';

import { ResetPasswordAction, ResetPasswordForm } from './reset-password-form';

interface Props {
  title?: string;
  subtitle?: string;
  action: ResetPasswordAction;
  submitLabel?: string;
  newPasswordLabel?: string;
  confirmPasswordLabel?: string;
  passwordComplexitySettings?: PasswordComplexitySettings | null;
}

export function ResetPasswordSection({
  title = 'Reset password',
  subtitle = 'Enter a new password below to reset your account password.',
  submitLabel,
  newPasswordLabel,
  confirmPasswordLabel,
  passwordComplexitySettings,
  action,
}: Props) {
  return (
    <div className="@container">
      <div className="flex flex-col justify-center gap-y-24 px-3 py-10 @xl:flex-row @xl:px-6 @4xl:py-20 @5xl:px-20">
        <div className="flex w-full flex-col @xl:max-w-md @xl:pr-10 @4xl:pr-20">
          <h1 className="mb-4 text-2xl font-semibold leading-none @xl:text-3xl">{title}</h1>
          <p className="mb-8 max-w-sm text-sm leading-relaxed text-contrast-500">{subtitle}</p>
          <ResetPasswordForm
            action={action}
            confirmPasswordLabel={confirmPasswordLabel}
            newPasswordLabel={newPasswordLabel}
            passwordComplexitySettings={passwordComplexitySettings}
            submitLabel={submitLabel}
          />
        </div>
      </div>
    </div>
  );
}
