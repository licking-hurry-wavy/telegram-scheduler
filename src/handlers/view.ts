import { listQueue } from "../kv/queue";
import { sendMessage } from "../utils/send";

export async function handleView(userId: number, env: any) {
  const posts = await listQueue(env);
  const userPosts = posts.filter(p => p.userId === String(userId));

  if (userPosts.length === 0) {
    await sendMessage(userId, "📭 คุณยังไม่มีโพสต์ที่ตั้งเวลาไว้", env);
    return new Response("OK");
  }

  for (const [i, post] of userPosts.entries()) {
    const summary = `
📌 โพสต์ #${i + 1}
📸 Media: ${post.media.length} รายการ
✍️ Caption: ${post.caption || "ไม่มี"}
🔗 Buttons: ${post.buttons?.length || 0}
⏰ Schedule: ${post.schedule}
👥 Groups: ${post.groupIds?.join(", ") || "ไม่มี"}
`;

    await sendMessage(userId, summary, env, [
      [{ text: "✏️ แก้ไข", callback_data: `edit_${i}` }],
      [{ text: "🗑 ลบ", callback_data: `delete_${i}` }]
    ]);
  }

  return new Response("OK");
}