import { type NextRequest, NextResponse, URLPattern } from 'next/server';

import { anonymousSignIn, auth, clearAnonymousSession, getAnonymousSession } from '~/auth';

import { type ProxyFactory } from './compose-proxies';

// Path matcher for any routes that require authentication
const protectedPathPattern = new URLPattern({ pathname: `{/:locale}?/(account)/*` });
const logoutPathPattern = new URLPattern({ pathname: `{/:locale}?/logout` });
const SESSION_TOKEN_COOKIE_RE = /^(__Secure-)?authjs\.session-token(\.\d+)?=/;
const SESSION_TOKEN_NAME_RE = /^(__Secure-)?authjs\.session-token(\.\d+)?$/;
const DELETION_COOKIE_RE = /;\s*max-age=0(?:;|$)/i;
const LAX_SWEEP_PARAM = 'swept';

function redirectToLogin(url: string) {
  return NextResponse.redirect(new URL('/login', url), { status: 302 });
}

// Auth.js always sets Expires on session cookies based on session.maxAge. We strip it here
// so the cookie becomes a session cookie (expires when the browser closes), which is required
// for Essential cookie classification compliance.
function stripSessionCookieExpiry(response: Response): Response {
  const setCookies = response.headers.getSetCookie();
  // A deletion (Max-Age=0) must keep its expiry or it stops being a deletion.
  const stripped = setCookies.map((cookie) =>
    SESSION_TOKEN_COOKIE_RE.test(cookie) && !DELETION_COOKIE_RE.test(cookie)
      ? cookie.replace(/;\s*(?:expires|max-age)=[^;]+/gi, '')
      : cookie,
  );

  if (stripped.every((c, i) => c === setCookies[i])) return response;

  const modified = new Response(response.body, response);

  modified.headers.delete('set-cookie');
  stripped.forEach((cookie) => modified.headers.append('set-cookie', cookie));

  return modified;
}

// Sign-ins before 13 Nov 2026 re-wrote the session cookie as SameSite=Lax without the Partitioned
// flag (patchSessionTokenCookies in ~/auth), so those browsers hold two cookies of the same name.
// Auth.js's sign-out deletes only its Partitioned one; the Lax twin kept the visitor "signed in"
// with a token BigCommerce had already rejected, and /login ↔ /account bounced forever.
//
// Next merges Set-Cookie by name, so one response cannot delete both flavours. On the logout
// route the proxy therefore answers first with a redirect back to the same URL that deletes the
// Lax flavour (raw headers, sent as-is), and the second request runs the real sign-out.
function sweepLaxSessionCookies(req: NextRequest): NextResponse | null {
  if (req.method !== 'GET' || !logoutPathPattern.test(req.nextUrl.toString().toLowerCase())) {
    return null;
  }

  if (req.nextUrl.searchParams.has(LAX_SWEEP_PARAM)) return null;

  const names = req.cookies
    .getAll()
    .map(({ name }) => name)
    .filter((name) => SESSION_TOKEN_NAME_RE.test(name));

  if (names.length === 0) return null;

  const url = req.nextUrl.clone();

  url.searchParams.set(LAX_SWEEP_PARAM, '1');

  const response = NextResponse.redirect(url, { status: 302 });

  names.forEach((name) => {
    const secure = name.startsWith('__Secure-') ? '; Secure' : '';

    response.headers.append(
      'set-cookie',
      `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`,
    );
  });

  return response;
}

export const withAuth: ProxyFactory = (next) => {
  return async (request, event) => {
    const response = await auth(async (req) => {
      const sweep = sweepLaxSessionCookies(req);

      if (sweep) return sweep;

      const anonymousSession = await getAnonymousSession();
      const isProtectedRoute = protectedPathPattern.test(req.nextUrl.toString().toLowerCase());
      const isGetRequest = req.method === 'GET';

      // Create the anonymous session if it doesn't exist
      if (!req.auth && !anonymousSession) {
        await anonymousSignIn();
      }

      // If the user is authenticated and there is an anonymous session, clear the anonymous session
      if (req.auth && anonymousSession) {
        await clearAnonymousSession();
      }

      if (!req.auth) {
        if (isProtectedRoute && isGetRequest) {
          return redirectToLogin(req.url);
        }

        return next(req, event);
      }

      const { customerAccessToken } = req.auth.user ?? {};

      if (isProtectedRoute && isGetRequest && !customerAccessToken) {
        return redirectToLogin(req.url);
      }

      // Continue the proxy chain
      return next(req, event);
    })(request, event);

    return response ? stripSessionCookieExpiry(response) : response;
  };
};
