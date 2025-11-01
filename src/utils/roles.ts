export type Role = "admin" | "developer" | "editor" | "user";

export function isPrivileged(role: Role): boolean {
  return role === "admin" || role === "developer";
}

export function isDeveloper(role: Role): boolean {
  return role === "developer";
}

export async function getUserRole(userId: number, env: Env): Promise<Role> {
  const devId = parseInt(env.DEVELOPER_ID);
  return userId === devId ? "developer" : "user";
}