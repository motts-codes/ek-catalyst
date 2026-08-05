'use client';

import { useActionState } from 'react';

import { type ActionResult, loginAction } from '../actions';

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={formAction} className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">Cabinet Admin</h1>
      <p className="mt-1 text-sm text-gray-500">Enter the admin password to continue.</p>

      <label className="mt-6 block text-sm font-medium text-gray-700" htmlFor="password">
        Password
      </label>
      <input
        autoComplete="current-password"
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
        id="password"
        name="password"
        required
        type="password"
      />

      {state?.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}

      <button
        className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
        disabled={pending}
        type="submit"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
