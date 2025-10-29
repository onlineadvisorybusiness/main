import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    const {
      eventName,
      duration,
      type,
      platform,
      category,
      categories,
      price,
      prices,
      currency,
      advicePoints
    } = body
    
    if (!eventName || !type || !platform || (!categories && !category) || !prices || !currency) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    const hasValidPrice = Object.values(prices).some(price => price && price.trim() !== '' && !isNaN(parseFloat(price)))
    if (!hasValidPrice) {
      return NextResponse.json({ 
        error: 'At least one valid price is required' 
      }, { status: 400 })
    }

    if (!advicePoints || advicePoints.length !== 6) {
      return NextResponse.json({ 
        error: 'Exactly 6 advice points are required' 
      }, { status: 400 })
    }

    const emptyAdvicePoints = advicePoints.filter(point => !point.trim())
    if (emptyAdvicePoints.length > 0) {
      return NextResponse.json({ 
        error: 'All advice points must be filled' 
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    if (user.accountStatus !== 'expert') {
      return NextResponse.json({ 
        error: 'Only experts can create sessions' 
      }, { status: 403 })
    }

    for (const [duration, price] of Object.entries(prices)) {
      if (price && price.trim() !== '') {
        const priceNumber = parseFloat(price)
        if (isNaN(priceNumber) || priceNumber <= 0) {
          return NextResponse.json({ 
            error: `Invalid price for ${duration} minutes. Must be a positive number.` 
          }, { status: 400 })
        }
      }
    }

    const validTypes = ['one-on-one', 'group']
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid type. Must be "one-on-one" or "group"' 
      }, { status: 400 })
    }

    const validPlatforms = ['google-meet', 'zoom']
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json({ 
        error: 'Invalid platform. Must be "google-meet" or "zoom"' 
      }, { status: 400 })
    }

    const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'AED', 'RUB', 'TRY', 'CHF', 'CAD', 'AUD', 'BRL', 'VND', 'MYR', 'IDR', 'MXN']
    if (!validCurrencies.includes(currency)) {
      return NextResponse.json({ 
        error: `Invalid currency. Must be one of: ${validCurrencies.join(', ')}` 
      }, { status: 400 })
    }


    const sessionData = {
      eventName: eventName.trim(),
      type,
      platform,
      categories: categories || [category].filter(Boolean),
      prices: prices,
      currency,
      advicePoints: advicePoints.map(point => point.trim()),
      expertId: user.id,
      status: 'draft'
    }
    console.log('🔍 DEBUG: Session data to create:', sessionData)
    
    const session = await prisma.session.create({
      data: sessionData
    })
    
    console.log('✅ DEBUG: Session created successfully:', session)

    return NextResponse.json({ 
      success: true, 
      session,
      message: 'Session created successfully!' 
    })

  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ 
      error: 'Failed to create session',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    const sessions = await prisma.session.findMany({
      where: { expertId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true, 
      sessions 
    })

  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch sessions',
      details: error.message 
    }, { status: 500 })
  }
}
