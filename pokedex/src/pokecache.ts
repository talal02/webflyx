export class Cache {
  #cache = new Map<string, CacheEntry<any>>();
  #reapIntervalId: NodeJS.Timeout | undefined = undefined;
  #interval: number;

  add<T>(key: string, val: T) {
    this.#cache.set(key, { val, createdAt: Date.now() });
  }

  get<T>(key: string): T | undefined {
    const entry = this.#cache.get(key);
    if (!entry) return undefined;
    return entry.val as T;
  }

  #reap() {
    const now = Date.now();
    for (const [key, entry] of this.#cache.entries()) {
      if (now - entry.createdAt > this.#interval) {
        this.#cache.delete(key);
      }
    }
  }

  #startReapLoop() {
    this.#reapIntervalId = setInterval(() => this.#reap(), this.#interval);
  }

  constructor(interval: number) {
    this.#interval = interval;
    this.#startReapLoop();
  }

  stopReapLoop() {
    if (this.#reapIntervalId) {
      clearInterval(this.#reapIntervalId);
      this.#reapIntervalId = undefined;
    }
  }
}

export type CacheEntry<T> = {
  val: T;
  createdAt: number;
};

