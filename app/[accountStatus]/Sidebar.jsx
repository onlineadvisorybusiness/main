'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  Calendar,
  Clock,
  DollarSign,
  Settings,
  Bell,
  HelpCircle,
  MessageSquare,
  User,
  LogOut,
  ArrowLeftRight,
  Network,
  CalendarCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignOutButton } from '@clerk/nextjs'
import NextImage from 'next/image'

const getNavigationItems = (accountStatus) => {
  const baseNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
  ]

  if (accountStatus === 'expert') {
    baseNavigation.push(
      {
        name: 'Sessions',
        href: '/sessions',
        icon: Calendar,
      },
      {
        name: 'Availability',
        href: '/availability',
        icon: Clock,
      },
      {
        name: 'Meetings',
        href: '/meetings',
        icon: CalendarCheck,
      }
    )
  } else if (accountStatus === 'learner') {
    baseNavigation.push(
      {
        name: 'My Meetings',
        href: '/meetings',
        icon: CalendarCheck,
      }
    )
  }

  if (accountStatus === 'learner') {
    baseNavigation.push(
      {
        name: 'Chat with Expert',
        href: '/chat',
        icon: MessageSquare,
      },
    )
  } else if (accountStatus === 'expert') {
    baseNavigation.push(
      {
        name: 'Chat with Learner',
        href: '/chat',
        icon: MessageSquare,
      },
    )
  }

  if (accountStatus === 'learner') {
    baseNavigation.push(
      {
        name: 'Billing & Transactions',
        href: '/transactions',
        icon: ArrowLeftRight,
      }
    )
  }

  if (accountStatus === 'expert') {
    baseNavigation.push(
      {
        name: 'Integrations',
        href: '/integrations',
        icon: Network,
      }
    )
  }

  return baseNavigation
}

export default function DashboardSidebar({ accountStatus, user }) {
  const pathname = usePathname()
  const basePath = `/${accountStatus}`
  const navigation = getNavigationItems(accountStatus)  

  return (
    <Sidebar variant="inset" className="h-screen w-52">
      <SidebarHeader className="shrink-0">
        <div className="flex items-left justify-left p-2">
          <div className="relative w-10 h-10">
            <NextImage 
              src="/logo.png" 
              alt="Company Logo" 
              fill 
              className="object-contain" 
              sizes="48px"
              priority
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-hidden">
        <div className="flex flex-col h-full">
          <SidebarGroup className="shrink-0">
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0">
                 {navigation.slice(0, accountStatus === 'expert' ? 4 : 2).map((item) => {
                  const href = `${basePath}${item.href}`
                  const isActive = pathname === href || (item.href === '' && pathname === basePath)
                  
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.name}
                      >
                        <Link href={href}>
                          <item.icon className="h-3 w-3" />
                          <span className="text-sm">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="shrink-0" />

          <SidebarGroup className="shrink-0">
            <SidebarGroupLabel className="text-xs">Communication</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-0">
                {navigation.slice(accountStatus === 'expert' ? 4 : 2, accountStatus === 'expert' ? 5 : 3).map((item) => {
                  const href = `${basePath}${item.href}`
                  const isActive = pathname === href
                  
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.name}
                      >
                        <Link href={href}>
                          <item.icon className="h-3 w-3" />
                          <span className="truncate text-sm">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="shrink-0" />

          {accountStatus === 'expert' && (
            <>
              <SidebarGroup className="shrink-0">
                <SidebarGroupLabel className="text-xs">Financial</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === `${basePath}/view-earnings`}
                        tooltip="View Earnings"
                      >
                        <Link href={`${basePath}/view-earnings`}>
                          <DollarSign className="h-3 w-3" />
                          <span className="truncate text-sm">View Earnings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator className="shrink-0" />
            </>
          )}

          {navigation.slice(accountStatus === 'expert' ? 5 : 3).length > 0 && (
            <SidebarGroup className="shrink-0">
              <SidebarGroupLabel className="text-xs">Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0">
                  {navigation.slice(accountStatus === 'expert' ? 5 : 3).map((item) => {
                    // Handle dynamic routes properly
                    const href = item.href.includes('[accountStatus]') 
                      ? item.href.replace('[accountStatus]', accountStatus)
                      : `${basePath}${item.href}`
                    const isActive = pathname === href
                    
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.name}
                        >
                          <Link href={href}>
                            <item.icon className="h-3 w-3" />
                            <span className="truncate text-sm">{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="shrink-0">
        <div className="flex flex-col gap-1 p-1">
          <SignOutButton> 
            <Button variant="ghost" className="justify-start text-sm font-medium bg-red-500 text-white hover:bg-red-600 hover:text-white" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
