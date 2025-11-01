export function parseSchedule(text: string): { type: "once" | "repeat" | "now", timestamp?: number, interval?: number } | null {
  const now = Date.now();

  if (text.toLowerCase() === "ทันที") return { type: "now" };

  const repeatMatch = text.match(/ทุก\s*(\d+)\s*(นาที|ชั่วโมง|วัน|เดือน|ปี)/);
  if (repeatMatch) {
    const amount = parseInt(repeatMatch[1]);
    const unit = repeatMatch[2];
    const multipliers: Record<string, number> = {
      "นาที": 60_000,
      "ชั่วโมง": 60 * 60_000,
      "วัน": 24 * 60 * 60_000,
      "เดือน": 30 * 24 * 60 * 60_000,
      "ปี": 365 * 24 * 60 * 60_000
    };
    return { type: "repeat", interval: amount * multipliers[unit] };
  }

  const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (dateMatch) {
    const [_, d, m, y, h, min] = dateMatch.map(Number);
    const date = new Date(y, m - 1, d, h, min);
    return { type: "once", timestamp: date.getTime() };
  }

  return null;
}