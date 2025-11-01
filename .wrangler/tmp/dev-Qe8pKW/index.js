var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/kv/access.ts
var USER_PREFIX = "user:";
var ACCESS_PREFIX = "access:";
async function getAccessRole(env, userId) {
  const userKey = `${USER_PREFIX}${userId}:role`;
  const fallbackKey = `${ACCESS_PREFIX}${userId}:role`;
  const raw = await env.ACCESS.get(userKey);
  if (raw) return raw;
  const fallback = await env.ACCESS.get(fallbackKey);
  return fallback || "user";
}
__name(getAccessRole, "getAccessRole");

// src/kv/settings.ts
var PREFIX = "settings:";
async function getUserSettings(env, userId) {
  const raw = await env.SETTINGS.get(`${PREFIX}${userId}`);
  const settings = raw ? JSON.parse(raw) : {};
  if (!settings.language) settings.language = "th";
  if (!settings.timezone) settings.timezone = "Asia/Bangkok";
  return settings;
}
__name(getUserSettings, "getUserSettings");
async function setUserLanguage(env, userId, language) {
  const settings = await getUserSettings(env, userId);
  settings.language = language;
  await env.SETTINGS.put(`${PREFIX}${userId}`, JSON.stringify(settings));
}
__name(setUserLanguage, "setUserLanguage");
async function setUserTimezone(env, userId, timezone) {
  const settings = await getUserSettings(env, userId);
  settings.timezone = timezone;
  await env.SETTINGS.put(`${PREFIX}${userId}`, JSON.stringify(settings));
}
__name(setUserTimezone, "setUserTimezone");

// src/kv/draft.ts
var PREFIX2 = "draft:";
async function getDraft(env, userId) {
  const raw = await env.DRAFT.get(`${PREFIX2}${userId}`);
  return raw ? JSON.parse(raw) : null;
}
__name(getDraft, "getDraft");
async function setDraftState(env, userId, state) {
  const draft = await getDraft(env, userId) || {};
  draft.state = state;
  draft.updatedAt = Date.now();
  await env.DRAFT.put(`${PREFIX2}${userId}`, JSON.stringify(draft));
}
__name(setDraftState, "setDraftState");
async function clearDraft(env, userId) {
  await env.DRAFT.delete(`${PREFIX2}${userId}`);
}
__name(clearDraft, "clearDraft");

// src/kv/meta.ts
var KEY = "meta:lastDeploy";
async function setLastDeploy(env) {
  await env.META.put(KEY, Date.now().toString());
}
__name(setLastDeploy, "setLastDeploy");

// src/kv/post.ts
var POST_PREFIX = "post:";
async function savePost(env, post) {
  await env.POSTS.put(`${POST_PREFIX}${post.id}`, JSON.stringify(post));
}
__name(savePost, "savePost");
async function getPost(env, id) {
  const raw = await env.POSTS.get(`${POST_PREFIX}${id}`);
  return raw ? JSON.parse(raw) : null;
}
__name(getPost, "getPost");
async function updatePost(env, id, updates) {
  const existing = await getPost(env, id);
  if (!existing) return;
  const updated = { ...existing, ...updates, updatedAt: Date.now() };
  await savePost(env, updated);
}
__name(updatePost, "updatePost");
async function deletePost(env, id) {
  await env.POSTS.delete(`${POST_PREFIX}${id}`);
}
__name(deletePost, "deletePost");

// src/utils/send.ts
var endpointMap = {
  photo: "sendPhoto",
  video: "sendVideo",
  document: "sendDocument"
};
async function sendMessage(chatId, text, env, options, media) {
  const basePayload = {
    chat_id: chatId,
    parse_mode: "HTML",
    ...options?.reply_markup && { reply_markup: options.reply_markup },
    ...options?.other && options.other
  };
  const payload = media ? {
    ...basePayload,
    caption: text,
    [media.type]: media.file_id
  } : {
    ...basePayload,
    text
  };
  const endpoint = media ? endpointMap[media.type] : "sendMessage";
  console.log("\u{1F4E4} \u0E2A\u0E48\u0E07\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21:", JSON.stringify(payload, null, 2));
  return await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
__name(sendMessage, "sendMessage");
async function sendScheduledPost(post, env) {
  const { chat_id, text, media } = post;
  return await sendMessage(chat_id, text, env, void 0, media);
}
__name(sendScheduledPost, "sendScheduledPost");

// src/menus/main.ts
function getMainMenu(lang) {
  const isEn = lang === "en";
  const t = /* @__PURE__ */ __name((th, en) => isEn ? en : th, "t");
  return {
    keyboard: [
      [t("\u2795 \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E42\u0E1E\u0E2A\u0E15\u0E4C", "\u2795 Add Post"), t("\u{1F4C6} \u0E14\u0E39\u0E42\u0E1E\u0E2A\u0E15\u0E4C\u0E17\u0E35\u0E48\u0E15\u0E31\u0E49\u0E07\u0E44\u0E27\u0E49", "\u{1F4C6} View Scheduled Posts")],
      [t("\u{1F6E0} \u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32", "\u{1F6E0} Settings"), t("\u{1F464} \u0E41\u0E2A\u0E14\u0E07\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C", "\u{1F464} View Role Status")]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };
}
__name(getMainMenu, "getMainMenu");

// src/menus/settings.ts
function getSettingsMenu(role, lang) {
  const isEn = lang === "en";
  const t = /* @__PURE__ */ __name((th, en) => isEn ? en : th, "t");
  const rows = [];
  rows.push([
    t("\u{1F30D} \u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E20\u0E32\u0E29\u0E32", "\u{1F30D} Change Language"),
    t("\u23F0 \u0E15\u0E31\u0E49\u0E07 Time Zone", "\u23F0 Set Time Zone")
  ]);
  if (role === "developer") {
    rows.push([
      t("\u{1F4CA} \u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E01\u0E25\u0E38\u0E48\u0E21", "\u{1F4CA} Manage Groups"),
      t("\u{1F6E1}\uFE0F \u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49", "\u{1F6E1}\uFE0F Manage User Roles")
    ]);
    rows.push([
      t("\u{1F916} \u0E40\u0E0A\u0E47\u0E04\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E1A\u0E2D\u0E17", "\u{1F916} Check Bot Status"),
      t("\u{1F310} \u0E40\u0E0A\u0E47\u0E04\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E40\u0E0B\u0E34\u0E23\u0E4C\u0E1F\u0E40\u0E27\u0E2D\u0E23\u0E4C", "\u{1F310} Check Server Status")
    ]);
    rows.push([t("\u{1F504} \u0E23\u0E35\u0E2A\u0E15\u0E32\u0E23\u0E4C\u0E17\u0E1A\u0E2D\u0E17", "\u{1F504} Restart Bot")]);
  } else {
    rows.push([
      t("\u{1F4CA} \u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E01\u0E25\u0E38\u0E48\u0E21", "\u{1F4CA} Manage Groups"),
      t("\u{1F916} \u0E40\u0E0A\u0E47\u0E04\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E1A\u0E2D\u0E17", "\u{1F916} Check Bot Status")
    ]);
  }
  rows.push([t("\u{1F519} \u0E01\u0E25\u0E31\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E23\u0E01", "\u{1F519} Back to Home")]);
  return {
    keyboard: rows,
    resize_keyboard: true
  };
}
__name(getSettingsMenu, "getSettingsMenu");

// src/menus/timezone.ts
function getTimezoneInputMenu(lang = "th") {
  return {
    keyboard: [
      [lang === "en" ? "\u2328\uFE0F Type Time Zone" : "\u2328\uFE0F \u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E0A\u0E37\u0E48\u0E2D Time Zone"],
      [{
        text: lang === "en" ? "\u{1F4CD} Share Location" : "\u{1F4CD} \u0E41\u0E0A\u0E23\u0E4C\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07",
        request_location: true
      }]
    ],
    resize_keyboard: true
  };
}
__name(getTimezoneInputMenu, "getTimezoneInputMenu");
function getTimezoneConfirmMenu(lang = "th") {
  return {
    keyboard: [[
      lang === "en" ? "\u2705 Save Time Zone" : "\u2705 \u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E41\u0E1B\u0E25\u0E07",
      lang === "en" ? "\u274C Cancel" : "\u274C \u0E22\u0E01\u0E40\u0E25\u0E34\u0E01"
    ]],
    resize_keyboard: true
  };
}
__name(getTimezoneConfirmMenu, "getTimezoneConfirmMenu");

// src/constants.ts
var globalStartTime = Date.now();

// src/handlers/message.ts
function isValidTimeZone(tz) {
  try {
    (/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
__name(isValidTimeZone, "isValidTimeZone");
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
__name(formatDate, "formatDate");
function formatUptime(ms) {
  const totalSeconds = Math.floor(ms / 1e3);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor(totalSeconds % 86400 / 3600);
  const minutes = Math.floor(totalSeconds % 3600 / 60);
  return `${days} \u0E27\u0E31\u0E19 ${hours} \u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07 ${minutes} \u0E19\u0E32\u0E17\u0E35`;
}
__name(formatUptime, "formatUptime");
async function handleMessage(message, env, request) {
  const start = Date.now();
  const clientIP = request.headers.get("cf-connecting-ip") || "\u0E44\u0E21\u0E48\u0E17\u0E23\u0E32\u0E1A IP";
  const city = request.cf?.city || "\u0E44\u0E21\u0E48\u0E17\u0E23\u0E32\u0E1A\u0E40\u0E21\u0E37\u0E2D\u0E07";
  const country = request.cf?.country || "\u0E44\u0E21\u0E48\u0E17\u0E23\u0E32\u0E1A\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28";
  const userId = message.from.id.toString();
  const chatId = message.chat.id;
  const text = message.text?.trim();
  const role = await getAccessRole(env, userId);
  const settings = await getUserSettings(env, userId);
  const lang = settings.language || "th";
  const draft = await getDraft(env, userId);
  if (["/start", "\u{1F504} \u0E23\u0E35\u0E2A\u0E15\u0E32\u0E23\u0E4C\u0E17\u0E1A\u0E2D\u0E17", "\u{1F504} Restart Bot"].includes(text)) {
    await clearDraft(env, userId);
    return await sendMessage(chatId, lang === "en" ? "\u{1F916} Bot restarted and ready to serve." : "\u{1F916} \u0E1A\u0E2D\u0E17\u0E40\u0E23\u0E34\u0E48\u0E21\u0E17\u0E33\u0E07\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E2B\u0E49\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E04\u0E23\u0E31\u0E1A", env, getMainMenu(lang));
  }
  if (["\u{1F519} \u0E01\u0E25\u0E31\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E23\u0E01", "\u{1F519} Back to Home"].includes(text)) {
    return await sendMessage(chatId, lang === "en" ? "\u{1F4CB} Main menu" : "\u{1F4CB} \u0E40\u0E21\u0E19\u0E39\u0E2B\u0E25\u0E31\u0E01", env, getMainMenu(lang));
  }
  if (["\u{1F6E0} \u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32", "\u{1F6E0} Settings", "\u{1F519} \u0E01\u0E25\u0E31\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32", "\u{1F519} Back to Settings"].includes(text)) {
    return await sendMessage(chatId, lang === "en" ? "\u{1F6E0} Settings menu" : "\u{1F6E0} \u0E40\u0E21\u0E19\u0E39\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32", env, getSettingsMenu(role, lang));
  }
  if (["\u{1F30D} \u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E20\u0E32\u0E29\u0E32", "\u{1F30D} Change Language"].includes(text)) {
    return await sendMessage(chatId, lang === "en" ? "\u{1F30D} Choose your language" : "\u{1F30D} \u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E20\u0E32\u0E29\u0E32", env, {
      keyboard: [["\u{1F1F9}\u{1F1ED} \u0E44\u0E17\u0E22", "\u{1F1EC}\u{1F1E7} English"], ["\u{1F519} \u0E01\u0E25\u0E31\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32"]],
      resize_keyboard: true
    });
  }
  if (["\u{1F1F9}\u{1F1ED} \u0E44\u0E17\u0E22", "\u{1F1F9}\u{1F1ED} Thai"].includes(text)) {
    await setUserLanguage(env, userId, "th");
    return await sendMessage(chatId, "\u2705 \u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E20\u0E32\u0E29\u0E32\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E17\u0E22\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27", env, getSettingsMenu(role, "th"));
  }
  if (["\u{1F1EC}\u{1F1E7} English"].includes(text)) {
    await setUserLanguage(env, userId, "en");
    return await sendMessage(chatId, "\u2705 Language changed to English", env, getSettingsMenu(role, "en"));
  }
  if (["\u23F0 \u0E15\u0E31\u0E49\u0E07 Time Zone", "\u23F0 Set Time Zone"].includes(text)) {
    await setDraftState(env, userId, "awaiting_timezone");
    return await sendMessage(chatId, lang === "en" ? "\u23F0 Please enter your time zone (e.g. Asia/Bangkok)" : "\u23F0 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E0A\u0E37\u0E48\u0E2D Time Zone \u0E40\u0E0A\u0E48\u0E19 Asia/Bangkok", env, getTimezoneInputMenu(lang));
  }
  if (draft?.state === "awaiting_timezone") {
    const normalized = text.startsWith("Asia/") ? text : `Asia/${text.replace(/\s+/g, "_")}`;
    if (!isValidTimeZone(normalized)) {
      const message3 = lang === "en" ? `\u274C Invalid time zone: ${text}
Please send a valid IANA time zone (e.g. Asia/Bangkok)` : `\u274C Time Zone \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: ${text}
\u0E01\u0E23\u0E38\u0E13\u0E32\u0E2A\u0E48\u0E07\u0E0A\u0E37\u0E48\u0E2D Time Zone \u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 \u0E40\u0E0A\u0E48\u0E19 Asia/Bangkok`;
      return await sendMessage(chatId, message3, env, getTimezoneInputMenu(lang));
    }
    await setDraftState(env, userId, "awaiting_timezone_confirm", { tempTZ: normalized });
    const message2 = lang === "en" ? `\u2705 Time zone detected: ${normalized}
Do you want to save it?` : `\u2705 \u0E15\u0E23\u0E27\u0E08\u0E1E\u0E1A Time Zone: ${normalized}
\u0E04\u0E38\u0E13\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E21\u0E48`;
    return await sendMessage(chatId, message2, env, getTimezoneConfirmMenu(lang));
  }
  if (draft?.state === "awaiting_timezone_confirm") {
    const tempTZ = draft?.data?.tempTZ;
    if (["\u2705 \u0E15\u0E01\u0E25\u0E07", "\u2705 Confirm", "\u2705 Save Time Zone", "\u2705 \u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E41\u0E1B\u0E25\u0E07"].includes(text)) {
      await setUserTimezone(env, userId, tempTZ);
      await clearDraft(env, userId);
      const message3 = lang === "en" ? `\u2705 Time zone set to ${tempTZ}` : `\u2705 \u0E15\u0E31\u0E49\u0E07 Time Zone \u0E40\u0E1B\u0E47\u0E19 ${tempTZ} \u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27`;
      return await sendMessage(chatId, message3, env, getSettingsMenu(role, lang));
    }
    if (["\u274C \u0E22\u0E01\u0E40\u0E25\u0E34\u0E01", "\u274C Cancel"].includes(text)) {
      await clearDraft(env, userId);
      const message3 = lang === "en" ? "\u274C Time zone setup cancelled." : "\u274C \u0E22\u0E01\u0E40\u0E25\u0E34\u0E01\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32 Time Zone \u0E41\u0E25\u0E49\u0E27";
      return await sendMessage(chatId, message3, env, getSettingsMenu(role, lang));
    }
    const message2 = lang === "en" ? "\u2753 Please confirm or cancel." : "\u2753 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14 \u0E15\u0E01\u0E25\u0E07 \u0E2B\u0E23\u0E37\u0E2D \u0E22\u0E01\u0E40\u0E25\u0E34\u0E01";
    return await sendMessage(chatId, message2, env, getTimezoneConfirmMenu(lang));
  }
  if (["\u2795 \u0E40\u0E1E\u0E34\u0E48\u0E21\u0E42\u0E1E\u0E2A\u0E15\u0E4C", "\u2795 Add Post"].includes(text)) {
    await setDraftState(env, userId, "awaiting_post_title");
    const msg = lang === "en" ? "\u{1F4DD} Please send the title of your post" : "\u{1F4DD} \u0E01\u0E23\u0E38\u0E13\u0E32\u0E2A\u0E48\u0E07\u0E0A\u0E37\u0E48\u0E2D\u0E42\u0E1E\u0E2A\u0E15\u0E4C\u0E17\u0E35\u0E48\u0E04\u0E38\u0E13\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E15\u0E31\u0E49\u0E07\u0E40\u0E27\u0E25\u0E32";
    return await sendMessage(chatId, msg, env);
  }
  if (["\u{1F4C6} \u0E14\u0E39\u0E42\u0E1E\u0E2A\u0E15\u0E4C\u0E17\u0E35\u0E48\u0E15\u0E31\u0E49\u0E07\u0E44\u0E27\u0E49", "\u{1F4C6} View Scheduled Posts"].includes(text)) {
    const msg = lang === "en" ? "\u{1F4ED} This feature is currently unavailable." : "\u{1F4ED} \u0E1F\u0E35\u0E40\u0E08\u0E2D\u0E23\u0E4C\u0E19\u0E35\u0E49\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E43\u0E19\u0E02\u0E13\u0E30\u0E19\u0E35\u0E49";
    return await sendMessage(chatId, msg, env);
  }
  if (["\u{1F464} \u0E41\u0E2A\u0E14\u0E07\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C", "\u{1F464} Show Access Role"].includes(text)) {
    const username = message.from.username ? `@${message.from.username}` : lang === "en" ? "(no username)" : "(\u0E44\u0E21\u0E48\u0E21\u0E35 username)";
    const userIdText = `User ID: ${userId}`;
    const roleLabel = (() => {
      if (role === "developer") return lang === "en" ? "Developer" : "\u0E1C\u0E39\u0E49\u0E1E\u0E31\u0E12\u0E19\u0E32";
      if (role === "admin") return lang === "en" ? "Administrator" : "\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A";
      return role;
    })();
    const roleText = lang === "en" ? `Role: ${roleLabel}` : `\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C: ${roleLabel}`;
    const timezoneText = settings.timezone ? lang === "en" ? `Time Zone: ${settings.timezone}` : `\u0E40\u0E02\u0E15\u0E40\u0E27\u0E25\u0E32: ${settings.timezone}` : lang === "en" ? "Time Zone: (not set)" : "\u0E40\u0E02\u0E15\u0E40\u0E27\u0E25\u0E32: (\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E15\u0E31\u0E49\u0E07)";
    const lastCheckedText = lang === "en" ? `Last Checked: ${formatDate((/* @__PURE__ */ new Date()).toISOString())}` : `\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14: ${formatDate((/* @__PURE__ */ new Date()).toISOString())}`;
    const msg = `${username}
${userIdText}
${roleText}
${timezoneText}
${lastCheckedText}`;
    return await sendMessage(chatId, msg, env);
  }
  if (["\u{1F916} \u0E40\u0E0A\u0E47\u0E04\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E1A\u0E2D\u0E17", "\u{1F916} Check Bot Status"].includes(text)) {
    const now = Date.now();
    const uptime = formatUptime(now - globalStartTime);
    const responseTime = now - start;
    const msg = lang === "en" ? `\u{1F916} Bot Status

\u{1F194} Bot ID: telegram-scheduler
\u{1F9E9} Version: 1.0.0

\u{1F4F6} Status: \u2705 Online
\u23F1\uFE0F Uptime: ${uptime}
\u26A1 Response Time: ${responseTime} ms
\u{1F310} Time Zone: ${settings.timezone || "(not set)"}` : `\u{1F916} \u0E2A\u0E16\u0E32\u0E19\u0E30\u0E1A\u0E2D\u0E17

\u{1F194} \u0E23\u0E2B\u0E31\u0E2A\u0E1A\u0E2D\u0E17: telegram-scheduler
\u{1F9E9} \u0E40\u0E27\u0E2D\u0E23\u0E4C\u0E0A\u0E31\u0E19: 1.0.0

\u{1F4F6} \u0E2A\u0E16\u0E32\u0E19\u0E30: \u2705 \u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C
\u23F1\uFE0F \u0E40\u0E27\u0E25\u0E32\u0E40\u0E1B\u0E34\u0E14\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19: ${uptime}
\u26A1 \u0E40\u0E27\u0E25\u0E32\u0E15\u0E2D\u0E1A\u0E2A\u0E19\u0E2D\u0E07: ${responseTime} \u0E21\u0E34\u0E25\u0E25\u0E34\u0E27\u0E34\u0E19\u0E32\u0E17\u0E35
\u{1F310} \u0E40\u0E02\u0E15\u0E40\u0E27\u0E25\u0E32: ${settings.timezone || "(\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E15\u0E31\u0E49\u0E07)"}`;
    return await sendMessage(chatId, msg, env);
  }
  if (["\u{1F310} \u0E40\u0E0A\u0E47\u0E04\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E40\u0E0B\u0E34\u0E23\u0E4C\u0E1F\u0E40\u0E27\u0E2D\u0E23\u0E4C", "\u{1F310} Check Server Status"].includes(text)) {
    const responseTime = Date.now() - start;
    const msg = lang === "en" ? `\u{1F310} Server Status

\u{1F4F6} Status: \u2705 Online
\u{1F5A5}\uFE0F IP: ${clientIP}
\u{1F4CD} Location: ${city}, ${country}

\u26A1 Response Time: ${responseTime} ms
\u{1F310} Time Zone: ${settings.timezone || "(not set)"}` : `\u{1F310} \u0E2A\u0E16\u0E32\u0E19\u0E30\u0E40\u0E0B\u0E34\u0E23\u0E4C\u0E1F\u0E40\u0E27\u0E2D\u0E23\u0E4C

\u{1F4F6} \u0E2A\u0E16\u0E32\u0E19\u0E30: \u2705 \u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C
\u{1F5A5}\uFE0F IP: ${clientIP}
\u{1F4CD} \u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07: ${city}, ${country}

\u26A1 \u0E40\u0E27\u0E25\u0E32\u0E15\u0E2D\u0E1A\u0E2A\u0E19\u0E2D\u0E07: ${responseTime} \u0E21\u0E34\u0E25\u0E25\u0E34\u0E27\u0E34\u0E19\u0E32\u0E17\u0E35
\u{1F310} \u0E40\u0E02\u0E15\u0E40\u0E27\u0E25\u0E32: ${settings.timezone || "(\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E15\u0E31\u0E49\u0E07)"}`;
    return await sendMessage(chatId, msg, env);
  }
  const fallback = lang === "en" ? "\u2753 Unknown command. Please choose from the menu." : "\u2753 \u0E44\u0E21\u0E48\u0E40\u0E02\u0E49\u0E32\u0E43\u0E08\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E40\u0E21\u0E19\u0E39";
  return await sendMessage(chatId, fallback, env, getMainMenu(lang));
}
__name(handleMessage, "handleMessage");

// src/handlers/callback.ts
async function handleCallbackQuery(callback, env) {
  const userId = callback.from.id.toString();
  const chatId = callback.message.chat.id;
  const data = callback.data?.trim();
  const lang = (await getUserSettings(env, userId)).language || "th";
  if (!data || !data.includes(":")) {
    const message = lang === "en" ? "\u274C Cannot process this command" : "\u274C \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E1B\u0E23\u0E30\u0E21\u0E27\u0E25\u0E1C\u0E25\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E44\u0E14\u0E49";
    return await sendMessage(chatId, message, env);
  }
  const [action, postId] = data.split(":");
  const post = await getPost(env, postId);
  if (!post) {
    const message = lang === "en" ? "\u26A0\uFE0F Post not found" : "\u26A0\uFE0F \u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E42\u0E1E\u0E2A\u0E15\u0E4C";
    return await sendMessage(chatId, message, env, getMainMenu(lang));
  }
  const time = new Date(post.schedule).toLocaleString(lang === "en" ? "en-GB" : "th-TH", {
    timeZone: post.timezone || "Asia/Bangkok",
    hour12: false
  });
  switch (action) {
    case "view": {
      const preview = lang === "en" ? `\u{1F440} Post Preview

\u{1F4DD} ${post.caption}
\u{1F552} Scheduled: ${time}` : `\u{1F440} \u0E1E\u0E23\u0E35\u0E27\u0E34\u0E27\u0E42\u0E1E\u0E2A\u0E15\u0E4C

\u{1F4DD} ${post.caption}
\u{1F552} \u0E15\u0E31\u0E49\u0E07\u0E40\u0E27\u0E25\u0E32: ${time}`;
      return await sendMessage(chatId, preview, env);
    }
    case "edit": {
      await setDraftState(env, userId, {
        state: "awaiting_post_edit",
        postId
      });
      const message = lang === "en" ? "\u270F\uFE0F Send the new caption" : "\u270F\uFE0F \u0E01\u0E23\u0E38\u0E13\u0E32\u0E2A\u0E48\u0E07\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E43\u0E2B\u0E21\u0E48";
      return await sendMessage(chatId, message, env);
    }
    case "delete": {
      await deletePost(env, postId);
      const message = lang === "en" ? "\u{1F5D1}\uFE0F Post deleted" : "\u{1F5D1}\uFE0F \u0E25\u0E1A\u0E42\u0E1E\u0E2A\u0E15\u0E4C\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27";
      return await sendMessage(chatId, message, env, getMainMenu(lang));
    }
    case "confirm": {
      await updatePost(env, postId, { confirmed: true });
      const message = lang === "en" ? "\u2705 Post confirmed" : "\u2705 \u0E42\u0E1E\u0E2A\u0E15\u0E4C\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E41\u0E25\u0E49\u0E27";
      return await sendMessage(chatId, message, env, getMainMenu(lang));
    }
    default: {
      const message = lang === "en" ? "\u2753 Unknown action" : "\u2753 \u0E44\u0E21\u0E48\u0E40\u0E02\u0E49\u0E32\u0E43\u0E08\u0E04\u0E33\u0E2A\u0E31\u0E48\u0E07\u0E17\u0E35\u0E48\u0E04\u0E38\u0E13\u0E40\u0E25\u0E37\u0E2D\u0E01";
      return await sendMessage(chatId, message, env, getMainMenu(lang));
    }
  }
}
__name(handleCallbackQuery, "handleCallbackQuery");

// src/kv/queue.ts
var PREFIX3 = "queue:";
async function getQueue(env, userId) {
  const raw = await env.QUEUE.get(`${PREFIX3}${userId}`);
  return raw ? JSON.parse(raw) : [];
}
__name(getQueue, "getQueue");
async function removeFromQueue(env, userId, postId) {
  const queue = await getQueue(env, userId);
  const filtered = queue.filter((p) => p.id !== postId);
  await env.QUEUE.put(`${PREFIX3}${userId}`, JSON.stringify(filtered));
}
__name(removeFromQueue, "removeFromQueue");

// src/handlers/cron.ts
async function runScheduledPosts(env) {
  const now = Date.now();
  console.log("\u23F0 \u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E42\u0E1E\u0E2A\u0E15\u0E4C\u0E17\u0E35\u0E48\u0E16\u0E36\u0E07\u0E40\u0E27\u0E25\u0E32");
  const allUserIds = await env.QUEUE.list();
  for (const key of allUserIds.keys) {
    const userId = key.name;
    const queue = await getQueue(env, userId);
    for (const post of queue) {
      if (!post.schedule || !post.group_id || !post.text) continue;
      const scheduledTime = new Date(post.schedule).getTime();
      if (Math.abs(scheduledTime - now) > 6e4) continue;
      const chatId = post.chat_id || post.group_id;
      if (!chatId) {
        console.log(`\u26A0\uFE0F \u0E44\u0E21\u0E48\u0E1E\u0E1A chat_id \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E42\u0E1E\u0E2A\u0E15\u0E4C ${post.id}`);
        continue;
      }
      console.log(`\u{1F4E4} \u0E01\u0E33\u0E25\u0E31\u0E07\u0E2A\u0E48\u0E07\u0E42\u0E1E\u0E2A\u0E15\u0E4C ${post.id} \u0E02\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49 ${userId}`);
      try {
        const res = await sendScheduledPost(chatId, env, {
          text: post.text,
          media: post.media,
          options: post.options
        });
        const ok = res && res.ok;
        if (ok) {
          console.log(`\u2705 \u0E2A\u0E48\u0E07\u0E42\u0E1E\u0E2A\u0E15\u0E4C ${post.id} \u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08`);
          if (!post.repeat) {
            await removeFromQueue(env, userId, post.id);
            console.log(`\u{1F5D1} \u0E25\u0E1A\u0E42\u0E1E\u0E2A\u0E15\u0E4C ${post.id} \u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E04\u0E34\u0E27`);
          }
        } else {
          console.log(`\u274C \u0E2A\u0E48\u0E07\u0E42\u0E1E\u0E2A\u0E15\u0E4C ${post.id} \u0E25\u0E49\u0E21\u0E40\u0E2B\u0E25\u0E27`);
        }
      } catch (err) {
        console.log(`\u274C \u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14\u0E43\u0E19\u0E01\u0E32\u0E23\u0E2A\u0E48\u0E07\u0E42\u0E1E\u0E2A\u0E15\u0E4C ${post.id}:`, err);
      }
    }
  }
  console.log("\u23F0 \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E42\u0E1E\u0E2A\u0E15\u0E4C\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19");
}
__name(runScheduledPosts, "runScheduledPosts");

// src/index.ts
var hasStarted = false;
async function sendStartupGreeting(env) {
  const devId = parseInt(env.DEVELOPER_ID);
  const text = "\u{1F680} \u0E1A\u0E2D\u0E17\u0E40\u0E23\u0E34\u0E48\u0E21\u0E17\u0E33\u0E07\u0E32\u0E19\u0E41\u0E25\u0E49\u0E27 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E43\u0E2B\u0E49\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E04\u0E23\u0E31\u0E1A!";
  await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: devId,
      text,
      parse_mode: "HTML"
    })
  });
}
__name(sendStartupGreeting, "sendStartupGreeting");
var src_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/deploy" && request.method === "GET") {
      await setLastDeploy(env);
      return new Response("\u2705 Deploy timestamp updated", { status: 200 });
    }
    if (!hasStarted) {
      hasStarted = true;
      ctx.waitUntil(sendStartupGreeting(env));
      ctx.waitUntil(setLastDeploy(env));
    }
    if (url.pathname === "/telegram" && request.method === "POST") {
      const start = Date.now();
      const update = await request.json();
      if (update.message?.text) {
        const userId = update.message.from?.id;
        const chatId = update.message.chat?.id;
        const text = update.message.text;
        console.log(`\u{1F4E8} [${userId}] ${chatId}: "${text}"`);
      }
      if (update.message) {
        ctx.waitUntil(
          (async () => {
            const res = await handleMessage(update.message, env, request);
            const elapsed = Date.now() - start;
            console.log(`\u{1F4E9} handleMessage latency: ${elapsed}ms`);
            return res;
          })()
        );
        return new Response("OK");
      }
      if (update.callback_query) {
        ctx.waitUntil(
          (async () => {
            const res = await handleCallbackQuery(update.callback_query, env);
            const elapsed = Date.now() - start;
            console.log(`\u{1F518} handleCallback latency: ${elapsed}ms`);
            return res;
          })()
        );
        return new Response("OK");
      }
      return new Response("No message or callback", { status: 400 });
    }
    return new Response("Not found", { status: 404 });
  },
  async scheduled(event, env, ctx) {
    const start = Date.now();
    await runScheduledPosts(env);
    const elapsed = Date.now() - start;
    console.log(`\u23F0 Cron latency: ${elapsed}ms`);
  }
};

// ../Users/lifep/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../Users/lifep/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-RxCSSz/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../Users/lifep/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-RxCSSz/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
