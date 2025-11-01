export async function getBotChatMember(env: any, chatId: number): Promise<any> {
  const url = `https://api.telegram.org/bot${env.BOT_TOKEN}/getChatMember`;
  const payload = {
    chat_id: chatId,
    user_id: parseInt(env.BOT_ID)
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.result;
}