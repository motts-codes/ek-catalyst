import { getTranslations } from 'next-intl/server';

import { getAccountGreeting } from '../page-data';

// "Welcome back, Arun" plus the signed-in email, above the account menu. First name only: a
// surname would need a title we do not collect. No first name on file → just "Welcome back".
export async function AccountGreeting() {
  const [customer, t] = await Promise.all([
    getAccountGreeting(),
    getTranslations('Account.Layout'),
  ]);

  if (!customer) return null;

  return (
    <div className="mb-5 border-b border-contrast-100 px-3 pb-5">
      <p className="break-words font-heading text-xl font-semibold leading-tight">
        {customer.firstName
          ? t.rich('welcome', {
              firstName: customer.firstName,
              name: (chunks) => (
                <span className="text-[var(--button-primary-background,#d90716)]">{chunks}</span>
              ),
            })
          : t('welcomeNoName')}
      </p>
      {/* Wraps rather than truncates: the whole address must be readable. */}
      <p className="mt-1 break-all text-xs leading-snug text-contrast-500">
        {t('signedInAs', { email: customer.email })}
      </p>
    </div>
  );
}
