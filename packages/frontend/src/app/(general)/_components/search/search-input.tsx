'use client'
import { useState } from 'react'

import { SEARCH_PLACEHOLDER, Z_INDEX_TOP } from '@/constants'
import { CrossIcon, SearchIcon } from '@/icons'

import styles from './search-input.module.css'

export const SearchInput = (props: { value: string }) => {
  const { value } = props
  const [input, setInput] = useState(value)
  const [isFocused, setIsFocused] = useState(false)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const onInputClear = () => {
    setInput('')
  }

  const onInputFocus = () => {
    setIsFocused(true)
  }

  const onInputBlur = () => {
    setIsFocused(false)
  }

  const isResultMatchKeyword = value === input

  return (
    <>
      {isFocused && (
        <div
          className="fixed top-0 h-full w-full"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: Z_INDEX_TOP + 1,
          }}
        />
      )}
      <form
        className="relative mb-6 flex h-10 w-full max-w-md flex-row items-center md:mb-10 lg:mb-12"
        style={{ zIndex: isFocused ? Z_INDEX_TOP + 2 : Z_INDEX_TOP - 2 }}
        role="search"
        method="get"
        action="/search"
        aria-haspopup="listbox"
      >
        <input
          className={`${styles.input} h-full w-full rounded-full pr-10 pl-3 text-base`}
          style={{
            color: '#232323',
            backgroundColor: '#F5F5F5',
          }}
          type="text"
          value={input}
          placeholder={SEARCH_PLACEHOLDER}
          name="q"
          title="Search for..."
          aria-label="Search for..."
          onChange={onInputChange}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />
        {!isResultMatchKeyword && (
          <button
            className={`${styles['search-icon']} absolute right-3.5 h-4 w-4 cursor-pointer border-0 bg-transparent`}
            type="submit"
            aria-label="搜尋按鈕"
          >
            {SearchIcon}
          </button>
        )}
        {isResultMatchKeyword && (
          <button
            className={`${styles['search-icon']} absolute right-3.5 h-4 w-4 cursor-pointer border-0 bg-transparent`}
            aria-label="清除按鈕"
            onClick={onInputClear}
          >
            {CrossIcon}
          </button>
        )}
      </form>
    </>
  )
}
