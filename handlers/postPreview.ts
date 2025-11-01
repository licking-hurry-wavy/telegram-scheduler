import { getUserTimezone } from "../kv/settings";
import { getTimePreview12h } from "../utils/time";
import { getPostPreviewConfirmMenu } from "../menus/confirmPost";

export async function handlePostPreview(env, userId, chatId, lang, postTimeUTC) {
  const userTimezone = await getUserTimezone(env, userId);

  const preview = getTimePreview12h(postTimeUTC, [
    userTimezone,
    "Asia/Bangkok",
    "America/New_York",
    "Europe/London",
    "UTC"
  ]);

  const message = lang === "en"
    ? `📅 Preview post time:\n${preview}\n\n✅ Confirm this post?`
    : `📅 เวลาโพสต์ที่ตั้งไว้:\n${preview}\n\n✅ ยืนยันโพสต์นี้หรือไม่`;

  return await sendMessage(chatId, message, env, getPostPreviewConfirmMenu(lang));
}