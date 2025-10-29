import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ExpertCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="pb-4 px-4">
        <div className="relative mb-2">
          <Skeleton className="w-56 h-56 rounded-2xl mx-auto" />
          <Skeleton className="absolute -top-1 -right-1 w-16 h-6 rounded-full" />
        </div>

        <div className="text-left">
          <div className="flex items-center justify-between mb-1">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center">
              <Skeleton className="w-4 h-4 mr-1 rounded" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
          
          <div className="mb-1">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          <div className="text-left">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20 mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
