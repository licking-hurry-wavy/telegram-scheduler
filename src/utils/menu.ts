export function getMainMenu(): any[] {
  return [
    [{ text: "➕ เพิ่มโพสต์", callback_data: "start_post" }],
    [{ text: "📋 ดูโพสต์ที่ตั้งไว้", callback_data: "view_posts" }],
    [{ text: "⚙️ ตั้งค่า", callback_data: "settings_menu" }]
  ];
}

export function getButtonChoiceMenu(): any[] {
  return [
    [{ text: "➕ เพิ่มปุ่มลิงก์", callback_data: "add_buttons" }],
    [{ text: "❌ ไม่เพิ่ม", callback_data: "skip_buttons" }]
  ];
}

export function getReviewMenu(): any[] {
  return [
    [{ text: "✏️ แก้ไขโพสต์", callback_data: "edit_post" }],
    [{ text: "✅ ยืนยันโพสต์", callback_data: "confirm_post" }]
  ];
}

export function getSettingsMenu(): any[] {
  return [
    [{ text: "➕ เพิ่มกลุ่ม", callback_data: "add_group" }],
    [{ text: "➕ เพิ่มแอดมิน", callback_data: "add_admin" }],
    [{ text: "🔙 กลับ", callback_data: "back_to_main" }]
  ];
}