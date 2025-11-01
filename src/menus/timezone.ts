export function getTimezoneInputMenu(lang: string = "th") {
  return {
    keyboard: [
      [lang === "en" ? "⌨️ Type Time Zone" : "⌨️ พิมพ์ชื่อ Time Zone"],
      [{
        text: lang === "en" ? "📍 Share Location" : "📍 แชร์ตำแหน่ง",
        request_location: true
      }]
    ],
    resize_keyboard: true
  };
}

export function getTimezoneConfirmMenu(lang: string = "th") {
  return {
    keyboard: [[
    lang === "en" ? "✅ Save Time Zone" : "✅ บันทึกการเปลี่ยนแปลง",
    lang === "en" ? "❌ Cancel" : "❌ ยกเลิก"
    ]],
    resize_keyboard: true
  };
}