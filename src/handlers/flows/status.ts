import { sendMessage } from "../../utils/send";
import { getUserSettings } from "../../kv";
import { getMainMenu } from "../../menus/main";
import { formatUptime } from "../../utils/time";
import { globalStartTime } from "../../constants";
import { MessageContext } from "./context";

export async function handleStatusCheck(ctx: MessageContext): Promise<Response | null> {
  const { env, userId, chatId, text, request } = ctx;

  if (!["🤖 เช็คสถานะบอท", "🤖 Check Bot Status", "🌐 เช็คสถานะเซิร์ฟเวอร์", "🌐 Check Server Status"].includes(text)) {
    return null;
  }

  const settings = await getUserSettings(env, userId);
  const lang = settings.language || "th";
  const now = Date.now();
  const uptime = formatUptime(now - globalStartTime);
  const responseTime = now - ((request as any)._startTime ?? 0);

  const clientIP = request.headers.get("cf-connecting-ip") || "ไม่ทราบ IP";
  const city = request.cf?.city || "ไม่ทราบเมือง";
  const country = request.cf?.country || "ไม่ทราบประเทศ";

  const role = await env.ACCESS.get(userId);
  const roleLabel = role === "admin" ? (lang === "en" ? "Admin" : "ผู้ดูแล") : (lang === "en" ? "User" : "ผู้ใช้");

  const msg = text.includes("เซิร์ฟเวอร์") || text.includes("Server")
    ? lang === "en"
      ? `🌐 Server Status\n\n📶 Status: ✅ Online\n🖥️ IP: ${clientIP}\n📍 Location: ${city}, ${country}\n⚡ Response Time: ${responseTime} ms\n🌐 Time Zone: ${settings.timezone || "(not set)"}`
      : `🌐 สถานะเซิร์ฟเวอร์\n\n📶 สถานะ: ✅ ออนไลน์\n🖥️ IP: ${clientIP}\n📍 ตำแหน่ง: ${city}, ${country}\n⚡ เวลาตอบสนอง: ${responseTime} มิลลิวินาที\n🌐 เขตเวลา: ${settings.timezone || "(ยังไม่ได้ตั้ง)"}`
    : lang === "en"
      ? `🤖 Bot Status\n\n🆔 Bot ID: telegram-scheduler\n🧩 Version: 1.0.0\n📶 Status: ✅ Online\n⏱️ Uptime: ${uptime}\n⚡ Response Time: ${responseTime} ms\n🌐 Time Zone: ${settings.timezone || "(not set)"}\n👤 Role: ${roleLabel}`
      : `🤖 สถานะบอท\n\n🆔 รหัสบอท: telegram-scheduler\n🧩 เวอร์ชัน: 1.0.0\n📶 สถานะ: ✅ ออนไลน์\n⏱️ เวลาเปิดใช้งาน: ${uptime}\n⚡ เวลาตอบสนอง: ${responseTime} มิลลิวินาที\n🌐 เขตเวลา: ${settings.timezone || "(ยังไม่ได้ตั้ง)"}\n👤 สิทธิ์: ${roleLabel}`;

  return await sendMessage(chatId, msg, env, getMainMenu(lang));
}

import { globalStartTime } from "../../constants"; // ✅ แก้จาก "../index"