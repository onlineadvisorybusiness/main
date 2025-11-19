'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { SignOutButton } from '@clerk/nextjs'
import { LogOutIcon, ChevronDownIcon, StoreIcon, SettingsIcon, MailIcon, HelpCircleIcon, ChevronRightIcon, UserIcon, LayoutDashboardIcon } from 'lucide-react'
import Link from 'next/link'
import NextImage from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProfileCard } from '@/components/ProfileCard'

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [userStatus, setUserStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showProfileCard, setShowProfileCard] = useState(false)
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (isLoaded && user) {
        try {
          const response = await fetch('/api/users/sync')
          if (response.ok) {
            const data = await response.json()
            setUserStatus(data.user?.accountStatus || 'learner')
          } else {
            setUserStatus('learner')
          }
        } catch (error) {
          setUserStatus('learner')
        } finally {
          setIsLoading(false)
        }
      } else if (isLoaded && !user) {
        setIsLoading(false)
      }
    }

    fetchUserStatus()
  }, [isLoaded, user])

  if (!user) return null

  return (
    <div className="relative">
      {/* User Avatar Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden relative">
          <NextImage
            src={user.imageUrl || '/default-avatar.png'}
            alt={user.fullName || 'User'}
            fill
            className="object-cover"
            sizes="32px"
          />
        </div>
        <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform duration-100 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-4 z-50">

          <div className="px-4 pb-4 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden relative">
                <NextImage
                  src={user.imageUrl || '/default-avatar.png'}
                  alt={user.fullName || 'User'}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {user.fullName || 'User'}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {user.primaryEmailAddress?.emailAddress || 'No email'}
                </p>
                {user.username && (
                  <Badge variant="secondary" className="text-xs mt-1 bg-gray-100 text-gray-600 hover:bg-gray-100">
                    @{user.username}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="py-2">
            {!isLoading && (userStatus === 'expert' || userStatus === 'learner') && (
              <Link href={userStatus === 'expert' ? '/expert/dashboard' : '/learner/dashboard'} onClick={() => setIsOpen(false)}>
                <div className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <LayoutDashboardIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Dashboard</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                </div>
              </Link>
            )}
            
            <Link href="/marketplace" onClick={() => setIsOpen(false)}>
              <div className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <StoreIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Marketplace</span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
            
            <div 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowProfileCard(true)
                setIsOpen(false)
              }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Profile</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            </div>
            
            <Link href="/settings" onClick={() => setIsOpen(false)}>
              <div className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <SettingsIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Settings</span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
            
            <Link href="/help" onClick={() => setIsOpen(false)}>
              <div className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <HelpCircleIcon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700">Help & Support</span>
                </div>
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          </div>

          <div className="px-4 pt-2 border-t border-gray-100">
            <SignOutButton>
              <Button 
                variant="destructive"
                className="w-full text-sm font-semibold flex items-center justify-center space-x-2"
              >
                <LogOutIcon className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </SignOutButton>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {showProfileCard && userStatus && (
        <ProfileCard 
          userStatus={userStatus} 
          onClose={() => setShowProfileCard(false)} 
        />
      )}
    </div>
  )
}