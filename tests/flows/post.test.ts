import { test, expect, vi } from "vitest";
import { handlePostFlow } from "../../src/handlers/flows/post";

test("responds to add post command", async () => {
  const mockEnv = {
    DRAFT: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn()
    }
  };

  const res = await handlePostFlow({
    env: mockEnv,
    userId: "123",
    chatId: 456,
    text: "➕ Add Post",
    message: {},
    request: new Request("https://example.com")
  });

  expect(res).toBeInstanceOf(Response);
  expect(mockEnv.DRAFT.put).toHaveBeenCalled(); // ✅ ตรวจสอบว่า draft ถูกเซ็ต
});