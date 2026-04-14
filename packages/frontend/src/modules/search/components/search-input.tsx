'use client'

import { Input } from '@kids-reporter/routing-ui'
import { useState } from 'react'

import { SEARCH_PLACEHOLDER } from '@/constants'

function SearchInput({ value }: { value: string }) {
  const [input, setInput] = useState(value)

  return (
    <>
      <form
        className="relative z-bar mb-6 w-full max-w-[480px] tablet:mb-10 desktop:mb-12"
        role="search"
        method="get"
        action="/search"
        aria-haspopup="listbox"
      >
        <Input
          mode="search"
          name="q"
          placeholder={SEARCH_PLACEHOLDER}
          value={input}
          onChange={setInput}
          onClear={() => setInput('')}
          className="w-full border-neutral-400 bg-neutral-100 data-[input-state=focus]:border-neutral-600 desktop:bg-neutral-100"
        />
      </form>
    </>
  )
}

export default SearchInput
