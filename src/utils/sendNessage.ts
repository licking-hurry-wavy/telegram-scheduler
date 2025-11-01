export async function sendMessage(chatId: number, text: string, env: Env, extra?: Record<string, unknown>) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...extra
  };

  console.log("📤 ส่งข้อความ:", JSON.stringify(payload, null, 2));

  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}