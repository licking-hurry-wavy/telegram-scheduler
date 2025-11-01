export async function notifyDeveloper(env: any, message: string) {
  const developerId = parseInt(env.DEVELOPER_ID);
  if (developerId) {
    await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: developerId, text: `📣 แจ้งเตือน:\n${message}` })
    });
  }
}