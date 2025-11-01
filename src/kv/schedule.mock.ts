import { getMockKV } from "./kv.mock";

const kv = getMockKV("schedule");

export async function getScheduleByUser(userId: string): Promise<any | null> {
  const raw = await kv.get(`schedule:${userId}`);
  return raw ? JSON.parse(raw) : null;
}

export async function saveSchedule(userId: string, data: any, ttlSeconds?: number): Promise<void> {
  await kv.put(`schedule:${userId}`, JSON.stringify(data), ttlSeconds ? { ttl: ttlSeconds } : undefined);
}

export async function deleteSchedule(userId: string): Promise<void> {
  await kv.delete(`schedule:${userId}`);
}

export function clearScheduleMock(): void {
  kv.clear();
}