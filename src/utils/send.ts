export async function sendMessage(
  chatId: number,
  text: string,
  env: any,
  options?: any,
  media?: { type: string; file_id: string }
) {
  const payload: any = {
    chat_id: chatId,
    caption: text,
    parse_mode: "HTML",
    ...options
  };

  if (media) {
    payload[media.type] = media.file_id;

    const endpointMap: Record<string, string> = {
      photo: "sendPhoto",
      video: "sendVideo",
      document: "sendDocument",
      animation: "sendAnimation"
    };

    const endpoint = endpointMap[media.type] || "sendMessage";
    return await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  return await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...options
    })
  });
}