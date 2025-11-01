export function getMainMenu(lang: string): {
  keyboard: string[][];
  resize_keyboard: boolean;
  one_time_keyboard: boolean;
} {
  const isEn = lang === "en";
  const t = (th: string, en: string) => isEn ? en : th;

  return {
    keyboard: [
      [t("➕ เพิ่มโพสต์", "➕ Add Post"), t("📆 ดูโพสต์ที่ตั้งไว้", "📆 View Scheduled Posts")],
      [t("🛠 ตั้งค่า", "🛠 Settings"), t("👤 แสดงสถานะสิทธิ์", "👤 View Role Status")]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };
}