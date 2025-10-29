import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getGoogleAuthUrl } from '@/lib/google'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate Google OAuth URL
    const authUrl = getGoogleAuthUrl()
    
    return NextResponse.json({ 
      success: true, 
      authUrl: authUrl 
    })

  } catch (error) {
    console.error('Error generating Google auth URL:', error)
    return NextResponse.json({ 
      error: 'Failed to generate auth URL' 
    }, { status: 500 })
  }
}