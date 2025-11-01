import { sendMessage } from "../../utils/send";
import {
  getDraft,
  setDraftState,
  clearDraft,
  setUserTimezone
} from "../../kv";
import { getTimezoneInputMenu, getTimezoneConfirmMenu } from "../../menus/timezone";

function isValidTimeZone(tz: string): boolean {
  try {
    new Date().toLocaleString("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export async function handleTimezoneFlow(ctx: {
  env: any;
  userId: string;
  chatId: number;
  text: string;
}): Promise<Response | null> {
  const { env, userId, chatId, text } = ctx;

  const lang = (await getDraft(env, userId))?.language || "th";
  const draft = await getDraft(env, userId);

  if (["⏰ ตั้ง Time Zone", "⏰ Set Time Zone"].includes(text)) {
    await setDraftState(env, userId, "awaiting_timezone");
    return await sendMessage(chatId, lang === "en"
      ? "⏰ Please enter your time zone (e.g. Asia/Bangkok)"
      : "⏰ กรุณาพิมพ์ชื่อ Time Zone เช่น Asia/Bangkok", env, getTimezoneInputMenu(lang));
  }

  if (draft?.state === "awaiting_timezone") {
    const normalized = text.startsWith("Asia/")
      ? text
      : `Asia/${text.replace(/\s+/g, "_")}`;

    if (!isValidTimeZone(normalized)) {
      const message = lang === "en"
        ? `❌ Invalid time zone: ${text}\nPlease send a valid IANA time zone (e.g. Asia/Bangkok)`
        : `❌ Time Zone ไม่ถูกต้อง: ${text}\nกรุณาส่งชื่อ Time Zone ที่ถูกต้อง เช่น Asia/Bangkok`;
      return await sendMessage(chatId, message, env, getTimezoneInputMenu(lang));
    }

    await setDraftState(env, userId, "awaiting_timezone_confirm", { tempTZ: normalized });
    const message = lang === "en"
      ? `✅ Time zone detected: ${normalized}\nDo you want to save it?`
      : `✅ ตรวจพบ Time Zone: ${normalized}\nคุณต้องการบันทึกหรือไม่`;
    return await sendMessage(chatId, message, env, getTimezoneConfirmMenu(lang));
  }

  if (draft?.state === "awaiting_timezone_confirm") {
    const tempTZ = draft?.data?.tempTZ;

    if (["✅ ตกลง", "✅ Confirm", "✅ Save Time Zone", "✅ บันทึกการเปลี่ยนแปลง"].includes(text)) {
      await setUserTimezone(env, userId, tempTZ);
      await clearDraft(env, userId);
      const message = lang === "en"
        ? `✅ Time zone set to ${tempTZ}`
        : `✅ ตั้ง Time Zone เป็น ${tempTZ} เรียบร้อยแล้ว`;
      return await sendMessage(chatId, message, env);
    }

    if (["❌ ยกเลิก", "❌ Cancel"].includes(text)) {
      await clearDraft(env, userId);
      const message = lang === "en"
        ? "❌ Time zone setup cancelled."
        : "❌ ยกเลิกการตั้งค่า Time Zone แล้ว";
      return await sendMessage(chatId, message, env);
    }

    const message = lang === "en"
      ? "❓ Please confirm or cancel."
      : "❓ กรุณากด ตกลง หรือ ยกเลิก";
    return await sendMessage(chatId, message, env, getTimezoneConfirmMenu(lang));
  }

  return null;
}