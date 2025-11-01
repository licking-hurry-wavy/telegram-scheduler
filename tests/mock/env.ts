export const mockEnv = {
  KV_POSTS: {
    get: async (key: string) => mockKV.get(key),
    put: async (key: string, value: string) => mockKV.set(key, value)
  },
  DEFAULT_LANG: "th",
  DEFAULT_TIMEZONE: "Asia/Bangkok"
};

const mockKV = new Map();