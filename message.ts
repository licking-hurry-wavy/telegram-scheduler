import { getAccessRole, getUserSettings, setDraftState, getDraft, clearDraft } from "../kv";
import { sendMessage } from "../utils/send";
import { extractMedia } from "../utils/media";
import { getMainMenu } from "../menus/main";
import { getSettingsMenu } from "../menus/settings";
import { handlePostFlow } from "./handlers/post";
import { getPreviousState } from "../utils/state";

export async function handleMessage(message: any, env: any, request: Request): Promise<Response> {
  const userId = message.from.id.toString();
  const chatId = message.chat.id;
  const text = message.text?.trim();
  const role = await getAccessRole(env, userId);
  const settings = await getUserSettings(env, userId);
  const lang = settings.language || "th";
  const draft = await getDraft(env, userId);
  const context = { chatId, userId, lang, env, role, settings, draft, message, request };

  if (["❌ ยกเลิก", "❌ Cancel"].includes(text)) {
    await clearDraft(env, userId);
    return await sendMessage(chatId, lang === "en"
      ? "🚫 Post creation cancelled."
      : "🚫 ยกเลิกการสร้างโพสต์แล้ว", env, getMainMenu(lang));
  }

  if (["🔙 ย้อนกลับ", "🔙 Back"].includes(text)) {
    const previous = getPreviousState(draft?.state);
    if (previous) {
      await setDraftState(env, userId, previous, draft.data);
      return await sendMessage(chatId, lang === "en"
        ? `🔙 Back to ${previous.replace("awaiting_", "").replace("_", " ")}`
        : `🔙 กลับไปยังขั้นตอน ${previous}`, env);
    }
  }

  if (["➕ เพิ่มโพสต์", "➕ Add Post"].includes(text)) {
    await setDraftState(env, userId, "awaiting_media");
    return await sendMessage(chatId, lang === "en"
      ? "📎 Please attach your media"
      : "📎 กรุณาแนบสื่อของคุณ", env);
  }

  if (draft?.state === "awaiting_media") {
    const media = extractMedia(message);
    if (!media) {
      return await sendMessage(chatId, lang === "en"
        ? "⚠️ No media detected. Please attach a photo, video, or document."
        : "⚠️ ไม่พบสื่อ กรุณาแนบรูปภาพ วิดีโอ หรือเอกสาร", env);
    }

    await setDraftState(env, userId, "awaiting_caption", { media });
    return await sendMessage(chatId, lang === "en"
      ? "✏️ Please enter a caption for your post"
      : "✏️ กรุณาพิมพ์แคปชั่นสำหรับโพสต์ของคุณ", env);
  }

  const postStates = [
    "awaiting_caption",
    "awaiting_buttons",
    "awaiting_buttons_input",
    "awaiting_group",
    "awaiting_group_selection",
    "awaiting_schedule",
    "awaiting_repeat_input",
    "awaiting_datetime_input",
    "awaiting_preview"
  ];
  if (postStates.includes(draft?.state)) {
    return await handlePostFlow(text, context);
  }

  if (["/start", "🔄 รีสตาร์ทบอท", "🔄 Restart Bot"].includes(text)) {
    await clearDraft(env, userId);
    return await sendMessage(chatId, lang === "en"
      ? "🤖 Bot restarted and ready to serve."
      : "🤖 บอทเริ่มทำงานแล้ว พร้อมให้บริการครับ", env, getMainMenu(lang));
  }

  if (["🛠 ตั้งค่า", "🛠 Settings"].includes(text)) {
    return await sendMessage(chatId, lang === "en"
      ? "🛠 Settings menu"
      : "🛠 เมนูการตั้งค่า", env, getSettingsMenu(role, lang));
  }

  return await sendMessage(chatId, lang === "en"
    ? "❓ Unknown command. Please choose from the menu."
    : "❓ ไม่เข้าใจคำสั่ง กรุณาเลือกจากเมนู", env, getMainMenu(lang));
}