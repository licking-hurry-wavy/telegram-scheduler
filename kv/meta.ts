const KEY = "meta:lastDeploy";

// ✅ บันทึกเวลาที่ deploy ล่าสุด
export async function setLastDeploy(env: any): Promise<void> {
  await env.META.put(KEY, Date.now().toString());
}

// ✅ ดึงเวลาที่ deploy ล่าสุด
export async function getLastDeploy(env: any): Promise<number> {
  const raw = await env.META.get(KEY);
  return raw ? parseInt(raw) : 0;
}

// ✅ ดึงเวลาที่ผู้ใช้โพสต์ล่าสุด
export async function getLastPostedAt(env: Env, userId: string): Promise<string | null> {
  return await env.DB.get(`meta:last_posted:${userId}`);
}