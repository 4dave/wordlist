import { NextRequest, NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import { checkRateLimit, getClientIP } from "@/lib/rateLimit"
import { Trie } from "@/lib/Trie"

// Initialize Trie as a singleton to avoid rebuilding on every request
let cachedTrie: Trie | null = null

function getTrie(): Trie {
  if (!cachedTrie) {
    const wordlistPath = join(process.cwd(), "data", "wordlist.txt")
    const wordlistContent = readFileSync(wordlistPath, "utf-8")

    // Split into lines, clean up entries (handle commas/periods), and filter empty strings
    const words = wordlistContent
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
      .map((word) => {
        // Clean up words that contain commas or periods (e.g., "2,4,5-t" stays as is, but "word." becomes "word")
        return word.replace(/[,.]$/, "")
      })
      .filter((word) => word.length > 0)

    // Build the Trie
    cachedTrie = new Trie()
    cachedTrie.buildFromArray(words)

    console.log(`Trie built with ${words.length} words`)
  }

  return cachedTrie
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request)
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 100 requests per minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      )
    }

    // Get the search query from URL parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    // Validate that a search query was provided
    if (!query || query.trim() === "") {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    // Validate minimum query length (client-side too, but good to validate here)
    if (query.length < 2) {
      return NextResponse.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      )
    }

    // Get the Trie and search
    const trie = getTrie()
    const matches = trie.search(query, 100)

    // Return results
    return NextResponse.json({
      query,
      count: matches.length,
      results: matches,
    })
  } catch (error) {
    console.error("Error processing wordlist query:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
