import { sendMessage } from "../../utils/send";
import { getUserSettings } from "../../kv";
import { getMainMenu } from "../../menus/main";
import { MessageContext } from "./context";

export async function handleFallback(ctx: MessageContext): Promise<Response> {
  const { env, chatId, userId } = ctx;
  const settings = await getUserSettings(env, userId);
  const lang = settings.language || "th";

  const msg = lang === "en"
    ? "❓ Unknown command. Please choose from the menu."
    : "❓ ไม่เข้าใจคำสั่ง กรุณาเลือกจากเมนู";

  return await sendMessage(chatId, msg, env, getMainMenu(lang));
}