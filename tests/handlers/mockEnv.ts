import { vi } from "vitest";

/**
 * สร้าง mock KV environment สำหรับใช้ใน unit test
 * รองรับทุก namespace ที่ใช้ในระบบบอท
 */
export function createMockEnv(overrides: Partial<any> = {}) {
  return {
    DRAFT: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn(),
      delete: vi.fn()
    },
    SETTINGS: {
      get: vi.fn().mockResolvedValue(JSON.stringify({ language: "th", timezone: "Asia/Bangkok" })),
      put: vi.fn()
    },
    ACCESS: {
      get: vi.fn().mockResolvedValue("admin"),
      put: vi.fn()
    },
    META: {
      put: vi.fn()
    },
    QUEUE: {
      list: vi.fn().mockResolvedValue({ keys: [] }),
      get: vi.fn().mockResolvedValue("[]"),
      put: vi.fn(),
      delete: vi.fn()
    },
    DB: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn(),
      delete: vi.fn()
    },
    MEDIA: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn(),
      delete: vi.fn()
    },
    SCHEDULE: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn(),
      delete: vi.fn()
    },
    USER: {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn(),
      delete: vi.fn()
    },
    ...overrides
  };
}