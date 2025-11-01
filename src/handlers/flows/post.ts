import { sendMessage } from "../../utils/send";
import { setDraftState } from "../../kv";
import { MessageContext } from "./context";

export async function handlePostFlow(ctx: MessageContext): Promise<Response | null> {
  const { env, userId, chatId, text } = ctx;

  if (["➕ เพิ่มโพสต์", "➕ Add Post"].includes(text)) {
    await setDraftState(env, userId, "awaiting_post_title");
    const lang = text.includes("Add") ? "en" : "th";
    const msg = lang === "en"
      ? "📝 Please send the title of your post"
      : "📝 กรุณาส่งชื่อโพสต์ที่คุณต้องการตั้งเวลา";
    return await sendMessage(chatId, msg, env);
  }

  if (["📆 ดูโพสต์ที่ตั้งไว้", "📆 View Scheduled Posts"].includes(text)) {
    const lang = text.includes("View") ? "en" : "th";
    const msg = lang === "en"
      ? "📭 This feature is currently unavailable."
      : "📭 ฟีเจอร์นี้ยังไม่พร้อมใช้งานในขณะนี้";
    return await sendMessage(chatId, msg, env);
  }

  return null;
}