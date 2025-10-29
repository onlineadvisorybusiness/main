import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getGoogleAuth } from '@/lib/google'

export async function GET() {
  // Protect test endpoint in production
  if (process.env.NODE_ENV === 'production') {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  
  try {
    // Test OAuth client initialization
    const auth = getGoogleAuth()
    
    // Test auth URL generation
    const authUrl = auth.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'openid',
        'email',
        'profile'
      ],
      prompt: 'consent',
      include_granted_scopes: true,
      state: 'test_connection'
    })

    return NextResponse.json({
      success: true,
      message: 'Google OAuth configuration is valid',
      authUrl: authUrl,
      redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback',
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      clientIdPrefix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'MISSING',
      clientSecretPrefix: process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...' : 'MISSING',
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      troubleshooting: {
        message: 'If you get invalid_client error, check these:',
        steps: [
          '1. Go to Google Cloud Console -> APIs & Services -> Credentials',
          '2. Click on your OAuth 2.0 Client ID',
          '3. In "Authorized redirect URIs", make sure you have exactly: ' + (process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback'),
          '4. Save the changes',
          '5. Wait a few minutes for changes to propagate'
        ]
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback',
        clientIdPrefix: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'MISSING',
        clientSecretPrefix: process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.substring(0, 10) + '...' : 'MISSING',
        appUrl: process.env.NEXT_PUBLIC_APP_URL
      },
      troubleshooting: {
        message: 'Common fixes for invalid_client error:',
        steps: [
          '1. Verify redirect URI in Google Cloud Console matches exactly: ' + (process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback'),
          '2. Check that Client ID and Secret are copied correctly (no extra spaces)',
          '3. Ensure the OAuth consent screen is configured',
          '4. Make sure Google Calendar API is enabled in your project'
        ]
      }
    }, { status: 500 })
  }
}
