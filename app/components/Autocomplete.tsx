"use client"

import React, { useState, useRef, useEffect } from "react"

interface AutocompleteProps {
  minChars?: number
  debounceMs?: number
}

export function Autocomplete({
  minChars = 2,
  debounceMs = 500,
}: AutocompleteProps) {
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions from API
  const fetchSuggestions = async (query: string) => {
    if (query.length < minChars) {
      setSuggestions([])
      setIsOpen(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/wordlist?q=${encodeURIComponent(query)}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions")
      }

      const data = await response.json()
      setSuggestions(data.results || [])
      setIsOpen(data.results && data.results.length > 0)
      setSelectedIndex(-1)
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([])
      setIsOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Debounced API call
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set new timer for debounced fetch
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value)
    }, debounceMs)
  }

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion)
    setSuggestions([])
    setIsOpen(false)
    setSelectedIndex(-1)
    console.log("Selected:", suggestion)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        setSelectedIndex(-1)
        break
      default:
        break
    }
  }

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  // Function to render highlighted text
  const renderHighlightedText = (
    text: string,
    query: string,
    isSelected: boolean
  ) => {
    if (!query) return text

    const parts: (string | React.ReactElement)[] = []
    const regex = new RegExp(`(${query})`, "gi")
    const split = text.split(regex)

    split.forEach((part, index) => {
      if (regex.test(part)) {
        parts.push(
          <span
            key={index}
            className={`font-semibold ${
              isSelected
                ? "bg-blue-300"
                : "bg-yellow-300 dark:bg-yellow-600 text-zinc-900"
            }`}
          >
            {part}
          </span>
        )
      } else {
        parts.push(part)
      }
    })

    return parts
  }

  return (
    <div className="relative w-full">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
        Search Words
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true)
            }
          }}
          placeholder="Type at least 2 characters..."
          className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-600 dark:text-white dark:placeholder-zinc-400"
          aria-autocomplete="list"
          aria-controls="autocomplete-dropdown"
          aria-expanded={isOpen}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          id="autocomplete-dropdown"
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion}-${index}`}
              onClick={() => handleSelectSuggestion(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                selectedIndex === index
                  ? "bg-blue-500 text-white"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
              }`}
              role="option"
              aria-selected={selectedIndex === index}
            >
              {renderHighlightedText(
                suggestion,
                inputValue,
                selectedIndex === index
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen &&
        suggestions.length === 0 &&
        !isLoading &&
        inputValue.length >= minChars && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg z-50 px-4 py-2 text-zinc-500 dark:text-zinc-400">
            No results found
          </div>
        )}
    </div>
  )
}
