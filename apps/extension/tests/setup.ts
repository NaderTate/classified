import { vi } from "vitest";

const store = new Map<string, unknown>();
(globalThis as { chrome: unknown }).chrome = {
  storage: {
    local: {
      get: vi.fn((keys: string | string[]) => {
        const result: Record<string, unknown> = {};
        const list = typeof keys === "string" ? [keys] : keys;
        for (const k of list) {
          if (store.has(k)) result[k] = store.get(k);
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        for (const [k, v] of Object.entries(items)) store.set(k, v);
        return Promise.resolve();
      }),
      remove: vi.fn((keys: string | string[]) => {
        const list = typeof keys === "string" ? [keys] : keys;
        for (const k of list) store.delete(k);
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        store.clear();
        return Promise.resolve();
      }),
    },
  },
};

export function resetStore() {
  store.clear();
}
