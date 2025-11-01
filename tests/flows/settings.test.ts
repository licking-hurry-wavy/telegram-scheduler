import { test, expect } from "vitest";
import { handleSettingsCommand } from "../../src/handlers/flows/settings";
import { createMockEnv } from "../helpers/mockEnv";

test("responds to 🛠 ตั้งค่า", async () => {
  const env = createMockEnv();
  const res = await handleSettingsCommand({
    env,
    userId: "123",
    chatId: 456,
    text: "🛠 ตั้งค่า"
  });

  expect(res).toBeInstanceOf(Response);
  expect(env.ACCESS.get).toHaveBeenCalled();
});