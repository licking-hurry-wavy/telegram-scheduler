export async function getGroups(env: any, userId: number): Promise<string[]> {
  const raw = await env.DRAFT.get(`groups:${userId}`);
  return raw ? JSON.parse(raw) : [];
}

export async function saveGroups(env: any, userId: number, groupIds: string[]) {
  await env.DRAFT.put(`groups:${userId}`, JSON.stringify(groupIds));
}