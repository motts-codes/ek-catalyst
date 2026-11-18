import NextAuth, { type NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

// Admin (staff) authentication for the /cabinet-admin panel — SEPARATE from the shopper Auth.js
// instance in ~/auth. Google or Microsoft (Entra ID / Microsoft 365) sign-in, restricted to an
// allowlist of EK email addresses. Per-user identity (email in the session) is the foundation for
// the change log added later.
//
// Isolation from the shopper login:
//  - its own basePath (/api/admin-auth) and route handler,
//  - its own cookie name (ek-admin.session-token),
// so an admin session and a customer session never collide.
//
// Requires these env vars (server-only):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET — Google OAuth web-client credentials.
//   MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID — Entra ID app registration
//     (optional; the Microsoft button only appears once all three are set). EK staff are on
//     Microsoft 365, so this is their sign-in; Google stays for the agency.
//   EK_ADMIN_EMAILS — comma-separated allowlist of permitted staff emails.
//   AUTH_SECRET — reused to sign the session (already set).

function allowedEmails(): string[] {
  return (process.env.EK_ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  return allowedEmails().includes(email.toLowerCase());
}

const microsoft = {
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  tenantId: process.env.MICROSOFT_TENANT_ID,
};

// True once the Entra ID app registration is configured, so the login form can offer the button.
export function hasMicrosoftSignIn(): boolean {
  return Boolean(microsoft.clientId && microsoft.clientSecret && microsoft.tenantId);
}

// Entra ID returns the work address as `email` when the email scope is granted; `preferred_username`
// (the UPN, the same address on Microsoft 365) is the fallback should a tenant withhold it. No
// profile photo and no Graph scope: the image would otherwise be inlined base64 into the session
// cookie, and only the email is needed for the allowlist and attribution.
const microsoftProvider = () =>
  MicrosoftEntraID({
    clientId: microsoft.clientId,
    clientSecret: microsoft.clientSecret,
    issuer: `https://login.microsoftonline.com/${microsoft.tenantId ?? ''}/v2.0`,
    authorization: { params: { scope: 'openid profile email' } },
    profile: (profile) => ({
      id: profile.sub,
      name: profile.name,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- typed as always set, not guaranteed by every tenant
      email: profile.email ?? profile.preferred_username,
      image: null,
    }),
  });

const config: NextAuthConfig = {
  basePath: '/api/admin-auth',
  secret: process.env.AUTH_SECRET,
  // Trust the request host to build callback URLs. Required for the OAuth flow to work without an
  // explicit AUTH_URL per environment (localhost dev + Vercel preview). This is an internal,
  // allowlist-gated staff tool, so trusting the host is appropriate.
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    ...(hasMicrosoftSignIn() ? [microsoftProvider()] : []),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/cabinet-admin',
    error: '/cabinet-admin',
  },
  callbacks: {
    // Only allow sign-in for allowlisted EK emails; everyone else is rejected at the door.
    signIn({ profile, user }) {
      const email = profile?.email ?? user?.email;

      return isAllowedAdminEmail(email);
    },
    // Carry the email onto the token/session so saves can attribute changes to a person.
    jwt({ token, profile }) {
      if (profile?.email) {
        token.email = profile.email;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email;
      }

      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: 'ek-admin.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
      },
    },
  },
};

export const {
  handlers: adminAuthHandlers,
  auth: adminAuth,
  signIn: adminSignIn,
  signOut: adminSignOut,
} = NextAuth(config);

/** True when the current request has a valid, allowlisted admin session. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await adminAuth();

  return isAllowedAdminEmail(session?.user?.email);
}

/** The signed-in admin's email (for attribution), or null. */
export async function getAdminEmail(): Promise<string | null> {
  const session = await adminAuth();

  return session?.user?.email && isAllowedAdminEmail(session.user.email)
    ? session.user.email
    : null;
}
