import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function MainLayout({ children }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="min-h-screen bg-gray-50">      
      <main>{children}</main>
    </div>
  )
}
