'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LayoutDashboardIcon, LogInIcon, HelpCircleIcon, ArrowRightIcon, StoreIcon, CircleArrowRightIcon } from 'lucide-react'
import { UserMenu } from './user-menu'

export function Header({ bgColor = 'auto' }) {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const [userStatus, setUserStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (isLoaded && user) {
        try {
          const response = await fetch('/api/users/sync')
          if (response.ok) {
            const data = await response.json()
            setUserStatus(data.user?.accountStatus || 'learner')
          }
        } catch (error) {
          setUserStatus('learner') // Default to learner on error
        } finally {
          setIsLoading(false)
        }
      } else if (isLoaded && !user) {
        setIsLoading(false)
      }
    }

    fetchUserStatus()
  }, [isLoaded, user])

  if (pathname.startsWith('/expert') || pathname.startsWith('/learner') || pathname.startsWith('/auth/')) {
    return null
  }

  const getHeaderStyles = () => {   
    let selectedBgColor = bgColor
    if (bgColor === 'auto') {
      if (pathname === '/' || pathname.startsWith('/auth/')) {
        selectedBgColor = 'green'
      }
      else if (pathname.startsWith('/marketplace') || pathname.startsWith('/expert/') || pathname.startsWith('/learner/')) {
        selectedBgColor = 'white'
      }
      else {
        selectedBgColor = 'white'
      }
    }

    switch (selectedBgColor) {
      case 'green':
        return {
          navClass: 'bg-green-950',
          logoClass: 'text-white',
          buttonClass: 'bg-white hover:bg-gray-100 text-gray-800',
          marketplaceButtonClass: 'bg-transparent text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer border border-white hover:bg-transparent group relative overflow-hidden'
        }
      default:
        return {
          navClass: 'bg-white',
          logoClass: 'text-gray-900',
          buttonClass: 'bg-gray-950 hover:bg-gray-900 text-white',
          marketplaceButtonClass: 'bg-transparent text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer border border-gray-800 hover:bg-transparent group relative overflow-hidden'
        }
    }
  }

  const styles = getHeaderStyles()

  return (
    <nav className={styles.navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">    
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <h1 className={`text-2xl tracking-tight italic font-caslon-condensed ${styles.logoClass}`}>
                Advisory Platform
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isLoading && user && (
              <>
                {userStatus === 'expert' ? (
                  pathname === '/marketplace' ? (
                    <Button
                      asChild
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150"
                    >
                      <Link href={`/${userStatus}/dashboard`} className="flex items-center">
                        <LayoutDashboardIcon className="w-4 h-4 mr-2" />
                        View Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className={styles.marketplaceButtonClass}
                    >
                      <Link href="/marketplace" className="flex items-center">
                        <StoreIcon className="w-4 h-4 mr-1" />
                        <span className="group-hover:mr-6 transition-all duration-150">Marketplace</span>
                        <ArrowRightIcon className="w-4 h-4 absolute right-2 opacity-0 group-hover:opacity-100 transition-all duration-150" />
                      </Link>
                    </Button>
                  )
                ) : (
                  <Button
                    asChild
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150"
                  >
                    <Link href="/become-an-expert">
                      Become an Expert
                    </Link>
                  </Button>
                )}
                <UserMenu />
              </>
            )}
            {!isLoading && !user && (
              <>
                <Button
                  asChild
                  className="bg-transparent text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer border border-white hover:bg-transparent"
                >
                  <Link href="/how-its-works">
                    <HelpCircleIcon className="w-4 h-4 mr-1" />
                    How Its Works
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer"
                >
                  <Link href="/auth/sign-in">
                    <LogInIcon className="w-4 h-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
