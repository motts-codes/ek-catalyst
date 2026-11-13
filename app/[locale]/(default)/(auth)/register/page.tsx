import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { type FormStep } from '@/vibes/soul/form/dynamic-form';
import { Field } from '@/vibes/soul/form/dynamic-form/schema';
import { DynamicFormSection } from '@/vibes/soul/sections/dynamic-form-section';
import {
  formFieldTransformer,
  injectCountryCodeOptions,
} from '~/data-transformers/form-field-transformer';
import {
  CUSTOMER_FIELDS_TO_EXCLUDE,
  REGISTER_CUSTOMER_FORM_LAYOUT,
  transformFieldsToLayout,
} from '~/data-transformers/form-field-transformer/utils';
import { getAudienceMode } from '~/lib/navigation/audience-mode';
import { type AudienceMode } from '~/lib/navigation/menu-config';
import { getRecaptchaSiteKey } from '~/lib/recaptcha';
import { exists } from '~/lib/utils';

import { ADDRESS_FIELDS_NAME_PREFIX, CUSTOMER_FIELDS_NAME_PREFIX } from './_actions/prefixes';
import { registerCustomer } from './_actions/register-customer';
import { getRegisterCustomerQuery } from './page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'Auth.Register' });

  return {
    title: t('title'),
  };
}

// There is currently a GraphQL gap where the "Exclusive Offers" field isn't accounted for
// during customer registration, so the field should not be shown on the Catalyst storefront until it is hooked up.
function removeExlusiveOffersField(field: Field | Field[]): boolean {
  if (Array.isArray(field)) {
    // Exclusive offers field will always have ID '25', since it is made upon store creation and is also read-only.
    return !field.some((f) => f.id === '25');
  }

  return field.id !== '25';
}

// Three short steps instead of one long form. Built-in fields are placed by name; any custom
// fields the store adds go with the group they belong to (address or customer). An empty step
// is dropped.
const ACCOUNT_NAMES = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
const ADDRESS_NAMES = [
  'address1',
  'address2',
  'city',
  'stateOrProvince',
  'postalCode',
  'countryCode',
];

function registerSteps(fields: Array<Field | Field[]>): FormStep[] {
  const names = fields
    .flatMap((field) => (Array.isArray(field) ? field : [field]))
    .map((f) => f.name);
  const isAddress = (name: string) =>
    ADDRESS_NAMES.includes(name) || name.startsWith(ADDRESS_FIELDS_NAME_PREFIX);
  const account = names.filter((name) => ACCOUNT_NAMES.includes(name));
  const address = names.filter(isAddress);
  const details = names.filter((name) => !ACCOUNT_NAMES.includes(name) && !isAddress(name));

  return [
    { title: 'Your account', names: account },
    { title: 'About you', names: details },
    { title: 'Your address', names: address },
  ].filter((step) => step.names.length > 0);
}

// Trade-only fields. A homeowner has no company name or property / unit to give, so those two
// optional fields appear only in the header's Pro mode (the `ek_audience` cookie). The header
// toggle reloads the page, so flipping it on this form shows or hides them at once. Nothing new
// is sent to BigCommerce. (13 Nov 2026: replaces an in-form "I am a" switch; the client wants
// the header toggle to be the one deciding factor.)
const TRADE_ONLY_LABELS = ['Company Name', 'Property Name and Unit #'];

function isTradeOnly(field: Field): boolean {
  return (
    field.name === 'company' ||
    TRADE_ONLY_LABELS.some((label) => field.name.endsWith(label) || field.label === label)
  );
}

function forAudience(
  fields: Array<Field | Field[]>,
  audience: AudienceMode,
): Array<Field | Field[]> {
  if (audience === 'pro') return fields;

  return fields
    .map((field) => (Array.isArray(field) ? field.filter((f) => !isTradeOnly(f)) : field))
    .filter((field) => (Array.isArray(field) ? field.length > 0 : !isTradeOnly(field)));
}

export default async function Register({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Auth.Register');

  const registerCustomerData = await getRegisterCustomerQuery({
    address: { sortBy: 'SORT_ORDER' },
    customer: { sortBy: 'SORT_ORDER' },
  });

  if (!registerCustomerData) {
    notFound();
  }

  const { addressFields, customerFields, countries, passwordComplexitySettings } =
    registerCustomerData;

  const [recaptchaSiteKey, audience] = await Promise.all([
    getRecaptchaSiteKey(),
    getAudienceMode(),
  ]);

  const baseFields = transformFieldsToLayout(
    [
      ...addressFields.map((field) => {
        if (!field.isBuiltIn) {
          return {
            ...field,
            name: `${ADDRESS_FIELDS_NAME_PREFIX}${field.label}`,
          };
        }

        return field;
      }),
      ...customerFields.map((field) => {
        if (!field.isBuiltIn) {
          return {
            ...field,
            name: `${CUSTOMER_FIELDS_NAME_PREFIX}${field.label}`,
          };
        }

        return field;
      }),
    ].filter((field) => !CUSTOMER_FIELDS_TO_EXCLUDE.includes(field.entityId)),
    REGISTER_CUSTOMER_FORM_LAYOUT,
  )
    .map((field) => {
      if (Array.isArray(field)) {
        return field.map(formFieldTransformer).filter(exists);
      }

      return formFieldTransformer(field);
    })
    .filter(exists)
    .map((field) => {
      if (Array.isArray(field)) {
        return field.map((f) => injectCountryCodeOptions(f, countries ?? []));
      }

      return injectCountryCodeOptions(field, countries ?? []);
    })
    .filter(exists)
    .filter(removeExlusiveOffersField);

  const fields = forAudience(baseFields, audience);

  return (
    <DynamicFormSection
      action={registerCustomer}
      errorTranslations={{
        firstName: {
          invalid_type: t('FieldErrors.firstNameRequired'),
        },
        lastName: {
          invalid_type: t('FieldErrors.lastNameRequired'),
        },
        email: {
          invalid_type: t('FieldErrors.emailRequired'),
          invalid_string: t('FieldErrors.emailInvalid'),
        },
        password: {
          invalid_type: t('FieldErrors.passwordRequired'),
          too_small: t('FieldErrors.passwordTooSmall', {
            minLength: passwordComplexitySettings?.minimumPasswordLength ?? 0,
          }),
          lowercase_required: t('FieldErrors.passwordLowercaseRequired'),
          uppercase_required: t('FieldErrors.passwordUppercaseRequired'),
          number_required: t('FieldErrors.passwordNumberRequired', {
            minNumbers: passwordComplexitySettings?.minimumNumbers ?? 1,
          }),
          special_character_required: t('FieldErrors.passwordSpecialCharacterRequired'),
          passwords_must_match: t('FieldErrors.passwordsMustMatch'),
        },
        confirmPassword: {
          invalid_type: t('FieldErrors.passwordRequired'),
        },
        address1: {
          invalid_type: t('FieldErrors.addressLine1Required'),
        },
        city: {
          invalid_type: t('FieldErrors.cityRequired'),
        },
        countryCode: {
          invalid_type: t('FieldErrors.countryRequired'),
        },
        stateOrProvince: {
          invalid_type: t('FieldErrors.stateRequired'),
        },
        postalCode: {
          invalid_type: t('FieldErrors.postalCodeRequired'),
        },
      }}
      fields={fields}
      passwordComplexity={passwordComplexitySettings}
      recaptchaSiteKey={recaptchaSiteKey}
      steps={registerSteps(fields)}
      submitLabel={t('cta')}
      title={t('heading')}
    />
  );
}
