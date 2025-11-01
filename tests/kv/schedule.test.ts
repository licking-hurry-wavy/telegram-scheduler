import { test, expect, beforeEach } from "vitest";
import {
  getScheduleByUser,
  saveSchedule,
  deleteSchedule,
  clearScheduleMock
} from "../../src/kv/schedule.mock";

beforeEach(() => {
  clearScheduleMock();
});

test("saveSchedule stores data", async () => {
  await saveSchedule("user123", { time: "2025-12-01T10:00:00Z", text: "Hello" });
  const result = await getScheduleByUser("user123");
  expect(result).toEqual({ time: "2025-12-01T10:00:00Z", text: "Hello" });
});

test("getScheduleByUser returns null if not found", async () => {
  const result = await getScheduleByUser("ghost");
  expect(result).toBeNull();
});

test("save and retrieve draft schedule", async () => {
  await saveSchedule("user123", { step: "start", text: "" });
  const result = await getScheduleByUser("user123");
  expect(result).toEqual({ step: "start", text: "" });
});

test("delete schedule removes entry", async () => {
  await saveSchedule("user123", { step: "start" });
  await deleteSchedule("user123");
  const result = await getScheduleByUser("user123");
  expect(result).toBeNull();
});

test("schedule expires after TTL", async () => {
  await saveSchedule("user123", { step: "start" }, 1); // TTL 1 second
  await new Promise(res => setTimeout(res, 1100));
  const result = await getScheduleByUser("user123");
  expect(result).toBeNull();
});