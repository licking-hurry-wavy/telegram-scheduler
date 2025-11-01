import { sendMessage } from "../utils/send";
import { setDraftState } from "../kv";
import { isValidCaption, isValidLink } from "../utils/validate";

const mockGroups = [
  { id: "group1", name: "📢 Marketing", roles: ["admin"] },
  { id: "group2", name: "📰 News", roles: ["admin", "editor"] },
  { id: "group3", name: "💬 Community", roles: ["admin", "editor", "user"] }
];

export async function handlePostFlow(text: string, ctx: any): Promise<Response> {
  const { chatId, userId, lang, env, role, draft } = ctx;

  switch (draft.state) {
    case "awaiting_caption":
      if (!isValidCaption(text)) {
        return await sendMessage(chatId, lang === "en"
          ? "⚠️ Caption too short. Please enter at least 3 characters."
          : "⚠️ แคปชั่นสั้นเกินไป กรุณาพิมพ์อย่างน้อย 3 ตัวอักษร", env);
      }

      await setDraftState(env, userId, "awaiting_buttons", {
        ...draft.data,
        caption: text
      });

      return await sendMessage(chatId, lang === "en"
        ? "🔘 Add buttons (optional)?"
        : "🔘 ต้องการเพิ่มปุ่มหรือไม่", env, {
        keyboard: [[lang === "en" ? "➕ Add Buttons" : "➕ เพิ่มปุ่ม"], [lang === "en" ? "➡️ Skip" : "➡️ ข้าม"]],
        resize_keyboard: true
      });

    case "awaiting_buttons":
      if (text.includes("➕") || text.includes("เพิ่ม")) {
        await setDraftState(env, userId, "awaiting_buttons_input", draft.data);
        return await sendMessage(chatId, lang === "en"
          ? "🔗 Send buttons in format: Label - https://example.com"
          : "🔗 ส่งปุ่มในรูปแบบ: ข้อความ - https://example.com", env);
      }

      await setDraftState(env, userId, "awaiting_group", draft.data);
      return await sendMessage(chatId, lang === "en"
        ? "🏷 Choose a group to post to"
        : "🏷 กรุณาเลือกกลุ่มที่ต้องการโพสต์", env);

    case "awaiting_buttons_input":
      if (!isValidLink(text)) {
        return await sendMessage(chatId, lang === "en"
          ? "⚠️ Invalid format. Use: Label - https://example.com"
          : "⚠️ รูปแบบไม่ถูกต้อง ใช้: ข้อความ - https://example.com", env);
      }

      const [label, url] = text.split(" - ");
      const button = { text: label.trim(), url: url.trim() };

      await setDraftState(env, userId, "awaiting_group", {
        ...draft.data,
        buttons: [button]
      });

      return await sendMessage(chatId, lang === "en"
        ? "🏷 Choose a group to post to"
        : "🏷 กรุณาเลือกกลุ่มที่ต้องการโพสต์", env);

    case "awaiting_group":
      const availableGroups = mockGroups.filter(g => g.roles.includes(role));
      const groupButtons = availableGroups.map(g => [g.name]);

      await setDraftState(env, userId, "awaiting_group_selection", draft.data);
      return await sendMessage(chatId, lang === "en"
        ? "📋 Select a group"
        : "📋 เลือกกลุ่ม", env, {
        keyboard: [...groupButtons, ["❌ Cancel"]],
        resize_keyboard: true
      });

    case "awaiting_group_selection":
      const selected = mockGroups.find(g => g.name === text);
      if (!selected) {
        return await sendMessage(chatId, lang === "en"
          ? "⚠️ Invalid group. Please choose from the list."
          : "⚠️ กลุ่มไม่ถูกต้อง กรุณาเลือกจากรายการ", env);
      }

      await setDraftState(env, userId, "awaiting_schedule", {
        ...draft.data,
        groupId: selected.id
      });

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
      if (text.includes("🚀") || text.includes("ทันที")) {
        await setDraftState(env, userId, "awaiting_preview", {
          ...draft.data,
          schedule: { type: "now" }
        });
        return await sendMessage(chatId, lang === "en"
          ? "👀 Preview your post before sending"
          : "👀 ดูตัวอย่างโพสต์ก่อนส่ง", env);
      }

      if (text.includes("🔁") || text.includes("ซ้ำ")) {
        await setDraftState(env, userId, "awaiting_repeat_input", draft.data);
        return await sendMessage(chatId, lang === "en"
          ? "🔁 Enter repeat interval (e.g. every 2 days)"
          : "🔁 พิมพ์ช่วงเวลาการโพสต์ซ้ำ เช่น ทุก 2 วัน", env);
      }

      if (text.includes("📆") || text.includes("กำหนด")) {
        await setDraftState(env, userId, "awaiting_datetime_input", draft.data);
        return await sendMessage(chatId, lang === "en"
          ? "📆 Enter date/time in format: YYYY-MM-DD HH:mm"
          : "📆 พิมพ์วันเวลาในรูปแบบ: YYYY-MM-DD HH:mm", env);
      }

      return await sendMessage(chatId, lang === "en"
        ? "⚠️ Invalid option. Please choose from the menu."
        : "⚠️ ตัวเลือกไม่ถูกต้อง กรุณาเลือกจากเมนู", env);

    case "awaiting_repeat_input":
      await setDraftState(env, userId, "awaiting_preview", {
        ...draft.data,
        schedule: { type: "repeat", interval: text }
      });

      return await sendMessage(chatId, lang === "en"
        ? "👀 Preview your post before sending"
        : "👀 ดูตัวอย่างโพสต์ก่อนส่ง", env);

    case "awaiting_datetime_input":
      await setDraftState(env, userId, "awaiting_preview", {
        ...draft.data,
        schedule: { type: "datetime", value: text }
      });

      return await sendMessage(chatId, lang === "en"
        ? "👀 Preview your post before sending"
        : "👀 ดูตัวอย่างโพสต์ก่อนส่ง", env);

    case "awaiting_preview":
      return await sendMessage(chatId, lang === "en"
        ? "✅ Ready to send. Confirm or edit."
        : "✅ พร้อมส่งแล้ว ยืนยันหรือแก้ไข", env, {
        keyboard: [[lang === "en" ? "✅ Confirm" : "✅ ยืนยัน"], [lang === "en" ? "🔙 Back" : "🔙 ย้อนกลับ"]],
        resize_keyboard: true
      });

    default:
      return await sendMessage(chatId, lang === "en"
        ? "⚠️ Unknown state. Please restart."
        : "⚠️ ไม่พบสถานะ กรุณาเริ่มใหม่", env);
  }
}