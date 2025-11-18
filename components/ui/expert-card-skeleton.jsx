import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ExpertCardSkeleton() {
  return (
    <Card className="group hover:scale-105 transition-transform duration-300 cursor-pointer h-full overflow-hidden py-0 border-0 !shadow-none">
      <CardContent className="p-0">
        <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200">
          <Skeleton className="w-full h-56 rounded-xl" />
          <Skeleton className="absolute top-2 left-2 w-20 h-6 rounded-md" />
        </div>

        <div className="p-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>

          <div className="mt-2 mb-1">
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          <div className="flex items-baseline justify-between mt-2">
            <div>
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-20 mt-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
