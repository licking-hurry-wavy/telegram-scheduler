import { handleMessage } from "./handlers/message";
import { handleCallback } from "./handlers/callback";
import { runScheduledPosts } from "./handlers/cron";
import { handleDeploy } from "./handlers/deploy";
import { setLastDeploy } from "./kv/meta";
import type { Env } from "./types/env"; // ✅ ใช้ type ที่คุณเตรียมไว้

let hasStarted = false;

async function sendStartupGreeting(env: Env) {
  const devId = parseInt(env.DEVELOPER_ID);
  const text = "🚀 บอทเริ่มทำงานแล้ว พร้อมให้บริการครับ!";
  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: devId,
      text,
      parse_mode: "HTML"
    })
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // ✅ trigger deploy reset ด้วยมือ
    if (url.pathname === "/deploy" && request.method === "GET") {
      await setLastDeploy(env);
      return new Response("✅ Deploy timestamp updated", { status: 200 });
    }

    // ✅ startup logic เมื่อ Worker เริ่มทำงาน
    if (!hasStarted) {
      hasStarted = true;
      ctx.waitUntil(sendStartupGreeting(env));
      ctx.waitUntil(setLastDeploy(env));
    }

    // ✅ Telegram webhook
    if (url.pathname === "/telegram" && request.method === "POST") {
      const start = Date.now();
      const update = await request.json();

      if (update.message?.text) {
        const userId = update.message.from?.id;
        const chatId = update.message.chat?.id;
        const text = update.message.text;
        console.log(`📨 [${userId}] ${chatId}: "${text}"`);
      }

      if (update.message) {
        ctx.waitUntil(
          (async () => {
            const res = await handleMessage(update.message, env, request);
            const elapsed = Date.now() - start;
            console.log(`📩 handleMessage latency: ${elapsed}ms`);
            return res;
          })()
        );
        return new Response("OK");
      }

      if (update.callback_query) {
        ctx.waitUntil(
          (async () => {
            const res = await handleCallback(update.callback_query, env);
            const elapsed = Date.now() - start;
            console.log(`🔘 handleCallback latency: ${elapsed}ms`);
            return res;
          })()
        );
        return new Response("OK");
      }

      return new Response("No message or callback", { status: 400 });
    }

    return new Response("Not found", { status: 404 });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const start = Date.now();
    await runScheduledPosts(env);
    const elapsed = Date.now() - start;
    console.log(`⏰ Cron latency: ${elapsed}ms`);
  }
};