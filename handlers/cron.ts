import { getQueue, removeFromQueue } from "../kv/queue";
import { sendScheduledPost } from "../utils/send";

export async function runScheduledPosts(env: any): Promise<void> {
  const now = Date.now();
  console.log("⏰ เริ่มตรวจสอบโพสต์ที่ถึงเวลา");

  const allUserIds = await env.QUEUE.list(); // สมมุติว่าใช้ KV namespace QUEUE
  for (const key of allUserIds.keys) {
    const userId = key.name;
    const queue = await getQueue(env, userId);

    for (const post of queue) {
      if (!post.schedule || !post.group_id || !post.media?.file_id) continue;

      const scheduledTime = new Date(post.schedule).getTime();
      if (Math.abs(scheduledTime - now) > 60000) continue; // ±1 นาที

      console.log(`📤 กำลังส่งโพสต์ ${post.id} ของผู้ใช้ ${userId}`);

      const success = await sendScheduledPost(env, post);
      if (success) {
        console.log(`✅ ส่งโพสต์ ${post.id} สำเร็จ`);
        if (!post.repeat) {
          await removeFromQueue(env, userId, post.id);
          console.log(`🗑 ลบโพสต์ ${post.id} ออกจากคิว`);
        }
      } else {
        console.log(`❌ ส่งโพสต์ ${post.id} ล้มเหลว`);
      }
    }
  }

  console.log("⏰ ตรวจสอบโพสต์เสร็จสิ้น");
}