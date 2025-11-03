import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ExpertsSessions from './components/ExpertsSessions'
import LearnerSessions from './components/LearnerSessions'

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
    redirect(`/${user.accountStatus}/dashboard`)
  }

  return (
    <div className="space-y-6 h-full overflow-auto">
      {accountStatus === 'expert' ? (
        <ExpertsSessions user={user} />
      ) : (
        <LearnerSessions user={user} />
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
    }
  }
  
  return {
    title: `${userFirstName} || ${accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)} Sessions`,
    description: `Manage your ${accountStatus} sessions`
  }
}