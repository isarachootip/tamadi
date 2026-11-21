import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveAdminLoginInput } from "../src/lib/admin-username-login.ts";

describe("Admin UI Short-Username Login Resolver", () => {
  it("resolves admin and sysadmin case-insensitively with whitespace trimmed", () => {
    assert.equal(resolveAdminLoginInput("admin"), "admin@tamadee.online");
    assert.equal(resolveAdminLoginInput("  ADMIN "), "admin@tamadee.online");
    assert.equal(resolveAdminLoginInput("sysadmin"), "sysadmin@tamadee.online");
    assert.equal(resolveAdminLoginInput("SysAdmin"), "sysadmin@tamadee.online");
  });

  it("leaves full email addresses and unknown strings untouched", () => {
    assert.equal(
      resolveAdminLoginInput("admin@tamadee.online"),
      "admin@tamadee.online"
    );
    assert.equal(
      resolveAdminLoginInput("other@example.com"),
      "other@example.com"
    );
    assert.equal(resolveAdminLoginInput("someone"), "someone");
  });
});
