import { getQueue, updatePost, deletePost } from "../kv/queue";
import { sendMessage } from "../utils/send";

export async function showQueue(env: any, userId: number) {
  const posts = await getQueue(env, userId);
  if (posts.length === 0) return await sendMessage(userId, "📭 ไม่มีโพสต์ในคิว", env);

  for (const post of posts) {
    await sendMessage(userId, `📝 โพสต์:\n${post.caption || "ไม่มีข้อความ"}\n🕒 เวลา: ${new Date(post.schedule).toLocaleString()}`, env, {
      inline_keyboard: [
        [{ text: "✏️ แก้ไข", callback_data: `edit:${post.id}` }],
        [{ text: "🗑️ ลบ", callback_data: `delete:${post.id}` }]
      ]
    });
  }
}