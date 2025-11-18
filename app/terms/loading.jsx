import { Skeleton } from '@/components/ui/skeleton'

export default function TermsLoading() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-12 md:py-16 lg:py-20">
        {/* Header Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Image Skeleton */}
        <div className="rounded-2xl overflow-hidden w-full border-2 border-gray-200 shadow-lg mb-12">
          <Skeleton className="w-full aspect-video" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-12">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              {index % 2 === 0 && (
                <div className="pl-6 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

