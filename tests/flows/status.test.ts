import { test, expect } from "vitest";
import { handleStatusCheck } from "../../src/handlers/flows/status";
import { createMockEnv } from "../helpers/mockEnv";

test("responds to 🤖 Check Bot Status", async () => {
  const env = createMockEnv();
  const res = await handleStatusCheck({
    env,
    userId: "123",
    chatId: 456,
    text: "🤖 Check Bot Status",
    message: {},
    request: new Request("https://example.com")
  });

  expect(res).toBeInstanceOf(Response);
  expect(env.SETTINGS.get).toHaveBeenCalled();
});