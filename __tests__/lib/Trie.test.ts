import { Trie } from "@/lib/Trie"

describe("Trie Data Structure", () => {
  let trie: Trie

  beforeEach(() => {
    trie = new Trie()
  })

  describe("insert and contains", () => {
    it("should insert and find a word", () => {
      trie.insert("apple")
      expect(trie.contains("apple")).toBe(true)
    })

    it("should be case-insensitive", () => {
      trie.insert("Apple")
      expect(trie.contains("apple")).toBe(true)
      expect(trie.contains("APPLE")).toBe(true)
    })

    it("should not find a word that wasn't inserted", () => {
      trie.insert("apple")
      expect(trie.contains("app")).toBe(false)
      expect(trie.contains("orange")).toBe(false)
    })

    it("should handle empty strings", () => {
      trie.insert("")
      expect(trie.contains("")).toBe(false)
    })
  })

  describe("search with prefix", () => {
    beforeEach(() => {
      const words = ["apple", "application", "apply", "app", "orange", "orca"]
      words.forEach((word) => trie.insert(word))
    })

    it("should find all words with a given prefix", () => {
      const results = trie.search("app")
      expect(results).toContain("apple")
      expect(results).toContain("application")
      expect(results).toContain("apply")
      expect(results).toContain("app")
      expect(results.length).toBe(4)
    })

    it("should be case-insensitive for search", () => {
      const results1 = trie.search("APP")
      const results2 = trie.search("app")
      expect(results1.sort()).toEqual(results2.sort())
    })

    it("should return empty array for non-existent prefix", () => {
      const results = trie.search("xyz")
      expect(results).toEqual([])
    })

    it("should respect maxResults limit", () => {
      const results = trie.search("app", 2)
      expect(results.length).toBeLessThanOrEqual(2)
    })

    it("should return results for single character prefix", () => {
      const results = trie.search("o")
      expect(results).toContain("orange")
      expect(results).toContain("orca")
    })

    it("should handle empty prefix", () => {
      const results = trie.search("")
      expect(results).toEqual([])
    })
  })

  describe("buildFromArray", () => {
    it("should build trie from array of words", () => {
      const words = ["cat", "car", "card", "dog"]
      trie.buildFromArray(words)

      expect(trie.contains("cat")).toBe(true)
      expect(trie.contains("car")).toBe(true)
      expect(trie.contains("card")).toBe(true)
      expect(trie.contains("dog")).toBe(true)
    })

    it("should search after building from array", () => {
      const words = ["cat", "car", "card", "dog"]
      trie.buildFromArray(words)

      const results = trie.search("ca")
      expect(results.length).toBe(3)
      expect(results).toContain("cat")
      expect(results).toContain("car")
      expect(results).toContain("card")
    })

    it("should handle empty array", () => {
      trie.buildFromArray([])
      expect(trie.contains("anything")).toBe(false)
    })

    it("should handle duplicate words", () => {
      trie.buildFromArray(["apple", "apple", "apple"])
      expect(trie.contains("apple")).toBe(true)
      const results = trie.search("app")
      expect(results.length).toBe(1)
      expect(results[0]).toBe("apple")
    })
  })

  describe("preserve original casing", () => {
    it("should preserve original word casing in results", () => {
      trie.insert("Apple")
      trie.insert("BANANA")
      trie.insert("OrAnGe")

      const results1 = trie.search("app")
      const results2 = trie.search("ban")
      const results3 = trie.search("ora")

      expect(results1[0]).toBe("Apple")
      expect(results2[0]).toBe("BANANA")
      expect(results3[0]).toBe("OrAnGe")
    })
  })
})
