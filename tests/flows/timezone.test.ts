import { test, expect } from "vitest";
import { handleTimezoneFlow } from "../../src/handlers/flows/timezone";
import { createMockEnv } from "../helpers/mockEnv";

test("responds to ⏰ ตั้ง Time Zone", async () => {
  const env = createMockEnv();
  const res = await handleTimezoneFlow({
    env,
    userId: "123",
    chatId: 456,
    text: "⏰ ตั้ง Time Zone",
    message: {},
    request: new Request("https://example.com")
  });

  expect(res).toBeInstanceOf(Response);
  expect(env.DRAFT.put).toHaveBeenCalled();
});