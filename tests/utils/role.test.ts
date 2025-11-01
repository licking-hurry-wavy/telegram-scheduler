import { test, expect } from "vitest";
import { isPrivileged, isDeveloper } from "../../src/utils/role";

test("privileged roles", () => {
  expect(isPrivileged("admin")).toBe(true);
  expect(isPrivileged("developer")).toBe(true);
  expect(isPrivileged("editor")).toBe(false);
  expect(isPrivileged("user")).toBe(false);
});

test("developer role", () => {
  expect(isDeveloper("developer")).toBe(true);
  expect(isDeveloper("admin")).toBe(false);
});