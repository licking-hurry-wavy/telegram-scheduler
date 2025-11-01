export async function getEligibleGroups(env: any) {
  const list = await env.ACCESS.list({ prefix: "group:" });
  const groups = [];

  for (const item of list.keys) {
    const groupId = item.name.split(":")[1];
    const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/getChatMember?chat_id=${groupId}&user_id=${env.BOT_ID}`);
    const data = await res.json();
    if (data.result?.status === "administrator") {
      groups.push({ id: groupId, title: data.result?.user?.first_name || `กลุ่ม ${groupId}` });
    }
  }

  return groups;
}