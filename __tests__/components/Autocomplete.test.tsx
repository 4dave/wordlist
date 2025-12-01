import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Autocomplete } from "@/app/components/Autocomplete"

// Jest timeout for async tests
jest.setTimeout(10000)

// Mock fetch globally before any tests run
const mockFetch = jest.fn()
global.fetch = mockFetch as jest.Mock

describe("Autocomplete Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  describe("Rendering", () => {
    it("should render the autocomplete component", () => {
      render(<Autocomplete />)
      expect(
        screen.getByPlaceholderText(/Type at least 2 characters/i)
      ).toBeInTheDocument()
    })

    it("should render label", () => {
      render(<Autocomplete />)
      expect(screen.getByText(/Search Words/i)).toBeInTheDocument()
    })

    it("should have input field with correct attributes", () => {
      render(<Autocomplete />)
      const input = screen.getByPlaceholderText(/Type at least 2 characters/i)

      expect(input).toHaveAttribute("type", "text")
      expect(input).toHaveAttribute("aria-autocomplete", "list")
    })

    it("should have aria-expanded initially set to false", () => {
      render(<Autocomplete />)
      const input = screen.getByPlaceholderText(/Type at least 2 characters/i)
      expect(input).toHaveAttribute("aria-expanded", "false")
    })
  })

  describe("Debouncing and API calls", () => {
    it("should not call API with less than 2 characters", async () => {
      render(<Autocomplete minChars={2} debounceMs={100} />)
      const input = screen.getByPlaceholderText(/Type at least 2 characters/i)

      await userEvent.type(input, "a")
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 150)))

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it("should call API with 2 or more characters after debounce", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          query: "ap",
          count: 2,
          results: ["apple", "application"],
        }),
      })

      render(<Autocomplete minChars={2} debounceMs={100} />)
      const input = screen.getByPlaceholderText(/Type at least 2 characters/i)

      await userEvent.type(input, "ap")
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledWith(
            `/api/wordlist?q=${encodeURIComponent("ap")}`
          )
        },
        { timeout: 300 }
      )
    })

    it("should debounce API calls", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          query: "app",
          count: 1,
          results: ["apple"],
        }),
      })

      render(<Autocomplete minChars={2} debounceMs={100} />)
      const input = screen.getByPlaceholderText(/Type at least 2 characters/i)

      await userEvent.type(input, "a")
      await userEvent.type(input, "p")
      await userEvent.type(input, "p")

      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalledTimes(1)
        },
        { timeout: 300 }
      )
    })
  })

  describe("Props", () => {
    it("should respect minChars prop", async () => {
      render(<Autocomplete minChars={3} debounceMs={0} />)
      const input = screen.getByPlaceholderText(/Type at least 2 characters/i)

      await userEvent.type(input, "ap")
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 50)))

      expect(mockFetch).not.toHaveBeenCalled()

      await userEvent.type(input, "p")
      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 50)))

      expect(mockFetch).toHaveBeenCalled()
    })

    it("should respect debounceMs prop", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          query: "app",
          count: 1,
          results: ["apple"],
        }),
      })

      render(<Autocomplete minChars={2} debounceMs={50} />)
      const input = screen.getByPlaceholderText(/Type at least 2 characters/i)

      await userEvent.type(input, "app")

      // Should not be called immediately
      expect(mockFetch).not.toHaveBeenCalled()

      // Wait for debounce
      await waitFor(
        () => {
          expect(mockFetch).toHaveBeenCalled()
        },
        { timeout: 200 }
      )
    })
  })
})
