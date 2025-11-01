type KVValue = {
  value: string;
  expiresAt?: number; // timestamp in ms
};

const namespaces = new Map<string, Map<string, KVValue>>();

export function getMockKV(namespace: string): {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, options?: { ttl?: number }) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => void;
} {
  if (!namespaces.has(namespace)) {
    namespaces.set(namespace, new Map());
  }

  const store = namespaces.get(namespace)!;

  return {
    async get(key: string): Promise<string | null> {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },

    async put(key: string, value: string, options?: { ttl?: number }): Promise<void> {
      const expiresAt = options?.ttl ? Date.now() + options.ttl * 1000 : undefined;
      store.set(key, { value, expiresAt });
    },

    async delete(key: string): Promise<void> {
      store.delete(key);
    },

    clear(): void {
      store.clear();
    }
  };
}