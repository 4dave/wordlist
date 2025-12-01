"use client"

import { Autocomplete } from "./components/Autocomplete"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 px-16 py-12 bg-white dark:bg-black">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Word Autocomplete Search
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Start typing to search through the wordlist. Results will
            auto-complete as you type.
          </p>
          <p> selected word is logged to console</p>
        </div>
        <div className="w-full max-w-md">
          <Autocomplete />
        </div>
      </main>
    </div>
  )
}
