import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ExpertProfileLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-24" />
        </div>

        {/* BookingSection Skeleton */}
        <Card className="mt-8 bg-white relative overflow-hidden border-0 shadow-none p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-4">
            {/* Left side - Expert Image Skeleton (Desktop) */}
            <div className="lg:col-span-2 relative hidden lg:block rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200">
              <div className="w-full h-full relative rounded-2xl overflow-hidden">
                <Skeleton className="w-full h-full min-h-[600px]" />
                
                {/* Top Advisor Badge Skeleton */}
                <Skeleton className="absolute top-4 left-4 w-24 h-8 rounded-md" />
                
                {/* Bottom gradient overlay area with name and bio */}
                <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 rounded-b-2xl z-10">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Skeleton className="h-10 w-48 bg-white/20" />
                    <Skeleton className="h-7 w-7 rounded-full bg-white/20" />
                  </div>
                  <Skeleton className="h-4 w-full bg-white/20 mb-2" />
                  <Skeleton className="h-4 w-3/4 bg-white/20" />
                </div>
              </div>
            </div>

            {/* Mobile Expert Profile Header Skeleton */}
            <div className="lg:hidden mb-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
                <Skeleton className="w-full h-64" />
                <Skeleton className="absolute top-4 left-4 w-20 h-6 rounded-md" />
                <div className="absolute bottom-0 left-0 right-0 p-6 pb-6 z-10">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Skeleton className="h-7 w-40 bg-white/20" />
                    <Skeleton className="h-5 w-5 rounded-full bg-white/20" />
                  </div>
                  <Skeleton className="h-4 w-full bg-white/20" />
                </div>
              </div>
            </div>

            {/* Right side - Booking Form Skeleton */}
            <div className="lg:col-span-2 p-4">
              <div className="max-w-2xl mx-auto">
                <Skeleton className="h-9 w-64 mb-4" />
                
                {/* Rating Skeleton */}
                <div className="mb-4 inline-flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="w-6 h-6 rounded" />
                    ))}
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>

                {/* Session Selection Skeleton */}
                <div className="mb-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>
                </div>

                {/* Advice Points Skeleton */}
                <div className="mb-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <ul className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <li key={i} className="flex items-start">
                        <Skeleton className="h-4 w-4 rounded-full mr-3 mt-1" />
                        <Skeleton className="h-4 w-48" />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Duration Selection Skeleton */}
                <div className="mb-4">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                </div>

                {/* Date Picker Skeleton */}
                <div className="mb-4">
                  <Skeleton className="h-5 w-24 mb-4" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>

                {/* Timezone Select Skeleton */}
                <div className="mb-6 mt-4">
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>

                {/* Separator */}
                <Skeleton className="h-px w-full my-4" />

                {/* Total Price Skeleton */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Skeleton className="h-6 w-16 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>

                {/* Book Button Skeleton */}
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </Card>

        {/* AboutAndReviews Skeleton */}
        <div className="p-4 space-y-6 mt-8">
          {/* About Me Card Skeleton */}
          <Card className="bg-white border-0 shadow-none p-6">
            <CardContent className="p-4">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-5 w-48" />
              </div>
              
              <div className="mb-6">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Categories Skeleton */}
              <div className="mt-8">
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-8 w-32 rounded-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Card Skeleton */}
          <Card className="bg-white border-0 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-8">
                <Skeleton className="h-7 w-48" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((reviewIndex) => (
                  <Card key={reviewIndex} className="bg-gray-50 border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start mb-4">
                        <Skeleton className="w-14 h-14 rounded-full mr-4" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <div className="flex items-center mb-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="w-4 h-4 rounded" />
                              ))}
                            </div>
                            <Skeleton className="h-4 w-20 ml-3" />
                          </div>
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination Skeleton */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <Skeleton className="h-10 w-24 rounded-lg" />
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-8 w-8 rounded-lg" />
                  ))}
                </div>
                <Skeleton className="h-10 w-24 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

