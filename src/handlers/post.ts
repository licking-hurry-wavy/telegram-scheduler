import { setDraftState, clearDraft, getDraft } from "../kv";
import { sendMessage } from "../utils/send";

function renderInlineButtons(buttons: { label: string; url: string }[], layout: "single" | "multi") {
  if (layout === "single") {
    return buttons.map(b => [{ text: b.label, url: b.url }]);
  }
  const rows: any[] = [];
  for (let i = 0; i < buttons.length; i += 2) {
    const row = [buttons[i]];
    if (buttons[i + 1]) row.push(buttons[i + 1]);
    rows.push(row.map(b => ({ text: b.label, url: b.url })));
  }
  return rows;
}

async function renderPreview(chatId: number, lang: string, env: any, draft: any) {
  const { media, caption, buttons = [], layout = "single" } = draft.data || {};
  const inline_keyboard = buttons.length > 0 ? renderInlineButtons(buttons, layout) : undefined;

  return await sendMessage(chatId, caption || "(ไม่มีข้อความ)", env, {
    reply_markup: { inline_keyboard }
  }, media);
}

export async function handlePostFlow(text: string, context: any) {
  const { chatId, userId, lang, env, draft } = context;

  switch (draft?.state) {
    case "awaiting_media":
      return await sendMessage(chatId, lang === "en"
        ? "📎 Please attach your media (photo/video/document)"
        : "📎 กรุณาแนบสื่อของคุณ (รูปภาพ วิดีโอ หรือเอกสาร)", env);

    case "awaiting_caption":
      await setDraftState(env, userId, "awaiting_buttons", { ...draft.data, caption: text });
      return await sendMessage(chatId, lang === "en"
        ? "🔗 Add link buttons or skip"
        : "🔗 เพิ่มปุ่มลิงก์หรือข้าม", env, {
        keyboard: [[
          lang === "en" ? "➕ Add Link Button" : "➕ เพิ่มปุ่มลิงก์",
          lang === "en" ? "⏭️ Skip" : "⏭️ ข้าม"
        ]],
        resize_keyboard: true
      });

    case "awaiting_buttons":
      if (text.includes("➕") || text.includes("เพิ่ม")) {
        await setDraftState(env, userId, "awaiting_buttons_input", draft.data);
        return await sendMessage(chatId, lang === "en"
          ? "🔗 Send link in format: Label - https://example.com"
          : "🔗 ส่งลิงก์ในรูปแบบ: ข้อความ - https://example.com", env);
      }
      if (text.includes("⏭️")) {
        await setDraftState(env, userId, "awaiting_group", draft.data);
        return await sendMessage(chatId, lang === "en"
          ? "🏷 Choose a group to post to"
          : "🏷 กรุณาเลือกกลุ่มที่ต้องการโพสต์", env);
      }
      break;

    case "awaiting_buttons_input":
      const [label, url] = text.split(" - ");
      const buttons = [...(draft.data?.buttons || []), { label, url }];
      await setDraftState(env, userId, "awaiting_buttons", { ...draft.data, buttons });
      return await sendMessage(chatId, lang === "en"
        ? "✅ Button added. Add more or skip."
        : "✅ เพิ่มปุ่มแล้ว เพิ่มอีกหรือข้าม", env, {
        keyboard: [[
          lang === "en" ? "➕ Add Another" : "➕ เพิ่มอีก",
          lang === "en" ? "⏭️ Done" : "⏭️ เสร็จสิ้น"
        ]],
        resize_keyboard: true
      });

    case "awaiting_group":
      await setDraftState(env, userId, "awaiting_schedule", draft.data);
      return await sendMessage(chatId, lang === "en"
        ? "📅 Choose how to schedule your post"
        : "📅 เลือกรูปแบบการตั้งเวลาโพสต์", env, {
        keyboard: [[
          lang === "en" ? "🚀 Post Now" : "🚀 โพสต์ทันที",
          lang === "en" ? "🔁 Repeat" : "🔁 โพสต์ซ้ำ",
          lang === "en" ? "📆 Specific Date/Time" : "📆 กำหนดวันเวลา"
        ]],
        resize_keyboard: true
      });

    case "awaiting_schedule":
      await setDraftState(env, userId, "awaiting_preview", { ...draft.data, schedule: text });
      return await sendMessage(chatId, lang === "en"
        ? "🖼 Preview your post before sending"
        : "🖼 ตรวจสอบโพสต์ก่อนส่งจริง", env, {
        keyboard: [[
          lang === "en" ? "📤 Confirm Post" : "📤 ยืนยันโพสต์",
          lang === "en" ? "✏️ Edit Post" : "✏️ แก้ไขโพสต์"
        ]],
        resize_keyboard: true
      });

    case "awaiting_preview":
      if (text.includes("📤")) {
        await clearDraft(env, userId);
        return await sendMessage(chatId, lang === "en"
          ? "✅ Your post has been sent!"
          : "✅ โพสต์ของคุณถูกส่งเรียบร้อยแล้ว", env);
      }
      if (text.includes("✏️")) {
        await setDraftState(env, userId, "awaiting_caption", draft.data);
        return await sendMessage(chatId, lang === "en"
          ? "✏️ Please edit your caption"
          : "✏️ กรุณาแก้ไขแคปชั่นของคุณ", env);
      }

      return await renderPreview(chatId, lang, env, draft);
  }

  await setDraftState(env, userId, "awaiting_media");
  return await sendMessage(chatId, lang === "en"
    ? "➕ Let's start a new post. Please attach your media."
    : "➕ มาเริ่มโพสต์ใหม่กันครับ กรุณาแนบสื่อ", env);
}