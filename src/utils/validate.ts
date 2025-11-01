import { timezones } from "../data/timezones";

export function isValidTimezone(input: string): boolean {
  return timezones.includes(input.trim());
}

export function getCurrentTimeInTimezone(timezone: string): string {
  return new Date().toLocaleString("th-TH", { timeZone: timezone });
}