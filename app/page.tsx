"use client"

import { Autocomplete } from "./components/Autocomplete"

export default function Home() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Word Autocomplete Search
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Start typing to search through the wordlist. Results will
            auto-complete as you type.
          </p>
        </div>
        <div className="mt-8 w-full max-w-md">
          <Autocomplete />
        </div>
      </main>
    </div>
  )
}
