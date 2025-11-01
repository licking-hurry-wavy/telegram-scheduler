import { test, expect, vi } from "vitest";
import {
  isValidTimezone,
  formatLocalTime,
  getCurrentTimeInTimezone,
  getTimePreview12h,
  getTimezoneFromCoordinates
} from "../../src/utils/time";

test("valid timezone", () => {
  expect(isValidTimezone("Asia/Bangkok")).toBe(true);
  expect(isValidTimezone("Invalid/Zone")).toBe(false);
});

test("format localized time", () => {
  const iso = "2025-12-01T15:00:00Z"; // UTC
  const resultEn = formatLocalTime(iso, "Asia/Bangkok", "en");
  const resultTh = formatLocalTime(iso, "Asia/Bangkok", "th");

  expect(resultEn).toMatch(/^2025-12-01 22:00$/); // UTC+7
  expect(resultTh).toMatch(/^2025-12-01 22:00$/);
});

test("get current time in timezone returns string", () => {
  const result = getCurrentTimeInTimezone("Asia/Bangkok");
  expect(typeof result).toBe("string");
  expect(result.length).toBeGreaterThan(5);
});

test("getTimePreview12h returns formatted preview", () => {
  const preview = getTimePreview12h("2025-12-01T15:00:00Z", [
    "Asia/Bangkok",
    "Asia/Tokyo"
  ]);

  expect(preview).toContain("🕒 Asia/Bangkok:");
  expect(preview).toContain("🕒 Asia/Tokyo:");
  expect(preview.split("\n").length).toBe(2);
});

test("getTimezoneFromCoordinates returns timezone from mock API", async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    json: async () => ({
      timezone: { ianaTimeId: "Asia/Bangkok" }
    })
  });

  globalThis.fetch = mockFetch;

  const tz = await getTimezoneFromCoordinates(13.75, 100.5);
  expect(tz).toBe("Asia/Bangkok");
  expect(mockFetch).toHaveBeenCalledOnce();
});