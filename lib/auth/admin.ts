import type { User } from "@supabase/supabase-js";

export function parseAllowList(raw: string | undefined) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: User | null) {
  if (!user?.email) return false;

  const allowList = parseAllowList(process.env.ADMIN_EMAIL_ALLOWLIST);
  if (allowList.length === 0) return false;

  return allowList.includes(user.email.toLowerCase());
}
