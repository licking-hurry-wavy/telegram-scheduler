export async function isAdmin(userId: number, env: any): Promise<boolean> {
  const role = await env.ACCESS.get(`user:${userId}:role`);
  return role === "admin" || role === "developer";
}