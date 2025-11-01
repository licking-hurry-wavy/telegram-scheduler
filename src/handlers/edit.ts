import { listQueue } from "../kv/queue";
import { sendMessage } from "../utils/send";
import { saveDraft } from "../kv/draft";
import { getMainMenu } from "../utils/menu";

export async function handleEdit(userId: number, index: number, env: any) {
  const posts = await listQueue(env);
  const userPosts = posts.filter(p => p.userId === String(userId));
  const post = userPosts[index];

  if (!post) {
    await sendMessage(userId, "❌ ไม่พบโพสต์ที่ต้องการแก้ไข", env);
    return new Response("Not Found");
  }

  await saveDraft(env, userId, post);
  await sendMessage(userId, "✏️ โพสต์ถูกโหลดเข้าสู่ร่างแล้ว คุณสามารถแก้ไขได้", env, getMainMenu());
  return new Response("OK");
}