import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ExpertProfileSettings from './components/expert-profile-settings'
import LearnerProfileSettings from './components/learner-profile-settings'

export default async function DashboardPage({ params }) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/auth/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { accountStatus } = await params
  if (!['learner', 'expert'].includes(accountStatus)) {
    redirect('/marketplace')
  }

  if (user.accountStatus !== accountStatus) {
    console.log(`Access denied: User ${user.id} with role '${user.accountStatus}' attempted to access '${accountStatus}' dashboard`)
    redirect(`/${user.accountStatus}/dashboard`)
  }

  return (
    <div className="space-y-6 h-full overflow-auto">
      {accountStatus === 'expert' ? (
        <ExpertProfileSettings />
      ) : (
        <LearnerProfileSettings />
      )}
    </div>
  )
}

export async function generateMetadata({ params }) {
  const { accountStatus } = await params
  
  const { userId } = await auth()
  let userFirstName = 'User'
  
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { firstName: true }
      })
      if (user?.firstName) {
        userFirstName = user.firstName
      }
    } catch (error) {
      console.error('Error fetching user for metadata:', error)
    }
  }
  
  return {
    title: `${userFirstName} || ${accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)} Sessions`,
    description: `Manage your ${accountStatus} sessions`
  }
}