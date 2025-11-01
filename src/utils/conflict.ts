import { getQueue } from "../kv/queue";

export async function checkScheduleConflict(env: any, userId: number, newTime: number) {
  const queue = await getQueue(env, userId);
  return queue.some(post => Math.abs(post.schedule - newTime) < 60_000); // ภายใน 1 นาที
}