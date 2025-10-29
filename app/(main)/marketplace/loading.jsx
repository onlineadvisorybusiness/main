import { ExpertCardSkeleton } from '@/components/ui/expert-card-skeleton'

export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="h-12 bg-gray-200 rounded-lg w-96 mx-auto mb-6 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-80 mx-auto mb-8 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg w-96 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {[1, 2, 3, 4].map((categoryIndex) => (
          <div key={categoryIndex} className="mb-20">
            <div className="flex items-center mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded mr-3 animate-pulse"></div>
                <div>
                  <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <ExpertCardSkeleton key={index} />
              ))}
            </div>
            
            <div className="text-center">
              <div className="h-6 bg-gray-200 rounded w-20 mx-auto animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
