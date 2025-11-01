import { sendMessage } from "../../utils/send";
import { getAccessRole, setUserLanguage } from "../../kv";
import { getSettingsMenu } from "../../menus/settings";

export async function handleSettingsCommand(ctx: {
  env: any;
  userId: string;
  chatId: number;
  text: string;
}): Promise<Response | null> {
  const { env, userId, chatId, text } = ctx;

  const settingsCommands = [
    "🛠 ตั้งค่า", "🛠 Settings",
    "🔙 กลับหน้าการตั้งค่า", "🔙 Back to Settings",
    "🌍 เปลี่ยนภาษา", "🌍 Change Language",
    "🇹🇭 ไทย", "🇹🇭 Thai",
    "🇬🇧 English"
  ];

  if (!settingsCommands.includes(text)) return null;

  const role = await getAccessRole(env, userId);

  if (["🛠 ตั้งค่า", "🛠 Settings", "🔙 กลับหน้าการตั้งค่า", "🔙 Back to Settings"].includes(text)) {
    const lang = text.includes("Settings") ? "en" : "th";
    return await sendMessage(chatId, lang === "en" ? "🛠 Settings menu" : "🛠 เมนูการตั้งค่า", env, getSettingsMenu(role, lang));
  }

  if (["🌍 เปลี่ยนภาษา", "🌍 Change Language"].includes(text)) {
    const lang = text.includes("Change") ? "en" : "th";
    return await sendMessage(chatId, lang === "en" ? "🌍 Choose your language" : "🌍 กรุณาเลือกภาษา", env, {
      keyboard: [["🇹🇭 ไทย", "🇬🇧 English"], ["🔙 กลับหน้าการตั้งค่า"]],
      resize_keyboard: true
    });
  }

  if (["🇹🇭 ไทย", "🇹🇭 Thai"].includes(text)) {
    await setUserLanguage(env, userId, "th");
    return await sendMessage(chatId, "✅ เปลี่ยนภาษาเป็นไทยเรียบร้อยแล้ว", env, getSettingsMenu(role, "th"));
  }

  if (["🇬🇧 English"].includes(text)) {
    await setUserLanguage(env, userId, "en");
    return await sendMessage(chatId, "✅ Language changed to English", env, getSettingsMenu(role, "en"));
  }

  return null;
}