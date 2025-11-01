import { getAccessRole } from "../kv/access";
import { getUserSettings } from "../kv/settings";
import { getPostCount } from "../kv/post";
import { sendMessage } from "../utils/send";
import { getMainMenu } from "../menus/main";

export async function handleStart(env: any, userId: string, chatId: number): Promise<Response> {
  const role = await getAccessRole(env, userId);
  const settings = await getUserSettings(env, userId);
  const lang = settings.language || "th";
  const tz = settings.timezone || "Asia/Bangkok";
  const postCount = await getPostCount(env, userId);

  let now = "";
  try {
    now = new Date().toLocaleString(lang === "en" ? "en-GB" : "th-TH", {
      timeZone: tz,
      hour12: false
    });
  } catch {
    now = new Date().toLocaleString(lang === "en" ? "en-GB" : "th-TH", {
      timeZone: "Asia/Bangkok",
      hour12: false
    });
  }

  const roleLabel = role === "developer"
    ? (lang === "en" ? "👑 Developer" : "👑 นักพัฒนา")
    : role === "admin"
    ? (lang === "en" ? "🛡️ Admin" : "🛡️ แอดมิน")
    : (lang === "en" ? "👤 User" : "👤 ผู้ใช้ทั่วไป");

  const preview = lang === "en"
    ? `📋 Main Menu\n\n🆔 user ID: ${userId}\n🔐 Role: ${roleLabel}\n📊 Total posts: ${postCount}\n⏰ Current time: ${now}\n🌐 Time Zone: ${tz}`
    : `📋 เมนูหลัก\n\n🆔 รหัสผู้ใช้: ${userId}\n🔐 สิทธิ์: ${roleLabel}\n📊 จำนวนโพสต์ทั้งหมด: ${postCount}\n⏰ เวลาปัจจุบัน: ${now}\n🌐 Time Zone: ${tz}`;

  return await sendMessage(chatId, preview, env, getMainMenu(lang));
}