let botStartTime = Date.now();

export function getUptime(): string {
  const now = Date.now();
  const diffMs = now - botStartTime;
  const minutes = Math.floor(diffMs / 1000 / 60) % 60;
  const hours = Math.floor(diffMs / 1000 / 60 / 60) % 24;
  const days = Math.floor(diffMs / 1000 / 60 / 60 / 24);
  return `${days} วัน ${hours} ชั่วโมง ${minutes} นาที`;
}

export function getMemoryUsage(): string {
  if (typeof process !== "undefined" && process.memoryUsage) {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    return `${used.toFixed(1)} MB`;
  }
  return "ไม่สามารถตรวจสอบได้";
}

export function measureLatency(start: number): string {
  const end = Date.now();
  const diffMs = end - start;
  const seconds = (diffMs / 1000).toFixed(2);
  return `${seconds} วินาที`;
}

export function getBotVersion(env: any): string {
  return env.BOT_VERSION || "ไม่ทราบเวอร์ชัน";
}

export function getClientIP(request: Request): string {
  return request?.headers?.get("cf-connecting-ip")
    || request?.headers?.get("x-forwarded-for")
    || "ไม่ทราบ IP";
}

export function getStatusMessage({
  role,
  timezone,
  lang
}: {
  role: string;
  timezone: string;
  lang: string;
}): string {
  const roleMap = {
    admin: lang === "th" ? "ผู้ดูแลระบบ" : "Admin",
    developer: lang === "th" ? "นักพัฒนา" : "Developer",
    editor: lang === "th" ? "ผู้แก้ไข" : "Editor",
    user: lang === "th" ? "ผู้ใช้ทั่วไป" : "User"
  };

  const roleLabel = roleMap[role] || (lang === "th" ? `บทบาท: ${role}` : `Role: ${role}`);
  return `${roleLabel}\nTimezone: ${timezone}`;
}

export async function handleBotStatus(request: Request, env: any, lang: string): Promise<string> {
  const start = Date.now();
  const uptime = getUptime();
  const memory = getMemoryUsage();
  const latency = measureLatency(start);
  const version = getBotVersion(env);
  const now = new Date().toLocaleString(lang === "en" ? "en-GB" : "th-TH", {
    timeZone: "Asia/Bangkok",
    hour12: false
  });

  return lang === "en"
    ? `🤖 Bot Name: Telegram Scheduler
📛 Username: @telegram_scheduler_bot
🧩 Version: ${version}

📶 Status: ✅ Online
⏱️ Uptime: ${uptime}
⚡️ Response Time: ${latency}
🧠 Memory Usage: ${memory}
🕒 Last Checked: ${now}`
    : `🤖 ชื่อบอท: Telegram Scheduler
📛 Username: @telegram_scheduler_bot
🧩 เวอร์ชัน: ${version}

📶 สถานะ: ✅ ออนไลน์
⏱️ Run time: ${uptime}
⚡️ ตอบกลับภายใน: ${latency}
🧠 Memory usage: ${memory}
🕒 ตรวจสอบล่าสุด: ${now}`;
}

export async function handleServerStatus(request: Request, env: any, lang: string): Promise<string> {
  const start = Date.now();
  const latency = measureLatency(start);
  const memory = "128.7 MB"; // mock
  const uptime = "27 วัน 18 ชั่วโมง 5 นาที"; // mock
  const ip = getClientIP(request);
  const now = new Date().toLocaleString(lang === "en" ? "en-GB" : "th-TH", {
    timeZone: "Asia/Singapore",
    hour12: false
  });

  return lang === "en"
    ? `🌐 Server Status: ✅ Online
📍 Location: Singapore
🌐 IP: ${ip}

⏱️ Uptime: ${uptime}
⚡️ Response Time: ${latency}
🧠 Memory Usage: ${memory}
🕓 Time Zone: Asia/Singapore
🕒 Last Checked: ${now}`
    : `🌐 สถานะ: ✅ ออนไลน์
📍 ตำแหน่ง: สิงคโปร์
🌐 IP: ${ip}

⏱️ Run time: ${uptime}
⚡️ ตอบกลับภายใน: ${latency}
🧠 Memory usage: ${memory}
🕓 Time Zone: Asia/Singapore
🕒 ตรวจสอบล่าสุด: ${now}`;
}