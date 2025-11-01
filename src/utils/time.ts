export async function getTimezoneFromCoordinates(lat: number, lon: number): Promise<string | null> {
  const res = await fetch(`https://api.bigdatacloud.net/data/timezone-by-location?latitude=${lat}&longitude=${lon}&key=YOUR_API_KEY`);
  const json = await res.json();
  return json?.timezone?.ianaTimeId || null;
}

export function getCurrentTimeInTimezone(timezone: string): string {
  return new Date().toLocaleString("th-TH", { timeZone: timezone });
}

export function getTimePreview12h(postTimeUTC: string, timezones: string[]): string {
  const utcDate = new Date(postTimeUTC);
  return timezones.map(zone => {
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
  }).join("\n");
}