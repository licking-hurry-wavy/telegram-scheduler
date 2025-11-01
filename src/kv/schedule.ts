export async function getScheduleByUser(env: any, userId: string): Promise<any | null> {
  const raw = await env.KV_POSTS.get(`schedule:${userId}`);
  return raw ? JSON.parse(raw) : null;
}

export async function saveSchedule(env: any, userId: string, data: any): Promise<void> {
  await env.KV_POSTS.put(`schedule:${userId}`, JSON.stringify(data));
}