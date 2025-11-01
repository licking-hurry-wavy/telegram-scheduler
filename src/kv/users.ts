const KEY_PREFIX = "user_role:";

export async function setUserRole(env: any, userId: number, role: "admin" | "developer") {
  await env.DRAFT.put(`${KEY_PREFIX}${userId}`, role);
}

export async function getUserRole(env: any, userId: number): Promise<"admin" | "developer" | null> {
  const role = await env.DRAFT.get(`${KEY_PREFIX}${userId}`);
  return role as "admin" | "developer" | null;
}

export async function removeUser(env: any, userId: number) {
  await env.DRAFT.delete(`${KEY_PREFIX}${userId}`);
}