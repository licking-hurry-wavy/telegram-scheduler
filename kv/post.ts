const POST_PREFIX = "post:";

export interface Post {
  id: string;
  userId: string;
  caption: string;
  media?: string;
  buttons?: any[];
  groups: string[];
  schedule: number;
  createdAt: number;
  updatedAt: number;
  confirmed?: boolean;
}

export async function savePost(env: any, post: Post): Promise<void> {
  await env.POSTS.put(`${POST_PREFIX}${post.id}`, JSON.stringify(post));
}

export async function getPost(env: any, id: string): Promise<Post | null> {
  const raw = await env.POSTS.get(`${POST_PREFIX}${id}`);
  return raw ? JSON.parse(raw) : null;
}

export async function updatePost(env: any, id: string, updates: Partial<Post>): Promise<void> {
  const existing = await getPost(env, id);
  if (!existing) return;
  const updated = { ...existing, ...updates, updatedAt: Date.now() };
  await savePost(env, updated);
}

export async function deletePost(env: any, id: string): Promise<void> {
  await env.POSTS.delete(`${POST_PREFIX}${id}`);
}

export async function listPostsByUser(env: any, userId: string): Promise<Post[]> {
  const list = await env.POSTS.list({ prefix: POST_PREFIX });
  const posts: Post[] = [];
  for (const item of list.keys) {
    const raw = await env.POSTS.get(item.name);
    if (raw) {
      const post = JSON.parse(raw);
      if (post.userId === userId) posts.push(post);
    }
  }
  return posts;
}

export async function getPostCount(env: any, userId: string): Promise<number> {
  const posts = await listPostsByUser(env, userId);
  return posts.length;
}