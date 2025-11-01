import { Role } from "../types";

export function isPrivileged(role: Role): boolean {
  return role === "admin" || role === "developer";
}

export function isDeveloper(role: Role): boolean {
  return role === "developer";
}