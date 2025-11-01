export function getPostPreviewConfirmMenu(lang: string = "th") {
  return {
    keyboard: [[
      lang === "en" ? "✅ Confirm Post" : "✅ ยืนยันโพสต์",
      lang === "en" ? "❌ Cancel" : "❌ ยกเลิก"
    ]],
    resize_keyboard: true
  };
}