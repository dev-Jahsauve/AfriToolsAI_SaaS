export const ADMIN_EMAIL = "superadmin@afritools.ai";
export const ADMIN_EMAIL_DOMAIN = "@afritools.ai";

export const isAdminEmail = (email: string): boolean =>
  email.trim().toLowerCase() === ADMIN_EMAIL ||
  email.trim().toLowerCase().endsWith(ADMIN_EMAIL_DOMAIN);