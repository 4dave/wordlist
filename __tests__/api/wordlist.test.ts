import { GET } from "@/app/api/wordlist/route"
import { NextRequest } from "next/server"

// Mock the rate limiter
jest.mock("@/lib/rateLimit", () => ({
  checkRateLimit: jest.fn(() => true),
  getClientIP: jest.fn(() => "127.0.0.1"),
}))

describe("API Endpoint: /api/wordlist", () => {
  describe("GET request handler", () => {
    it("should return 400 when query parameter is missing", async () => {
      const request = new NextRequest(
        new URL("http://localhost:3000/api/wordlist")
      )
      const response = await GET(request)

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.error).toContain("Query parameter")
    })

    it("should return 400 when query is empty string", async () => {
      const request = new NextRequest(
        new URL("http://localhost:3000/api/wordlist?q=")
      )
      const response = await GET(request)

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.error).toContain("Query parameter")
    })

    it("should return 400 when query is less than 2 characters", async () => {
      const request = new NextRequest(
        new URL("http://localhost:3000/api/wordlist?q=a")
      )
      const response = await GET(request)

      expect(response.status).toBe(400)
      const json = await response.json()
      expect(json.error).toContain("at least 2 characters")
    })

    it("should return 429 when rate limited", async () => {
      const { checkRateLimit } = require("@/lib/rateLimit")
      checkRateLimit.mockReturnValueOnce(false)

      const request = new NextRequest(
        new URL("http://localhost:3000/api/wordlist?q=test")
      )
      const response = await GET(request)

      expect(response.status).toBe(429)
      expect(response.headers.get("Retry-After")).toBe("60")
      const json = await response.json()
      expect(json.error).toContain("Rate limit exceeded")
    })

    it("should return successful response with correct structure", async () => {
      const request = new NextRequest(
        new URL("http://localhost:3000/api/wordlist?q=app")
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
      const json = await response.json()

      // Check response structure
      expect(json).toHaveProperty("query")
      expect(json).toHaveProperty("count")
      expect(json).toHaveProperty("results")

      // Check types
      expect(typeof json.query).toBe("string")
      expect(typeof json.count).toBe("number")
      expect(Array.isArray(json.results)).toBe(true)

      // Check values
      expect(json.query).toBe("app")
      expect(json.count).toBeGreaterThanOrEqual(0)
      expect(json.results.length).toBeLessThanOrEqual(100)
    })

    it("should handle URL encoded queries", async () => {
      const request = new NextRequest(
        new URL("http://localhost:3000/api/wordlist?q=%2D%2D") // "--"
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json.query).toBe("--")
    })

    it("should be case-insensitive in search", async () => {
      const request1 = new NextRequest(
        new URL("http://localhost:3000/api/wordlist?q=APP")
      )
      const request2 = new NextRequest(
        new URL("http://localhost:3000/api/wordlist?q=app")
      )

      const response1 = await GET(request1)
      const response2 = await GET(request2)

      const json1 = await response1.json()
      const json2 = await response2.json()

      expect(json1.count).toBe(json2.count)
    })

    it("should limit results to 100", async () => {
      const request = new NextRequest(
        new URL("http://localhost:3000/api/wordlist?q=a")
      )
      const response = await GET(request)
      const json = await response.json()

      expect(json.results.length).toBeLessThanOrEqual(100)
    })

    it("should return empty results array when no matches found", async () => {
      const request = new NextRequest(
        new URL("http://localhost:3000/api/wordlist?q=zzzzzzzzz")
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
      const json = await response.json()
      expect(json.count).toBe(0)
      expect(json.results).toEqual([])
    })

    it("should return correct result types", async () => {
      const request = new NextRequest(
        new URL("http://localhost:3000/api/wordlist?q=the")
      )
      const response = await GET(request)
      const json = await response.json()

      if (json.results.length > 0) {
        expect(typeof json.results[0]).toBe("string")
        json.results.forEach((result: unknown) => {
          expect(typeof result).toBe("string")
        })
      }
    })
  })
})
