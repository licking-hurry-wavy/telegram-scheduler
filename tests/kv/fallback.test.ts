import { test, expect } from "vitest";
import { getKVNamespace } from "../../src/kv/fallback";

test("getKVNamespace returns default namespace if binding missing", () => {
  const result = getKVNamespace(undefined);
  expect(result.name).toBe("default");
});

test("getKVNamespace returns named namespace if provided", () => {
  const result = getKVNamespace({ name: "posts" });
  expect(result.name).toBe("posts");
});