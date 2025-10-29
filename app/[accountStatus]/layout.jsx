import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import DashboardSidebar from './Sidebar'
import { UserMenu } from '@/components/user-menu'
import DynamicHeader from './components/DynamicHeader'

export default async function AccountStatusLayout({ children, params }) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/auth/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
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
    <SidebarProvider 
      style={{ "--sidebar-width": "13rem" }}
    >
      <DashboardSidebar accountStatus={accountStatus} user={user} />
      <SidebarInset className="flex-1 min-w-0">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <DynamicHeader />
          </div>
          <div className="flex items-center">
            <UserMenu />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 overflow-hidden">
          <div className="flex-1 overflow-auto w-full">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
