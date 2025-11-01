import { test, expect } from "vitest";
import {
  getUptime,
  getMemoryUsage,
  measureLatency,
  getBotVersion,
  getClientIP,
  getStatusMessage,
  handleBotStatus,
  handleServerStatus
} from "../../src/handlers/status";

test("getUptime returns formatted string", () => {
  const result = getUptime();
  expect(result).toMatch(/\d+ วัน \d+ ชั่วโมง \d+ นาที/);
});

test("getMemoryUsage returns string with MB", () => {
  const result = getMemoryUsage();
  expect(typeof result).toBe("string");
  expect(result).toMatch(/MB|ไม่สามารถตรวจสอบได้/);
});

test("measureLatency returns formatted seconds", () => {
  const start = Date.now() - 1500;
  const result = measureLatency(start);
  expect(result).toMatch(/^\d+\.\d{2} วินาที$/);
});

test("getBotVersion returns version from env", () => {
  const env = { BOT_VERSION: "1.2.3" };
  expect(getBotVersion(env)).toBe("1.2.3");
});

test("getBotVersion returns fallback if missing", () => {
  expect(getBotVersion({})).toBe("ไม่ทราบเวอร์ชัน");
});

test("getClientIP returns IP from headers", () => {
  const mockRequest = {
    headers: {
      get: (key: string) => (key === "cf-connecting-ip" ? "1.2.3.4" : null)
    }
  } as Request;
  expect(getClientIP(mockRequest)).toBe("1.2.3.4");
});

test("getClientIP returns fallback if missing", () => {
  const mockRequest = {
    headers: {
      get: () => null
    }
  } as Request;
  expect(getClientIP(mockRequest)).toBe("ไม่ทราบ IP");
});

test("getStatusMessage returns translated role and timezone", () => {
  const result = getStatusMessage({
    role: "admin",
    timezone: "Asia/Bangkok",
    lang: "th"
  });
  expect(result).toContain("ผู้ดูแลระบบ");
  expect(result).toContain("Asia/Bangkok");
});

test("getStatusMessage handles unknown role gracefully", () => {
  const result = getStatusMessage({
    role: "ghost",
    timezone: "Asia/Bangkok",
    lang: "en"
  });
  expect(result).toContain("Role: ghost");
});

test("handleBotStatus returns full status message", async () => {
  const mockRequest = {
    headers: {
      get: () => "1.2.3.4"
    }
  } as Request;
  const env = { BOT_VERSION: "1.0.0" };
  const result = await handleBotStatus(mockRequest, env, "en");
  expect(result).toContain("Telegram Scheduler");
  expect(result).toContain("Version: 1.0.0");
});

test("handleServerStatus returns full server message", async () => {
  const mockRequest = {
    headers: {
      get: () => "8.8.8.8"
    }
  } as Request;
  const env = {};
  const result = await handleServerStatus(mockRequest, env, "th");
  expect(result).toContain("สิงคโปร์");
  expect(result).toContain("8.8.8.8");
});