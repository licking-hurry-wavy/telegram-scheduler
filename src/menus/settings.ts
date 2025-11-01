export function getSettingsMenu(role: string, lang: string) {
  const isEn = lang === "en";
  const t = (th: string, en: string) => isEn ? en : th;

  const rows: string[][] = [];

  // 🌍 เปลี่ยนภาษา     ⏰ ตั้ง Time Zone
  rows.push([
    t("🌍 เปลี่ยนภาษา", "🌍 Change Language"),
    t("⏰ ตั้ง Time Zone", "⏰ Set Time Zone")
  ]);

  if (role === "developer") {
    // 📊 จัดการกลุ่ม     🛡️ จัดการสิทธิ์ผู้ใช้
    rows.push([
      t("📊 จัดการกลุ่ม", "📊 Manage Groups"),
      t("🛡️ จัดการสิทธิ์ผู้ใช้", "🛡️ Manage User Roles")
    ]);

    // 🤖 เช็คสถานะบอท     🌐 เช็คสถานะเซิร์ฟเวอร์
    rows.push([
      t("🤖 เช็คสถานะบอท", "🤖 Check Bot Status"),
      t("🌐 เช็คสถานะเซิร์ฟเวอร์", "🌐 Check Server Status")
    ]);

    // 🔄 รีสตาร์ทบอท
    rows.push([t("🔄 รีสตาร์ทบอท", "🔄 Restart Bot")]);
  } else {
    // 📊 จัดการกลุ่ม     🤖 เช็คสถานะบอท
    rows.push([
      t("📊 จัดการกลุ่ม", "📊 Manage Groups"),
      t("🤖 เช็คสถานะบอท", "🤖 Check Bot Status")
    ]);
  }

  // 🔙 กลับหน้าแรก
  rows.push([t("🔙 กลับหน้าแรก", "🔙 Back to Home")]);

  return {
    keyboard: rows,
    resize_keyboard: true
  };
}