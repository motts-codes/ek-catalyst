import { adminAuthHandlers } from '~/lib/cabinet-admin/admin-auth';

// Route handler for the admin (staff) Google auth instance — separate from the shopper auth at
// /api/auth. basePath is /api/admin-auth (set in admin-auth.ts).
export const { GET, POST } = adminAuthHandlers;
