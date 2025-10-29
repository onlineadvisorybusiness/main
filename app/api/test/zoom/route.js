import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import jwt from 'jsonwebtoken'

export async function GET() {
  // Protect test endpoint in production
  if (process.env.NODE_ENV === 'production') {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  
  try {
    // Check if Zoom credentials are configured
    if (!process.env.ZOOM_API_KEY || !process.env.ZOOM_API_SECRET) {
      return NextResponse.json({
        success: false,
        error: 'Zoom API credentials not configured',
        details: {
          hasApiKey: !!process.env.ZOOM_API_KEY,
          hasApiSecret: !!process.env.ZOOM_API_SECRET
        }
      }, { status: 400 })
    }

    // Create JWT token for Zoom API
    const payload = {
      iss: process.env.ZOOM_API_KEY,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
    }
    const token = jwt.sign(payload, process.env.ZOOM_API_SECRET)

    // Test API connection
    const response = await fetch('https://api.zoom.us/v2/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({
        success: false,
        error: 'Zoom API connection failed',
        details: {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        }
      }, { status: response.status })
    }

    const userData = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Zoom API connection successful',
      details: {
        apiKey: process.env.ZOOM_API_KEY.substring(0, 10) + '...',
        userEmail: userData.email,
        userType: userData.type,
        accountType: userData.account_type
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: {
        message: error.message
      }
    }, { status: 500 })
  }
}
