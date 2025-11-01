import {
  getPost,
  updatePost,
  deletePost
} from "../kv/post";

import { getUserSettings } from "../kv/settings";
import { sendMessage } from "../utils/send";
import { getMainMenu } from "../menus/main";
import { setDraftState } from "../kv/draft";

export async function handleCallbackQuery(callback: any, env: any): Promise<Response> {
  const userId = callback.from.id.toString();
  const chatId = callback.message.chat.id;
  const data = callback.data?.trim();
  const lang = (await getUserSettings(env, userId)).language || "th";

  if (!data || !data.includes(":")) {
    const message = lang === "en"
      ? "❌ Cannot process this command"
      : "❌ ไม่สามารถประมวลผลคำสั่งได้";
    return await sendMessage(chatId, message, env);
  }

  const [action, postId] = data.split(":");
  const post = await getPost(env, postId);
  if (!post) {
    const message = lang === "en"
      ? "⚠️ Post not found"
      : "⚠️ ไม่พบโพสต์";
    return await sendMessage(chatId, message, env, getMainMenu(lang));
  }

  const time = new Date(post.schedule).toLocaleString(lang === "en" ? "en-GB" : "th-TH", {
    timeZone: post.timezone || "Asia/Bangkok",
    hour12: false
  });

  switch (action) {
    case "view": {
      const preview = lang === "en"
        ? `👀 Post Preview\n\n📝 ${post.caption}\n🕒 Scheduled: ${time}`
        : `👀 พรีวิวโพสต์\n\n📝 ${post.caption}\n🕒 ตั้งเวลา: ${time}`;
      return await sendMessage(chatId, preview, env);
    }

    case "edit": {
      await setDraftState(env, userId, {
        state: "awaiting_post_edit",
        postId
      });
      const message = lang === "en"
        ? "✏️ Send the new caption"
        : "✏️ กรุณาส่งข้อความใหม่";
      return await sendMessage(chatId, message, env);
    }

    case "delete": {
      await deletePost(env, postId);
      const message = lang === "en"
        ? "🗑️ Post deleted"
        : "🗑️ ลบโพสต์เรียบร้อยแล้ว";
      return await sendMessage(chatId, message, env, getMainMenu(lang));
    }

    case "confirm": {
      await updatePost(env, postId, { confirmed: true });
      const message = lang === "en"
        ? "✅ Post confirmed"
        : "✅ โพสต์ได้รับการยืนยันแล้ว";
      return await sendMessage(chatId, message, env, getMainMenu(lang));
    }

    default: {
      const message = lang === "en"
        ? "❓ Unknown action"
        : "❓ ไม่เข้าใจคำสั่งที่คุณเลือก";
      return await sendMessage(chatId, message, env, getMainMenu(lang));
    }
  }
}

// ✅ Export alias for compatibility
export { handleCallbackQuery as handleCallback };