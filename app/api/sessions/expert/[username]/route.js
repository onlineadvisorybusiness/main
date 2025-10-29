import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const username = resolvedParams.username

    // Find the expert user by username
    const expert = await prisma.user.findUnique({
      where: { 
        username: username,
        accountStatus: 'expert'
      }
    })

    if (!expert) {
      return NextResponse.json({ 
        error: 'Expert not found' 
      }, { status: 404 })
    }


    // Get published sessions for this expert
    const sessions = await prisma.session.findMany({
      where: { 
        expertId: expert.id,
        status: 'published' // Only show published sessions
      },
      orderBy: { createdAt: 'desc' }
    })


    return NextResponse.json({ 
      success: true, 
      sessions,
      expert: {
        id: expert.id,
        username: expert.username,
        firstName: expert.firstName,
        lastName: expert.lastName,
        avatar: expert.avatar,
        linkedinUrl: expert.linkedinUrl
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch expert sessions',
      details: error.message 
    }, { status: 500 })
  }
}
