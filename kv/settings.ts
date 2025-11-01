const PREFIX = "settings:";

export async function getUserSettings(env: any, userId: string): Promise<any> {
  const raw = await env.SETTINGS.get(`${PREFIX}${userId}`);
  const settings = raw ? JSON.parse(raw) : {};
  if (!settings.language) settings.language = "th";
  if (!settings.timezone) settings.timezone = "Asia/Bangkok";
  return settings;
}

export async function setUserLanguage(env: any, userId: string, language: string): Promise<void> {
  const settings = await getUserSettings(env, userId);
  settings.language = language;
  await env.SETTINGS.put(`${PREFIX}${userId}`, JSON.stringify(settings));
}

export async function setUserTimezone(env: any, userId: string, timezone: string): Promise<void> {
  const settings = await getUserSettings(env, userId);
  settings.timezone = timezone;
  await env.SETTINGS.put(`${PREFIX}${userId}`, JSON.stringify(settings));
}