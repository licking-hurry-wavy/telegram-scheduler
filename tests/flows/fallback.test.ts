import { test, expect } from "vitest";
import { handleFallback } from "../../src/handlers/flows/fallback";
import { createMockEnv } from "../helpers/mockEnv";

test("responds with fallback message", async () => {
  const env = createMockEnv();
  const res = await handleFallback({
    env,
    userId: "123",
    chatId: 456,
    text: "ไม่เข้าใจคำสั่ง",
    message: {},
    request: new Request("https://example.com")
  });

  expect(res).toBeInstanceOf(Response);
  expect(env.SETTINGS.get).toHaveBeenCalled();
});