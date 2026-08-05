import NextAuth, { type NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Admin (staff) authentication for the /cabinet-admin panel — SEPARATE from the shopper Auth.js
// instance in ~/auth. Google sign-in restricted to an allowlist of EK email addresses. Per-user
// identity (email in the session) is the foundation for the change log added later.
//
// Isolation from the shopper login:
//  - its own basePath (/api/admin-auth) and route handler,
//  - its own cookie name (ek-admin.session-token),
// so an admin session and a customer session never collide.
//
// Requires these env vars (server-only):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET — OAuth web-client credentials.
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

const config: NextAuthConfig = {
  basePath: '/api/admin-auth',
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
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
