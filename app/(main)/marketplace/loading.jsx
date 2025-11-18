import { ExpertCardSkeleton } from '@/components/ui/expert-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function MarketplaceLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-16">
          <div className="text-center">
            <div className="mb-10">
              <Skeleton className="h-10 w-96 mx-auto mb-6" />
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
          
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-12">
        {[1, 2, 3, 4].map((categoryIndex) => (
          <div key={categoryIndex} className="mb-6">
            <div className="mb-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center group">
                  <div>
                    <div className="flex items-center">
                      <div className="flex items-center mb-1">
                        <Skeleton className="h-7 w-48 mr-3" />
                        <Skeleton className="h-6 w-6" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-64 mt-2" />
                  </div>                    
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <ExpertCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
