import { listQueue, removeFromQueue } from "../kv/queue";
import { sendMessage } from "../utils/send";
import { isAuthorized } from "../utils/checkAccess";

export async function handleDelete(userId: number, index: number, env: any) {
  if (!isAuthorized(userId)) {
    await sendMessage(userId, "🚫 คุณไม่มีสิทธิ์ลบโพสต์", env);
    return new Response("Unauthorized");
  }

  const posts = await listQueue(env);
  const userPosts = posts.filter(p => p.userId === String(userId));
  const post = userPosts[index];

  if (!post) {
    await sendMessage(userId, "❌ ไม่พบโพสต์ที่ต้องการลบ", env);
    return new Response("Not Found");
  }

  await removeFromQueue(env, userId);
  await sendMessage(userId, "🗑 โพสต์ถูกลบเรียบร้อยแล้ว", env);
  return new Response("OK");
}