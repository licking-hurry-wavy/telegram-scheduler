const PREFIX = "queue:";

export async function getQueue(env: any, userId: string): Promise<any[]> {
  const raw = await env.QUEUE.get(`${PREFIX}${userId}`);
  return raw ? JSON.parse(raw) : [];
}

export async function getPostById(env: any, userId: string, postId: string): Promise<any | null> {
  const queue = await getQueue(env, userId);
  return queue.find(p => p.id === postId) || null;
}

export async function saveToQueue(env: any, userId: string, post: any): Promise<void> {
  const queue = await getQueue(env, userId);
  queue.push(post);
  await env.QUEUE.put(`${PREFIX}${userId}`, JSON.stringify(queue));
}

export async function updatePost(env: any, userId: string, postId: string, updates: any): Promise<boolean> {
  const queue = await getQueue(env, userId);
  const index = queue.findIndex(p => p.id === postId);
  if (index === -1) return false;
  queue[index] = { ...queue[index], ...updates };
  await env.QUEUE.put(`${PREFIX}${userId}`, JSON.stringify(queue));
  return true;
}

export async function removeFromQueue(env: any, userId: string, postId: string): Promise<void> {
  const queue = await getQueue(env, userId);
  const filtered = queue.filter(p => p.id !== postId);
  await env.QUEUE.put(`${PREFIX}${userId}`, JSON.stringify(filtered));
}

export async function hasConflict(env: any, userId: string, schedule: string): Promise<boolean> {
  const queue = await getQueue(env, userId);
  return queue.some(p => p.schedule === schedule);
}