export interface Env {
  BOT_TOKEN: string;
  BOT_ID: string;
  SECRET_TOKEN: string;
  DEVELOPER_ID: string;
  DRAFT: KVNamespace;
  QUEUE: KVNamespace;
  ACCESS: KVNamespace;
  POSTS: KVNamespace;
  SETTINGS: KVNamespace;
  META: KVNamespace;
  DB: KVNamespace; // ✅ ต้องมี
}