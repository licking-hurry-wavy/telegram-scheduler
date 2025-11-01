export function getScheduledMenu(lang: string = "th", posts: string[]): any {
  const list = posts.length
    ? posts.map((p, i) => `📌 ${i + 1}. ${p}`).join("\n")
    : lang === "en"
      ? "📭 No scheduled posts"
      : "📭 ยังไม่มีโพสต์ที่ตั้งเวลาไว้";

  const back = lang === "en" ? "🔙 Back to Home" : "🔙 กลับหน้าแรก";

  return {
    text: list,
    keyboard: [[back]],
    resize_keyboard: true
  };
}