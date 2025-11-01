const PREFIX = "draft:";

export async function getDraft(env: any, userId: string): Promise<any> {
  const raw = await env.DRAFT.get(`${PREFIX}${userId}`);
  return raw ? JSON.parse(raw) : null;
}

export async function setDraftState(env: any, userId: string, state: string): Promise<void> {
  const draft = await getDraft(env, userId) || {};
  draft.state = state;
  draft.updatedAt = Date.now(); // ✅ timestamp ล่าสุด
  await env.DRAFT.put(`${PREFIX}${userId}`, JSON.stringify(draft));
}

export async function saveDraft(env: any, userId: string, draft: any): Promise<void> {
  draft.updatedAt = Date.now(); // ✅ อัปเดต timestamp ทุกครั้งที่ save
  await env.DRAFT.put(`${PREFIX}${userId}`, JSON.stringify(draft));
}

export async function clearDraft(env: any, userId: string): Promise<void> {
  await env.DRAFT.delete(`${PREFIX}${userId}`);
}