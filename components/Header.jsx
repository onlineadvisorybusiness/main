'use client'

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LayoutDashboardIcon, LogIn, Search, TrendingUp, Rocket, Target, Users, Zap } from 'lucide-react'
import { UserMenu } from './user-menu'
import { motion, AnimatePresence } from 'framer-motion'

export function Header({ bgColor = 'auto' }) {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [userStatus, setUserStatus] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isHeaderSearchExpanded, setIsHeaderSearchExpanded] = useState(false)
  const searchContainerRef = useRef(null)
  const searchInputRef = useRef(null)

  const suggestions = [
    { text: "Raising Seed round", icon: TrendingUp },
    { text: "Build my MVP", icon: Rocket },
    { text: "Go-to-market strategy", icon: Target },
    { text: "Hiring early team", icon: Users },
    { text: "Launch and early traction", icon: Zap }
  ]

  const handleSuggestionClick = (suggestion) => {
    router.push(`/marketplace?search=${encodeURIComponent(suggestion.text)}`)
    setIsHeaderSearchExpanded(false)
    setSearchQuery('')
  }

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

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsHeaderSearchExpanded(false)
      setSearchQuery('')
    } else {
      router.push('/marketplace')
      setIsHeaderSearchExpanded(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsHeaderSearchExpanded(false)
      }
    }

    if (isHeaderSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isHeaderSearchExpanded])


  if (pathname.startsWith('/expert') || pathname.startsWith('/learner') || pathname.startsWith('/auth/')) {
    return null
  }

  const getHeaderStyles = () => {   
    let selectedBgColor = bgColor
    if (bgColor === 'auto') {
      if (pathname === '/' || pathname.startsWith('/auth/')) {
        selectedBgColor = 'transparent'
      }
      else if (pathname.startsWith('/marketplace') || pathname.startsWith('/expert/') || pathname.startsWith('/learner/')) {
        selectedBgColor = 'white'
      }
      else {
        selectedBgColor = 'white'
      }
    }

    switch (selectedBgColor) {
      case 'transparent':
        return {
          navClass: 'bg-transparent absolute top-0 left-0 right-0 z-50',
          logoClass: 'text-white',
          buttonClass: 'bg-white hover:bg-gray-100 text-gray-800',
          marketplaceButtonClass: 'bg-transparent text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer border border-white hover:bg-transparent group relative overflow-hidden'
        }
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
  const isTermsOrPrivacy = pathname === '/terms' || pathname === '/privacy'

  // Special header for terms and privacy pages
  if (isTermsOrPrivacy) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center gap-1.5">
                <h1 className="text-xl tracking-tight text-black font-normal" style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}>
                  myfirstcheque
                </h1>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {!isLoading && !user && (
                <>
                  <Button
                    asChild
                    className="bg-gray-100 hover:bg-gray-200 text-black px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                  >
                    <Link href="/auth/sign-in">
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="bg-black hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                  >
                    <Link href="/marketplace" className="flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      <span>Find your expert</span>
                    </Link>
                  </Button>
                </>
              )}
              {!isLoading && user && (
                <>
                  <Button
                    asChild
                    className="bg-gray-100 hover:bg-gray-200 text-black px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-150"
                  >
                    <Link href={`/${userStatus}/dashboard`}>
                      Dashboard
                    </Link>
                  </Button>
                  <UserMenu />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className={`${styles.navClass} ${pathname === '/' ? 'border-b-0' : 'border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
        <div className="flex items-center justify-between h-16 gap-4">    
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl tracking-tight text-black font-normal" style={{ fontFamily: "'Libre Caslon Condensed', 'Playfair Display', serif" }}>
                myfirstcheque
              </h1>
            </Link>
          </div>

          {pathname === '/' && (
            <div 
              ref={searchContainerRef} 
              className="flex-1 mx-4 hidden md:block relative flex justify-center"
            >
              <form onSubmit={handleSearch} className={`relative transition-all duration-300 ease-in-out ${
                isHeaderSearchExpanded ? 'w-full max-w-3xl' : 'w-full max-w-lg mx-auto'
              }`}>
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-white transition-all duration-300 z-10 ${
                    isHeaderSearchExpanded ? 'h-5 w-5' : 'h-4 w-4'
                  }`} />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search by topic, challenge or expert..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsHeaderSearchExpanded(true)}
                    className={`w-full py-2 bg-black/30 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 ${
                      isHeaderSearchExpanded ? 'pl-10 pr-32' : 'pl-10 pr-4'
                    }`}
                  />
                  <AnimatePresence>
                    {isHeaderSearchExpanded && (
                      <motion.button
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        type="button"
                        onClick={() => router.push('/marketplace')}
                        className="absolute right-2 top-1 bottom-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-4 rounded-lg text-sm font-medium transition-all duration-200 z-10 flex items-center"
                      >
                        Get real advice
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </form>

              <AnimatePresence>
                {isHeaderSearchExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-2xl z-50 border border-white/10"
                  >
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-4 font-medium">What others are asking about</p>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, index) => {
                          const Icon = suggestion.icon
                          return (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              onMouseDown={(e) => e.preventDefault()}
                              className="flex items-center gap-3 w-full text-left text-white hover:text-gray-200 hover:bg-gray-700/50 px-3 py-2 rounded-md transition-colors duration-150 text-sm"
                            >
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              <span>{suggestion.text}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex items-center space-x-4 flex-shrink-0"> 
            {!isLoading && user && (
              <>
                {userStatus === 'expert' ? (
                  pathname === '/marketplace' ? (
                    <Button
                      asChild
                      className="bg-gray-950 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150"
                    >
                      <Link href={`/${userStatus}/dashboard`} className="flex items-center">
                        <LayoutDashboardIcon className="w-4 h-4 mr-2" />
                        View Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="bg-white hover:bg-gray-50 text-gray-900 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer"
                    >
                    <Link href="/marketplace">
                     <Rocket className="w-4 h-4 mr-1" />
                     <span>Find your expert</span>
                    </Link>
                  </Button>
                  )
                ) : (
                  <Button
                    asChild
                    className="bg-gray-950 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150"
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
                  className="bg-transparent hover:bg-transparent text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer border border-white/30"
                >
                  <Link href="/auth/sign-in">
                    Sign In
                    <LogIn className="w-4 h-4 mr-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  className="bg-white hover:bg-gray-50 text-gray-900 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer"
                >
                  <Link href="/marketplace">
                    <Rocket className="w-4 h-4 mr-1" />
                     <span>Find your expert</span>
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
