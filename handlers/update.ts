import { sendMessage } from "../utils/send";
import { setAccessRole } from "../kv/access";
import { getBotChatMember } from "../utils/telegram";

export async function handleTelegramUpdate(update: any, env: any): Promise<Response> {
  const message = update.message;
  const userId = message?.from?.id;
  const text = message?.text?.trim();

  if (!userId || !text) return new Response("❌ Invalid update", { status: 400 });

  const access = await env.ACCESS.get(userId.toString(), { type: "json" });
  const isDeveloper = access?.role === "developer";

  if (isDeveloper && /^\d{7,}$/.test(text)) {
    await setAccessRole(env, text, "admin");
    return await sendMessage(userId, `✅ เพิ่ม ${text} เป็นแอดมินเรียบร้อย`, env);
  }

  if (message.chat?.type?.includes("group")) {
    const botInfo = await getBotChatMember(env, message.chat.id);
    if (botInfo?.status === "administrator") {
      await setAccessRole(env, message.chat.id.toString(), "group");
      return await sendMessage(message.chat.id, `✅ กลุ่มนี้ถูกเพิ่มเรียบร้อย`, env);
    }
  }

  return await sendMessage(userId, "🤖 ส่ง user ID เพื่อเพิ่มแอดมิน (เฉพาะ developer เท่านั้น)", env);
}