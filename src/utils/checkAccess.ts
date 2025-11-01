import { getUserRole } from "../kv/users";

type Role = "developer" | "admin";

export async function isAuthorized(env: any, userId: number, required: Role = "admin"): Promise<boolean> {
  const role = await getUserRole(env, userId);
  if (!role) return false;

  const hierarchy: Role[] = ["admin", "developer"];
  return hierarchy.indexOf(role) >= hierarchy.indexOf(required);
}