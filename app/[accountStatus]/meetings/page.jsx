'use client'

import { useUser } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import ExpertMeetings from './components/Expert-meetings'
import LearnerMeetings from './components/Learner-meetings'

export default function MeetingsPage() {
  const { user } = useUser()
  const params = useParams()
  const accountStatus = params.accountStatus

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="mb-6">
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="border rounded-lg p-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 flex-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (accountStatus === 'expert') {
    return <ExpertMeetings />
  } else if (accountStatus === 'learner') {
    return <LearnerMeetings />
  } else {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Account Status</h1>
          <p className="text-gray-600">Please contact support if you continue to see this message.</p>
        </div>
      </div>
    )
  }
}
