import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {

    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all users with expert status
    const experts = await prisma.user.findMany({
      where: { 
        accountStatus: 'expert'
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        linkedinUrl: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const expertsWithStats = await Promise.all(
      experts.map(async (expert) => {
        const sessions = await prisma.session.findMany({
          where: { 
            expertId: expert.id,
            status: 'active'
          },
          select: {
            id: true,
            eventName: true,  
            prices: true,
            currency: true,
            categories: true,
            type: true
          }
        })

        
        let averagePrice = 0
        if (sessions.length > 0) {
          const totalPrice = sessions.reduce((sum, session) => {
            let prices = session.prices
            if (typeof prices === 'string') {
              try {
                prices = JSON.parse(prices)
              } catch (e) {
                prices = {}
              }
            }
            const sessionAvg = Object.values(prices).reduce((s, price) => s + (parseFloat(price) || 0), 0) / Object.keys(prices).length
            return sum + (sessionAvg || 0)
          }, 0)
          averagePrice = Math.round(totalPrice / sessions.length)
        }

        return {
          ...expert,
          name: `${expert.firstName || ''} ${expert.lastName || ''}`.trim() || expert.username,
          sessionsCount: sessions.length,
          averagePrice: averagePrice,
          categories: [...new Set(sessions.flatMap(s => s.categories || [s.category].filter(Boolean)))],
          sessionTypes: [...new Set(sessions.map(s => s.type))]
        }
      })
    )

    const activeExperts = expertsWithStats.filter(expert => expert.sessionsCount > 0)

    return NextResponse.json({ 
      success: true, 
      experts: activeExperts
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to fetch experts',
      details: error.message 
    }, { status: 500 })
  }
}
