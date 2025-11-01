import { test, expect, vi } from "vitest";
import { getPostPreviewMessage, handlePostPreview } from "../../src/handlers/postPreview";

// Mock dependencies
vi.mock("../../src/utils/time", () => ({
  getTimePreview12h: vi.fn((time: string, zones: string[]) =>
    zones.map(zone => `🕒 ${zone}: Dec 1, 2025, 10:00 AM`).join("\n")
  )
}));

vi.mock("../../src/kv/settings", () => ({
  getUserTimezone: vi.fn(async () => "Asia/Bangkok")
}));

vi.mock("../../src/menus/confirmPost", () => ({
  getPostPreviewConfirmMenu: vi.fn((lang: string) =>
    lang === "en"
      ? { keyboard: [["✅ Confirm", "❌ Cancel"]] }
      : { keyboard: [["✅ ยืนยัน", "❌ ยกเลิก"]] }
  )
}));

const mockSendMessage = vi.fn(async (chatId, message, env, keyboard) => ({
  chatId,
  message,
  keyboard
}));

(globalThis as any).sendMessage = mockSendMessage;

test("getPostPreviewMessage returns preview with text", async () => {
  const result = await getPostPreviewMessage({
    env: {},
    lang: "en",
    timezone: "Asia/Tokyo",
    post: {
      text: "Hello world",
      time: "2025-12-01T15:00:00Z"
    }
  });

  expect(result).toContain("🕒 Asia/Tokyo:");
  expect(result).toContain("Hello world");
});

test("handlePostPreview sends preview message with confirm menu", async () => {
  const env = {};
  const result = await handlePostPreview(env, 12345, 67890, "en", "2025-12-01T03:00:00Z");

  expect(mockSendMessage).toHaveBeenCalledOnce();
  expect(result.chatId).toBe(67890);
  expect(result.message).toContain("📅 Preview post time:");
  expect(result.keyboard).toEqual({ keyboard: [["✅ Confirm", "❌ Cancel"]] });
});