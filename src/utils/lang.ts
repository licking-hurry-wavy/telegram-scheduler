export function detectLang(code?: string): string {
  if (!code) return "th"; // ถ้าไม่มี language_code → ใช้ภาษาไทยเป็นค่าเริ่มต้น
  return code.startsWith("en") ? "en" : "th"; // ถ้าเริ่มต้นด้วย "en" → ภาษาอังกฤษ, นอกนั้น → ไทย
}