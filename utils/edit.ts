import { getDraft, saveDraft } from "../kv/draft";
import { sendMessage } from "../utils/send";
import { getMainMenu } from "../utils/menu";

export async function handleEdit(userId: number, env: any) {
  const draft = await getDraft(env, userId);
  const summary = `
📸 Media: ${draft.media.length} รายการ
✍️ Caption: ${draft.caption || "ไม่มี"}
🔗 Buttons: ${draft.buttons?.length || 0}
⏰ Schedule: ${draft.schedule || "ยังไม่ตั้ง"}
👥 Groups: ${draft.groupIds?.length || 0}
`;

  await sendMessage(userId, `🛠 คุณสามารถแก้ไขโพสต์นี้:\n${summary}`, env, getMainMenu());
}