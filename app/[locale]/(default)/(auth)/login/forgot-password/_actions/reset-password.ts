'use server';

import { BigCommerceGQLError } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';

import { schema } from '@/vibes/soul/sections/forgot-password-section/schema';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { guardForm } from '~/lib/forms/anti-spam';

const ResetPasswordMutation = graphql(`
  mutation ResetPasswordMutation($input: RequestResetPasswordInput!) {
    customer {
      requestResetPassword(input: $input) {
        __typename
        errors {
          __typename
          ... on Error {
            message
          }
        }
      }
    }
  }
`);

export const resetPassword = async (
  _lastResult: { lastResult: SubmissionResult | null; successMessage?: string },
  formData: FormData,
): Promise<{ lastResult: SubmissionResult | null; successMessage?: string }> => {
  const t = await getTranslations('Auth.Login.ForgotPassword');

  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return { lastResult: submission.reply() };
  }

  // Honeypot + BotID only (see login). A blocked bot gets the same "check your email" message
  // as a real visitor, so it cannot tell whether the address exists.
  const guard = await guardForm('forgot-password', formData, { minMs: 0, skipTiming: true });

  if (guard.blocked) {
    return {
      lastResult: submission.reply(),
      successMessage: t('confirmResetPassword', { email: submission.value.email }),
    };
  }

  try {
    const response = await client.fetch({
      document: ResetPasswordMutation,
      variables: {
        input: {
          email: submission.value.email,
          path: '/change-password',
        },
      },
      fetchOptions: {
        cache: 'no-store',
      },
    });

    const result = response.data.customer.requestResetPassword;

    if (result.errors.length > 0) {
      return {
        lastResult: submission.reply({ formErrors: result.errors.map((error) => error.message) }),
      };
    }

    return {
      lastResult: submission.reply(),
      successMessage: t('confirmResetPassword', { email: submission.value.email }),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({
          formErrors: error.errors.map(({ message }) => message),
        }),
      };
    }

    if (error instanceof Error) {
      return { lastResult: submission.reply({ formErrors: [error.message] }) };
    }

    return { lastResult: submission.reply({ formErrors: [t('somethingWentWrong')] }) };
  }
};
