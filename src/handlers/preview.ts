import { sendMessage } from "../utils/send";

export async function sendPostPreview(env: any, userId: number, draft: any) {
  const caption = draft.caption || "ไม่มีข้อความ";
  const buttons = draft.buttons || [];

  const reply_markup = buttons.length > 0
    ? { inline_keyboard: buttons.map(btn => [{ text: btn.text, url: btn.url }]) }
    : undefined;

  await sendMessage(userId, `🖼 <b>พรีวิวโพสต์</b>\n${caption}`, env, reply_markup);
  await sendMessage(userId, "✅ ต้องการโพสต์หรือไม่?\nพิมพ์ 'ยืนยัน' เพื่อโพสต์ หรือ 'ยกเลิก'", env);
}