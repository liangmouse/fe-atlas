import { describe, expect, it } from "vitest";

import { isAdminUser, parseAllowList } from "@/lib/auth/admin";

describe("admin auth", () => {
  it("parses allowlist values with trim and lowercase", () => {
    expect(parseAllowList(" A@a.com ,b@b.com ,,")).toEqual(["a@a.com", "b@b.com"]);
  });

  it("validates admin user by email allowlist", () => {
    const previous = process.env.ADMIN_EMAIL_ALLOWLIST;
    process.env.ADMIN_EMAIL_ALLOWLIST = "admin@example.com,test@example.com";

    expect(
      isAdminUser({ email: "Admin@Example.com" } as { email: string } & Parameters<typeof isAdminUser>[0]),
    ).toBe(true);
    expect(
      isAdminUser({ email: "guest@example.com" } as { email: string } & Parameters<typeof isAdminUser>[0]),
    ).toBe(false);

    process.env.ADMIN_EMAIL_ALLOWLIST = previous;
  });
});
