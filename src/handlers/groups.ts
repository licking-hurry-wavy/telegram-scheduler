import { getDraft, saveDraft } from "../kv/draft";
import { sendMessage } from "../utils/send";

export async function handleGroupSelection(userId: number, text: string, env: any) {
  const groupIds = text.split("\n").map(id => id.trim()).filter(Boolean);
  const draft = await getDraft(env, userId);
  draft.groupIds = groupIds;
  await saveDraft(env, userId, draft);
  await sendMessage(userId, "✅ กลุ่มถูกเพิ่มแล้ว ส่ง 'preview' เพื่อดูโพสต์", env);
}