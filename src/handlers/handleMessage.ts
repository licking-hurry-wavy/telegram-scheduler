export async function sendMessage(
  chatId: number,
  text: string,
  env: Env,
  options?: { reply_markup?: any; other?: Record<string, unknown> },
  media?: { type: "photo" | "video" | "document"; file_id: string }
) {
  const basePayload = {
    chat_id: chatId,
    parse_mode: "HTML",
    ...(options?.reply_markup && { reply_markup: options.reply_markup }),
    ...(options?.other && options.other)
  };

  const payload = media
    ? { ...basePayload, caption: text, [media.type]: media.file_id }
    : { ...basePayload, text };

  const endpoint = media ? endpointMap[media.type] : "sendMessage";

  console.log("📤 ส่งข้อความ:", JSON.stringify(payload, null, 2));

  return await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}