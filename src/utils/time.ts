import { DateTime } from "luxon";

/**
 * ตรวจสอบว่า timezone ที่ระบุมีอยู่จริงหรือไม่
 */
export function isValidTimezone(tz: string): boolean {
  try {
    const dt = DateTime.now().setZone(tz);
    return dt.isValid;
  } catch {
    return false;
  }
}

/**
 * แปลงเวลา ISO ให้เป็นเวลาท้องถิ่นตาม timezone และภาษา
 */
export function formatLocalTime(iso: string, tz: string, lang: string): string {
  try {
    const dt = DateTime.fromISO(iso).setZone(tz);
    if (!dt.isValid) throw new Error("Invalid datetime or timezone");
    return lang === "en"
      ? dt.toFormat("yyyy-MM-dd HH:mm")
      : dt.setLocale("th").toFormat("yyyy-MM-dd HH:mm");
  } catch {
    return lang === "th" ? "ไม่สามารถแสดงเวลาได้" : "Invalid time";
  }
}

/**
 * ดึง timezone จากพิกัดละติจูด/ลองจิจูด โดยใช้ BigDataCloud API
 */
export async function getTimezoneFromCoordinates(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/timezone-by-location?latitude=${lat}&longitude=${lon}&key=YOUR_API_KEY`
    );
    const json = await res.json();
    return json?.timezone?.ianaTimeId || null;
  } catch {
    return null;
  }
}

/**
 * คืนค่าเวลาปัจจุบันใน timezone ที่กำหนด (ใช้ locale th-TH)
 */
export function getCurrentTimeInTimezone(timezone: string): string {
  try {
    return new Date().toLocaleString("th-TH", { timeZone: timezone });
  } catch {
    return "ไม่สามารถแสดงเวลาได้";
  }
}

/**
 * แสดงตัวอย่างเวลาโพสต์ในหลาย timezone แบบ 12 ชั่วโมง
 */
export function getTimePreview12h(postTimeUTC: string, timezones: string[]): string {
  const utcDate = new Date(postTimeUTC);
  return timezones.map(zone => {
    try {
      const local = utcDate.toLocaleString("en-US", {
        timeZone: zone,
        hour12: true,
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
      return `🕒 ${zone}: ${local}`;
    } catch {
      return `🕒 ${zone}: Invalid time`;
    }
  }).join("\n");
}

/**
 * คืนค่าเวลาปัจจุบันใน timezone ที่กำหนด (ใช้ locale ตามภาษา)
 */
export function formatTimeInZone(zone: string, lang: string): string {
  try {
    return new Date().toLocaleString(lang === "en" ? "en-GB" : "th-TH", {
      timeZone: zone,
      hour12: false
    });
  } catch {
    return lang === "th" ? "ไม่สามารถแสดงเวลาได้" : "Unknown time";
  }
}