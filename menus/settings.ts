export function getSettingsMenu(role: string, lang: string) {
  const isEn = lang === "en";
  const t = (th: string, en: string) => isEn ? en : th;

  const rows: string[][] = [];

  rows.push([
    t("🌍 เปลี่ยนภาษา", "🌍 Change Language"),
    t("⏰ ตั้ง Time Zone", "⏰ Set Time Zone")
  ]);

  if (role === "developer") {
    rows.push([
      t("📊 จัดการกลุ่ม", "📊 Manage Groups"),
      t("🛡️ จัดการสิทธิ์ผู้ใช้", "🛡️ Manage User Roles")
    ]);
    rows.push([
      t("🤖 เช็คสถานะบอท", "🤖 Check Bot Status"),
      t("🌐 เช็คสถานะเซิร์ฟเวอร์", "🌐 Check Server Status")
    ]);
    rows.push([t("🔄 รีสตาร์ทบอท", "🔄 Restart Bot")]);
  } else {
    rows.push([
      t("📊 จัดการกลุ่ม", "📊 Manage Groups"),
      t("🤖 เช็คสถานะบอท", "🤖 Check Bot Status")
    ]);
  }

  rows.push([t("🔙 กลับหน้าแรก", "🔙 Back to Home")]);

  return {
    keyboard: rows,
    resize_keyboard: true
  };
}