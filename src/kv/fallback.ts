// src/kv/fallback.ts
export function getKVNamespace(binding: any): { name: string } {
  return binding?.name ? binding : { name: "default" };
}