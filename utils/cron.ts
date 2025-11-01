export function shouldSendNow(schedule: string, now: Date): boolean {
  if (schedule === "now") return true;

  if (schedule.startsWith("every")) {
    const [_, value, unit] = schedule.split(" ");
    const ms = parseInt(value) * {
      m: 60000,
      h: 3600000,
      d: 86400000,
      mo: 2592000000,
      y: 31536000000
    }[unit[0]];
    return now.getTime() % ms < 60000;
  }

  try {
    return now.toISOString().slice(0, 16) === schedule.slice(0, 16);
  } catch {
    return false;
  }
}