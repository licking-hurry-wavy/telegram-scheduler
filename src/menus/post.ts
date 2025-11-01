export function getPostStepMenu(stage: string, groups: string[] = []): any {
  switch (stage) {
    case "awaiting_media":
      return {
        keyboard: [["❌ ยกเลิก", "🔙 กลับเมนูหลัก"]],
        resize_keyboard: true
      };

    case "awaiting_caption":
      return {
        keyboard: [["❌ ยกเลิก"]],
        resize_keyboard: true
      };

    case "awaiting_buttons":
      return {
        keyboard: [["➕ เพิ่มปุ่มลิงก์", "⏭ ข้ามขั้นตอนนี้"], ["❌ ยกเลิก"]],
        resize_keyboard: true
      };

    case "awaiting_button_input":
      return {
        keyboard: [["➕ เพิ่มอีก", "⏭ ข้ามขั้นตอนนี้"], ["❌ ยกเลิก"]],
        resize_keyboard: true
      };

    case "awaiting_button_layout":
      return {
        keyboard: [["🔳 ปุ่มละ 1 บรรทัด", "🔲 2 ปุ่มต่อบรรทัด"], ["❌ ยกเลิก"]],
        resize_keyboard: true
      };

    case "awaiting_group":
      return {
        keyboard: [...groups.map(g => [g]), ["❌ ยกเลิก"]],
        resize_keyboard: true
      };

    case "awaiting_schedule":
      return {
        keyboard: [
          ["📤 โพสต์ทันที"],
          ["🔁 โพสต์ซ้ำๆ", "📅 กำหนดวันเวลา"],
          ["❌ ยกเลิก"]
        ],
        resize_keyboard: true
      };

    case "awaiting_repeat_type":
      return {
        keyboard: [
          ["⏱ ทุกนาที", "📆 ทุกวัน"],
          ["🗓 ทุกเดือน", "📅 ทุกปี"],
          ["❌ ยกเลิก"]
        ],
        resize_keyboard: true
      };

    case "awaiting_repeat_value":
    case "awaiting_datetime":
      return {
        keyboard: [["❌ ยกเลิก"]],
        resize_keyboard: true
      };

    case "awaiting_preview":
      return {
        keyboard: [["🖼 Preview"], ["❌ ยกเลิก"]],
        resize_keyboard: true
      };

    case "awaiting_confirm":
      return {
        keyboard: [["📤 ยืนยันโพสต์", "✏️ แก้ไขโพสต์"], ["❌ ยกเลิก"]],
        resize_keyboard: true
      };

    default:
      return {
        keyboard: [["❌ ยกเลิก"]],
        resize_keyboard: true
      };
  }
}

export function getButtonLayoutMenu() {
  return {
    keyboard: [
      ["🔳 ปุ่มละ 1 บรรทัด", "🔲 2 ปุ่มต่อบรรทัด"],
      ["❌ ยกเลิก"]
    ],
    resize_keyboard: true
  };
}