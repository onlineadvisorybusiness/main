'use client'

import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function SearchInput({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (onSearch) {
        onSearch(searchQuery.trim())
      }
    }
  }

  const handleChange = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <Input
      type="text"
      placeholder="Search by name, expertise, or industry..."
      value={searchQuery}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="w-full pl-16 pr-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md"
    />
  )
}

