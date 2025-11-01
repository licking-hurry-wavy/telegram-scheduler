import { getDraft } from "../kv/draft";
import { sendMediaGroup, sendMessage } from "./send";

export async function previewPost(userId: number, env: any) {
  const draft = await getDraft(env, userId);
  if (!draft) return;

  if (draft.media.length > 0) {
    await sendMediaGroup(userId, draft.media, env);
  }

  await sendMessage(userId, draft.caption || "(ไม่มีข้อความ)", env, draft.buttons.length > 0 ? [draft.buttons] : undefined);
}