import { describe, expect, test } from "vitest";
import { Cache } from "./pokecache.js";

describe("Cache", () => {
  test.concurrent.each([
    ["https://example.com/a", { value: 1 }],
    ["https://example.com/b", { value: 2 }],
    ["https://example.com/c", { value: 3 }],
  ])("stores and retrieves %s", (key, value) => {
    const cache = new Cache(1_000);

    try {
      cache.add(key, value);

      expect(cache.get(key)).toEqual(value);
    } finally {
      cache.stopReapLoop();
    }
  });
});