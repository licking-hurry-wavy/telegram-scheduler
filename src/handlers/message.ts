import {
  getAccessRole,
  getUserSettings,
  setUserLanguage,
  setUserTimezone,
  getDraft,
  clearDraft,
  setDraftState
} from "../kv";
import { sendMessage } from "../utils/send";
import { getMainMenu } from "../menus/main";
import { getSettingsMenu } from "../menus/settings";
import {
  getTimezoneInputMenu,
  getTimezoneConfirmMenu
} from "../menus/timezone";
import { globalStartTime } from "../index";

function isValidTimeZone(tz: string): boolean {
  try {
    new Date().toLocaleString("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatUptime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${days} วัน ${hours} ชั่วโมง ${minutes} นาที`;
}

export async function handleMessage(message: any, env: any, request: Request): Promise<Response> {
  const start = Date.now();
  const clientIP = request.headers.get("cf-connecting-ip") || "ไม่ทราบ IP";
  const city = request.cf?.city || "ไม่ทราบเมือง";
  const country = request.cf?.country || "ไม่ทราบประเทศ";

  const userId = message.from.id.toString();
  const chatId = message.chat.id;
  const text = message.text?.trim();

  const role = await getAccessRole(env, userId);
  const settings = await getUserSettings(env, userId);
  const lang = settings.language || "th";
  const draft = await getDraft(env, userId);

  if (["/start", "🔄 รีสตาร์ทบอท", "🔄 Restart Bot"].includes(text)) {
    await clearDraft(env, userId);
    return await sendMessage(chatId, lang === "en"
      ? "🤖 Bot restarted and ready to serve."
      : "🤖 บอทเริ่มทำงานแล้ว พร้อมให้บริการครับ", env, getMainMenu(lang));
  }

  if (["🔙 กลับหน้าแรก", "🔙 Back to Home"].includes(text)) {
    return await sendMessage(chatId, lang === "en" ? "📋 Main menu" : "📋 เมนูหลัก", env, getMainMenu(lang));
  }

  if (["🛠 ตั้งค่า", "🛠 Settings", "🔙 กลับหน้าการตั้งค่า", "🔙 Back to Settings"].includes(text)) {
    return await sendMessage(chatId, lang === "en" ? "🛠 Settings menu" : "🛠 เมนูการตั้งค่า", env, getSettingsMenu(role, lang));
  }

  if (["🌍 เปลี่ยนภาษา", "🌍 Change Language"].includes(text)) {
    return await sendMessage(chatId, lang === "en"
      ? "🌍 Choose your language"
      : "🌍 กรุณาเลือกภาษา", env, {
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
      return await sendMessage(chatId, message, env, getSettingsMenu(role, lang));
    }

    if (["❌ ยกเลิก", "❌ Cancel"].includes(text)) {
      await clearDraft(env, userId);
      const message = lang === "en"
        ? "❌ Time zone setup cancelled."
        : "❌ ยกเลิกการตั้งค่า Time Zone แล้ว";
      return await sendMessage(chatId, message, env, getSettingsMenu(role, lang));
    }

    const message = lang === "en"
      ? "❓ Please confirm or cancel."
      : "❓ กรุณากด ตกลง หรือ ยกเลิก";
    return await sendMessage(chatId, message, env, getTimezoneConfirmMenu(lang));
  }

  if (["➕ เพิ่มโพสต์", "➕ Add Post"].includes(text)) {
    await setDraftState(env, userId, "awaiting_post_title");
    const msg = lang === "en"
      ? "📝 Please send the title of your post"
      : "📝 กรุณาส่งชื่อโพสต์ที่คุณต้องการตั้งเวลา";
    return await sendMessage(chatId, msg, env);
  }

  if (["📆 ดูโพสต์ที่ตั้งไว้", "📆 View Scheduled Posts"].includes(text)) {
    const msg = lang === "en"
      ? "📭 This feature is currently unavailable."
      : "📭 ฟีเจอร์นี้ยังไม่พร้อมใช้งานในขณะนี้";
    return await sendMessage(chatId, msg, env);
  }

  if (["👤 แสดงสถานะสิทธิ์", "👤 Show Access Role"].includes(text)) {
    const username = message.from.username
      ? `@${message.from.username}`
      : lang === "en" ? "(no username)" : "(ไม่มี username)";
    const userIdText = `User ID: ${userId}`;

    const roleLabel = (() => {
      if (role === "developer") return lang === "en" ? "Developer" : "ผู้พัฒนา";
      if (role === "admin") return lang === "en" ? "Administrator" : "ผู้ดูแลระบบ";
      return role;
    })();
    const roleText = lang === "en" ? `Role: ${roleLabel}` : `สิทธิ์: ${roleLabel}`;

    const timezoneText = settings.timezone
      ? (lang === "en"
          ? `Time Zone: ${settings.timezone}`
          : `เขตเวลา: ${settings.timezone}`)
      : (lang === "en"
          ? "Time Zone: (not set)"
          : "เขตเวลา: (ยังไม่ได้ตั้ง)");

    const lastCheckedText = lang === "en"
      ? `Last Checked: ${formatDate(new Date().toISOString())}`
      : `ตรวจสอบล่าสุด: ${formatDate(new Date().toISOString())}`;

    const msg = `${username}\n${userIdText}\n${roleText}\n${timezoneText}\n${lastCheckedText}`;
    return await sendMessage(chatId, msg, env);
  }

  if (["🤖 เช็คสถานะบอท", "🤖 Check Bot Status"].includes(text)) {
    const now = Date.now();
    const uptime = formatUptime(now - globalStartTime);
    const responseTime = now - start;

    const msg = lang === "en"
      ? `🤖 Bot Status\n\n🆔 Bot ID: telegram-scheduler\n🧩 Version: 1.0.0\n\n📶 Status: ✅ Online\n⏱️ Uptime: ${uptime}\n⚡ Response Time: ${responseTime} ms\n🌐 Time Zone: ${settings.timezone || "(not set)"}`
      : `🤖 สถานะบอท\n\n🆔 รหัสบอท: telegram-scheduler\n🧩 เวอร์ชัน: 1.0.0\n\n📶 สถานะ: ✅ ออนไลน์\n⏱️ เวลาเปิดใช้งาน: ${uptime}\n⚡ เวลาตอบสนอง: ${responseTime} มิลลิวินาที\n🌐 เขตเวลา: ${settings.timezone || "(ยังไม่ได้ตั้ง)"}`;
    return await sendMessage(chatId, msg, env);
  }

  if (["🌐 เช็คสถานะเซิร์ฟเวอร์", "🌐 Check Server Status"].includes(text)) {
    const responseTime = Date.now() - start;
    const msg = lang === "en"
      ? `🌐 Server Status\n\n📶 Status: ✅ Online\n🖥️ IP: ${clientIP}\n📍 Location: ${city}, ${country}\n\n⚡ Response Time: ${responseTime} ms\n🌐 Time Zone: ${settings.timezone || "(not set)"}`
      : `🌐 สถานะเซิร์ฟเวอร์\n\n📶 สถานะ: ✅ ออนไลน์\n🖥️ IP: ${clientIP}\n📍 ตำแหน่ง: ${city}, ${country}\n\n⚡ เวลาตอบสนอง: ${responseTime} มิลลิวินาที\n🌐 เขตเวลา: ${settings.timezone || "(ยังไม่ได้ตั้ง)"}`;
    return await sendMessage(chatId, msg, env);
  }

  const fallback = lang === "en"
    ? "❓ Unknown command. Please choose from the menu."
    : "❓ ไม่เข้าใจคำสั่ง กรุณาเลือกจากเมนู";

  return await sendMessage(chatId, fallback, env, getMainMenu(lang));
}

import { globalStartTime } from "../constants"; // ✅ แก้จาก "../index"