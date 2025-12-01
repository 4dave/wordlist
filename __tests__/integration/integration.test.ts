/**
 * Integration Tests for the Wordlist Autocomplete API
 * These tests can be run against a live server to verify:
 * - API health check
 * - Data retrieval
 * - Response format
 * - Component rendering
 */

describe("Integration Tests - Wordlist Autocomplete", () => {
  const API_BASE_URL = "http://localhost:3000"
  const API_ENDPOINT = `${API_BASE_URL}/api/wordlist`

  describe("API Health and Data", () => {
    it("should have API running on port 3000", async () => {
      try {
        const response = await fetch(API_ENDPOINT + "?q=test")
        expect(response).toBeDefined()
      } catch (error) {
        throw new Error(`API not running on ${API_BASE_URL}`)
      }
    })

    it("should return valid JSON response", async () => {
      const response = await fetch(API_ENDPOINT + "?q=test")
      const json = await response.json()

      expect(json).toBeDefined()
      expect(typeof json).toBe("object")
    })

    it("should have correct response structure", async () => {
      const response = await fetch(API_ENDPOINT + "?q=the")
      const json = await response.json()

      expect(json).toHaveProperty("query")
      expect(json).toHaveProperty("count")
      expect(json).toHaveProperty("results")
    })

    it("should return results as string array", async () => {
      const response = await fetch(API_ENDPOINT + "?q=the")
      const json = await response.json()

      expect(Array.isArray(json.results)).toBe(true)
      if (json.results.length > 0) {
        json.results.forEach((result: unknown) => {
          expect(typeof result).toBe("string")
        })
      }
    })

    it("should return count matching results array length", async () => {
      const response = await fetch(API_ENDPOINT + "?q=app")
      const json = await response.json()

      expect(json.count).toBe(json.results.length)
    })

    it("should filter results correctly", async () => {
      const response = await fetch(API_ENDPOINT + "?q=apple")
      const json = await response.json()

      if (json.results.length > 0) {
        json.results.forEach((result: string) => {
          expect(result.toLowerCase()).toContain("apple")
        })
      }
    })

    it("should limit results to 100", async () => {
      const response = await fetch(API_ENDPOINT + "?q=a")
      const json = await response.json()

      expect(json.results.length).toBeLessThanOrEqual(100)
    })

    it("should be case-insensitive", async () => {
      const response1 = await fetch(API_ENDPOINT + "?q=APPLE")
      const response2 = await fetch(API_ENDPOINT + "?q=apple")

      const json1 = await response1.json()
      const json2 = await response2.json()

      expect(json1.count).toBe(json2.count)
    })

    it("should handle URL encoded queries", async () => {
      const response = await fetch(API_ENDPOINT + "?q=%2D%2D")
      const json = await response.json()

      expect(response.status).toBe(200)
      expect(json.query).toBe("--")
    })
  })

  describe("Error Handling", () => {
    it("should return 400 for missing query parameter", async () => {
      const response = await fetch(API_ENDPOINT)
      expect(response.status).toBe(400)

      const json = await response.json()
      expect(json.error).toBeDefined()
    })

    it("should return 400 for single character query", async () => {
      const response = await fetch(API_ENDPOINT + "?q=a")
      expect(response.status).toBe(400)
    })

    it("should return 400 for empty query", async () => {
      const response = await fetch(API_ENDPOINT + "?q=")
      expect(response.status).toBe(400)
    })
  })

  describe("Component Rendering", () => {
    it("should render autocomplete component on home page", async () => {
      const response = await fetch(API_BASE_URL)
      const html = await response.text()

      // Check for key component elements
      expect(html).toContain("Search Words")
      expect(html).toContain("Type at least 2 characters")
    })

    it("should load successfully on port 3000", async () => {
      const response = await fetch(API_BASE_URL)
      expect(response.status).toBe(200)
      expect(response.headers.get("content-type")).toContain("text/html")
    })
  })

  describe("Performance", () => {
    it("should respond within reasonable time", async () => {
      const start = Date.now()
      const response = await fetch(API_ENDPOINT + "?q=test")
      const end = Date.now()

      const responseTime = end - start

      // Should respond within 200ms
      expect(responseTime).toBeLessThan(200)
      expect(response.status).toBe(200)
    })

    it("should handle multiple requests", async () => {
      const queries = ["the", "and", "or", "in", "on"]
      const requests = queries.map((q) => fetch(API_ENDPOINT + `?q=${q}`))

      const responses = await Promise.all(requests)

      responses.forEach((response) => {
        expect(response.status).toBe(200)
      })
    })
  })
})
