'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createSession(formData) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const {
      eventName,
      duration,
      type,
      platform,
      category,
      price,
      currency,
      advicePoints
    } = formData

    // Validate required fields
    if (!eventName || !duration || !type || !platform || !category || !price || !currency) {
      return { 
        success: false, 
        error: 'Missing required fields' 
      }
    }

    // Validate advice points
    if (!advicePoints || advicePoints.length !== 6) {
      return { 
        success: false, 
        error: 'Exactly 6 advice points are required' 
      }
    }

    // Validate advice points are not empty
    const emptyAdvicePoints = advicePoints.filter(point => !point.trim())
    if (emptyAdvicePoints.length > 0) {
      return { 
        success: false, 
        error: 'All advice points must be filled' 
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return { 
        success: false, 
        error: 'User not found' 
      }
    }

    // Validate user is an expert
    if (user.accountStatus !== 'expert') {
      return { 
        success: false, 
        error: 'Only experts can create sessions' 
      }
    }

    // Validate duration
    const validDurations = [15, 30, 60]
    if (!validDurations.includes(parseInt(duration))) {
      return { 
        success: false, 
        error: 'Invalid duration. Must be 15, 30, or 60 minutes' 
      }
    }

    // Validate type
    const validTypes = ['one-on-one', 'group']
    if (!validTypes.includes(type)) {
      return { 
        success: false, 
        error: 'Invalid type. Must be "one-on-one" or "group"' 
      }
    }

    // Validate platform
    const validPlatforms = ['google-meet', 'zoom']
    if (!validPlatforms.includes(platform)) {
      return { 
        success: false, 
        error: 'Invalid platform. Must be "google-meet" or "zoom"' 
      }
    }

    // Validate currency
    const validCurrencies = ['USD', 'INR']
    if (!validCurrencies.includes(currency)) {
      return { 
        success: false, 
        error: 'Invalid currency. Must be "USD" or "INR"' 
      }
    }

    // Validate price
    const priceNumber = parseFloat(price)
    if (isNaN(priceNumber) || priceNumber <= 0) {
      return { 
        success: false, 
        error: 'Price must be a positive number' 
      }
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        eventName: eventName.trim(),
        duration: parseInt(duration),
        type,
        platform,
        category,
        price: priceNumber,
        currency,
        advicePoints: advicePoints.map(point => point.trim()),
        expertId: user.id,
        status: 'draft'
      }
    })

    // Revalidate the sessions page
    revalidatePath('/expert/sessions')
    revalidatePath('/learner/sessions')

    return { 
      success: true, 
      session,
      message: 'Session created successfully!' 
    }

  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to create session',
      details: error.message 
    }
  }
}

export async function getSessions() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return { 
        success: false, 
        error: 'User not found' 
      }
    }

    const sessions = await prisma.session.findMany({
      where: { expertId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return { 
      success: true, 
      sessions 
    }

  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to fetch sessions',
      details: error.message 
    }
  }
}

export async function updateSessionStatus(sessionId, status) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return { 
        success: false, 
        error: 'User not found' 
      }
    }

    const validStatuses = ['draft', 'published', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return { 
        success: false, 
        error: 'Invalid status' 
      }
    }

    const session = await prisma.session.update({
      where: { 
        id: sessionId,
        expertId: user.id
      },
      data: { 
        status,
        updatedAt: new Date()
      }
    })

    revalidatePath('/expert/sessions')
    revalidatePath('/learner/sessions')

    return { 
      success: true, 
      session,
      message: 'Session status updated successfully!' 
    }

  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to update session status',
      details: error.message 
    }
  }
}

export async function deleteSession(sessionId) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return { 
        success: false, 
        error: 'User not found' 
      }
    }

    await prisma.session.delete({
      where: { 
        id: sessionId,
        expertId: user.id
      }
    })

    revalidatePath('/expert/sessions')
    revalidatePath('/learner/sessions')

    return { 
      success: true, 
      message: 'Session deleted successfully!' 
    }

  } catch (error) {
    return { 
      success: false, 
      error: 'Failed to delete session',
      details: error.message 
    }
  }
}
