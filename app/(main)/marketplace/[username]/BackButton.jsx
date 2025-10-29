'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <Button
      onClick={handleBack}
      className="group flex items-center gap-2 px-2 py-2 text-gray-800 hover:text-gray-900 transition-all duration-300 bg-transparent hover:bg-transparent rounded-lg overflow-hidden border border-gray-300 shadow-md"
      style={{ width: 'fit-content' }}
    >
      <div className="flex items-center gap-2 transition-all duration-300 group-hover:gap-2 rounded-lg p-2 hover:underline">
        <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span className="text-sm font-medium whitespace-nowrap transition-all duration-300 group-hover:font-semibold">
          Back  
        </span>
      </div>
    </Button>
  )
}
