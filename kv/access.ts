const USER_PREFIX = "user:";
const ACCESS_PREFIX = "access:";

export async function getAccessRole(env: any, userId: string): Promise<string> {
  const userKey = `${USER_PREFIX}${userId}:role`;
  const fallbackKey = `${ACCESS_PREFIX}${userId}:role`;

  const raw = await env.ACCESS.get(userKey);
  if (raw) return raw;

  const fallback = await env.ACCESS.get(fallbackKey);
  return fallback || "user";
}

export async function setAccessRole(env: any, userId: string, role: string): Promise<void> {
  const key = `${USER_PREFIX}${userId}:role`;
  await env.ACCESS.put(key, role);
}

export async function getEligibleGroups(env: any, userId: string): Promise<string[]> {
  const key = `${USER_PREFIX}${userId}:groups`;
  const raw = await env.ACCESS.get(key);
  return raw ? JSON.parse(raw) : [];
}

export async function setEligibleGroups(env: any, userId: string, groups: string[]): Promise<void> {
  const key = `${USER_PREFIX}${userId}:groups`;
  await env.ACCESS.put(key, JSON.stringify(groups));
}