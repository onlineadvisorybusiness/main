import { NextResponse } from 'next/server'
import { auth, createClerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getGoogleTokens } from '@/lib/google'

export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')

    // Verify state parameter for security
    if (state !== 'google_calendar_connect') {
      return NextResponse.redirect(new URL('/expert/sessions?error=invalid_state', request.url))
    }

    // Handle OAuth error
    if (error) {
      return NextResponse.redirect(new URL('/expert/sessions?error=google_auth_failed', request.url))
    }

    // Handle missing code
    if (!code) {
      return NextResponse.redirect(new URL('/expert/sessions?error=no_auth_code', request.url))
    }

    try {
      // Exchange code for tokens
      const tokens = await getGoogleTokens(code)
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { clerkId: userId }
      })

      if (!user) {
        return NextResponse.redirect(new URL('/expert/sessions?error=user_not_found', request.url))
      }

      // Save Google Calendar tokens to both database and Clerk metadata
      const tokenData = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        expiry_date: tokens.expiry_date,
        connected_at: new Date().toISOString()
      }

      // Save to database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          googleCalendarTokens: JSON.stringify(tokenData),
          googleCalendarConnected: true
        }
      })

      // Save to Clerk user metadata
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY
      })
      
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          googleCalendarConnected: true,
          googleCalendarConnectedAt: new Date().toISOString()
        },
        privateMetadata: {
          googleCalendarTokens: tokenData
        }
      })

      
      // Redirect back to sessions page with success message
      return NextResponse.redirect(new URL('/expert/sessions?success=google_calendar_connected', request.url))

    } catch (tokenError) {
      return NextResponse.redirect(new URL('/expert/sessions?error=token_exchange_failed', request.url))
    }

  } catch (error) {
    return NextResponse.redirect(new URL('/expert/sessions?error=callback_failed', request.url))
  }
}