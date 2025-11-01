export function getEditPostMenu(lang: string = "th") {
  if (lang === "en") {
    return {
      keyboard: [
        ["🖼 Edit Media", "✏️ Edit Caption"],
        ["🔘 Edit Buttons", "📍 Edit Group"],
        ["📅 Edit Schedule", "👁 Preview Post"],
        ["✅ Save Changes", "🔙 Cancel"]
      ],
      resize_keyboard: true
    };
  }

  return {
    keyboard: [
      ["🖼 แก้ไขสื่อ", "✏️ แก้ไขข้อความ"],
      ["🔘 แก้ไขปุ่ม", "📍 แก้ไขกลุ่ม"],
      ["📅 แก้ไขเวลาโพสต์", "👁 ดูตัวอย่างโพสต์"],
      ["✅ บันทึกการเปลี่ยนแปลง", "🔙 ยกเลิก"]
    ],
    resize_keyboard: true
  };
}