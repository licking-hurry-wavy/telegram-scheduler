import { handleStart } from "./start";
import { sendMessage } from "../utils/send";
import { getDraft, clearDraft } from "../kv/draft";
import { getLastDeploy } from "../kv/meta";

export async function handleMessage(env, message) {
  const userId = message.from.id.toString();
  const chatId = message.chat.id.toString();
  const text = message.text?.trim();

  const draft = await getDraft(env, userId);
  const lastDeploy = await getLastDeploy(env);

  const isStale = draft?.updatedAt && draft.updatedAt < lastDeploy;
  const isTimeout = draft?.updatedAt && Date.now() - draft.updatedAt > 60_000;

  if (!draft || isStale || isTimeout || text === "/start" || text === "🔙 กลับหน้าแรก") {
    await clearDraft(env, userId);
    return await handleStart(env, userId, chatId);
  }

  return await sendMessage(chatId, "❓ ไม่เข้าใจคำสั่ง", env);
}