import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { avatarUrl } = await request.json()

    if (!avatarUrl) {
      return NextResponse.json({ error: 'Avatar URL is required' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        avatar: avatarUrl
      }
    })


    return NextResponse.json({
      success: true,
      message: 'Avatar updated successfully'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update avatar' },
      { status: 500 }
    )
  }
}
