import { test, expect } from "vitest";
import { getTimezoneKeyboard } from "../../src/handlers/keyboard";

test("getTimezoneKeyboard returns layout with city names", () => {
  const result = getTimezoneKeyboard(["Asia/Bangkok", "Asia/Tokyo", "Europe/London"], "en");

  expect(result).toEqual([
    [{ text: "Asia/Bangkok 🇹🇭" }, { text: "Asia/Tokyo 🇯🇵" }],
    [{ text: "Europe/London 🌍" }]
  ]);
});

test("getTimezoneKeyboard returns fallback layout if empty", () => {
  const result = getTimezoneKeyboard([], "th");

  expect(result).toEqual([
    [{ text: "กรุงเทพฯ 🇹🇭" }, { text: "โตเกียว 🇯🇵" }],
    [{ text: "ลอนดอน 🇬🇧" }]
  ]);
});