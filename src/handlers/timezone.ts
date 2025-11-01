import { isValidTimezone } from "../utils/validate";
import { getTimezoneInputMenu, getTimezoneConfirmMenu } from "../menus/timezone";
import { getTimezoneFromCoordinates, getCurrentTimeInTimezone } from "../utils/time";
import { setUserTimezone } from "../kv/settings";
import { clearDraft, setDraftState } from "../kv/draft";
import { getSettingsMenu } from "../menus/settings";

export async function handleTimezoneFlow(env, userId, text, draft, lang, role, message) {
  if (text === "⏰ ตั้ง Time Zone") {
    await setDraftState(env, userId, "awaiting_timezone_choice");
    return await sendMessage(userId, "🌍 กรุณาเลือกวิธีตั้งค่า Time Zone", env, getTimezoneInputMenu(lang));
  }

  if (message?.location) {
    const { latitude, longitude } = message.location;
    const timezone = await getTimezoneFromCoordinates(latitude, longitude);
    if (!timezone) return await sendMessage(userId, "⛔️ ไม่สามารถตรวจสอบ Time Zone จากตำแหน่งนี้ได้", env);
    await setDraftState(env, userId, `confirm_timezone:${timezone}`);
    const preview = getCurrentTimeInTimezone(timezone);
    return await sendMessage(userId, `✅ รับค่า Time Zone: ${timezone}\n🕒 เวลาปัจจุบัน: ${preview}\nกดบันทึกเพื่อยืนยัน หรือยกเลิกเพื่อไม่ใช้`, env, getTimezoneConfirmMenu(lang));
  }

  if (text === "⌨️ พิมพ์ชื่อ Time Zone") {
    await setDraftState(env, userId, "awaiting_timezone_input");
    return await sendMessage(userId, "⌨️ กรุณาพิมพ์ชื่อ Time Zone เช่น Asia/Bangkok", env, getTimezoneConfirmMenu(lang));
  }

  if (draft?.state === "awaiting_timezone_input" && !text.startsWith("✅") && !text.startsWith("❌")) {
    if (!isValidTimezone(text)) return await sendMessage(userId, "⛔️ Time Zone ไม่ถูกต้อง กรุณาระบุใหม่ เช่น Asia/Bangkok", env, getTimezoneConfirmMenu(lang));
    await setDraftState(env, userId, `confirm_timezone:${text}`);
    const preview = getCurrentTimeInTimezone(text);
    return await sendMessage(userId, `✅ รับค่า Time Zone: ${text}\n🕒 เวลาปัจจุบัน: ${preview}\nกดบันทึกเพื่อยืนยัน หรือยกเลิกเพื่อไม่ใช้`, env, getTimezoneConfirmMenu(lang));
  }

  if (draft?.state?.startsWith("confirm_timezone:") && text.startsWith("✅")) {
    const timezone = draft.state.split(":")[1];
    await setUserTimezone(env, userId, timezone);
    await clearDraft(env, userId);
    return await sendMessage(userId, `✅ ตั้งค่า Time Zone เป็น ${timezone} เรียบร้อยแล้ว`, env, getSettingsMenu(role, lang));
  }

  if (draft?.state?.startsWith("confirm_timezone:") && text.startsWith("❌")) {
    await clearDraft(env, userId);
    return await sendMessage(userId, "❌ ยกเลิกการตั้งค่า Time Zone แล้ว", env, getSettingsMenu(role, lang));
  }

  return null;
}