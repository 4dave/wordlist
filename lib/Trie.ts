/**
 * TrieNode represents a single node in the Trie structure
 */
interface TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean
  word?: string // Store the actual word at leaf nodes for quick retrieval
}

/**
 * Trie data structure optimized for autocomplete
 * - O(m) search time where m is the length of the query (not the wordlist size)
 * - O(n*k) space where n is number of words and k is average word length
 * - Much faster than array filtering for large datasets
 */
export class Trie {
  private root: TrieNode

  constructor() {
    this.root = {
      children: new Map(),
      isEndOfWord: false,
    }
  }

  /**
   * Insert a word into the Trie
   * Time complexity: O(m) where m is the length of the word
   */
  insert(word: string): void {
    if (!word || word.length === 0) return

    let node = this.root
    const lowerWord = word.toLowerCase()

    for (const char of lowerWord) {
      if (!node.children.has(char)) {
        node.children.set(char, {
          children: new Map(),
          isEndOfWord: false,
        })
      }
      node = node.children.get(char)!
    }

    node.isEndOfWord = true
    node.word = word // Store original word for case preservation
  }

  /**
   * Build Trie from an array of words
   * Time complexity: O(n*m) where n is number of words, m is average word length
   */
  buildFromArray(words: string[]): void {
    for (const word of words) {
      this.insert(word)
    }
  }

  /**
   * Search for all words with a given prefix
   * Time complexity: O(m + n) where m is query length, n is number of results
   * This is significantly faster than array.filter() for large datasets
   */
  search(prefix: string, maxResults: number = 100): string[] {
    if (!prefix || prefix.length === 0) {
      return []
    }

    const results: string[] = []
    let node = this.root
    const lowerPrefix = prefix.toLowerCase()

    // Navigate to the end of the prefix
    for (const char of lowerPrefix) {
      if (!node.children.has(char)) {
        return [] // No words with this prefix
      }
      node = node.children.get(char)!
    }

    // DFS to collect all words with this prefix
    this._dfs(node, results, maxResults)

    return results
  }

  /**
   * Depth-first search to collect words from a given node
   * Stops early when maxResults is reached for performance
   */
  private _dfs(node: TrieNode, results: string[], maxResults: number): void {
    // Stop if we've reached the limit
    if (results.length >= maxResults) {
      return
    }

    // If this is the end of a word, add it to results
    if (node.isEndOfWord && node.word) {
      results.push(node.word)
    }

    // Continue DFS through children
    for (const child of node.children.values()) {
      this._dfs(child, results, maxResults)
      if (results.length >= maxResults) {
        break
      }
    }
  }

  /**
   * Get the size of the Trie (number of words)
   */
  getSize(): number {
    let count = 0
    this._countWords(this.root, count)
    return count
  }

  private _countWords(node: TrieNode, count: number): number {
    if (node.isEndOfWord) count++
    for (const child of node.children.values()) {
      count = this._countWords(child, count)
    }
    return count
  }

  /**
   * Check if a word exists in the Trie
   */
  contains(word: string): boolean {
    if (!word || word.length === 0) return false

    let node = this.root
    const lowerWord = word.toLowerCase()

    for (const char of lowerWord) {
      if (!node.children.has(char)) {
        return false
      }
      node = node.children.get(char)!
    }

    return node.isEndOfWord
  }
}
