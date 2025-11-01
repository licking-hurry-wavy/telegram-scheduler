import { sendMessage } from "../utils/send";
import { getMainMenu } from "../menus/main";

export async function handleStart(userId: number, env: any): Promise<Response> {
  return await sendMessage(userId, "👋 ยินดีต้อนรับ! กรุณาเลือกเมนูที่ต้องการ", env, getMainMenu());
}

export async function handleHelp(userId: number, env: any): Promise<Response> {
  const helpText = `📖 <b>วิธีใช้งานบอท</b>

➕ เพิ่มโพสต์ — ตั้งโพสต์ใหม่
🗂 ดูโพสต์ที่ตั้งไว้ — ตรวจสอบโพสต์ในคิว
👤 แสดงสถานะสิทธิ์ — ดูสิทธิ์ของคุณ
🛠 ตั้งค่า — เมนูสำหรับผู้ดูแลระบบ

พิมพ์ /start เพื่อเริ่มต้นใหม่`;
  return await sendMessage(userId, helpText, env);
}