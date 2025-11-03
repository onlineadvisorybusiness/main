import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/prisma'

// GET endpoint to test if webhook URL is accessible
export async function GET(req) {
  return Response.json({ 
    message: 'Clerk webhook endpoint is accessible',
    endpoint: '/api/webhooks/clerk',
    method: 'POST',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
}

export async function POST(req) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
      return new Response('Webhook secret not configured', { status: 400 })
    }

    // Get the headers
    const headerPayload = req.headers
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occured -- no svix headers', {
        status: 400,
      })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET)

    let evt

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      })
    } catch (err) {
      return new Response('Error occured', {
        status: 400,
      })
    }

    // Handle the webhook
    const eventType = evt.type

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, username, image_url } = evt.data

      try {
        // Validate required data
        if (!id) {
          return new Response('Missing user ID', { status: 400 })
        }

        const email = email_addresses?.[0]?.email_address || ''
        
        let existingUser = null
        try {
          existingUser = await prisma.user.findUnique({
            where: { clerkId: id }
          })
        } catch (dbError) {
          // If database connection fails, wait and retry once
          if (dbError.message?.includes('timeout') || dbError.message?.includes('InternalError') || dbError.message?.includes('fatal alert')) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            try {
              existingUser = await prisma.user.findUnique({
                where: { clerkId: id }
              })
            } catch (retryError) {
              throw retryError
            }
          } else {
            throw dbError
          }
        }

        if (existingUser) {
          // Update existing user
          try {
            await prisma.user.update({
              where: { clerkId: id },
              data: {
                email: email || existingUser.email,
                firstName: first_name || existingUser.firstName,
                lastName: last_name || existingUser.lastName,
                username: username || existingUser.username,
                avatar: image_url || existingUser.avatar,
              }
            })
          } catch (updateError) {
            if (updateError.message?.includes('timeout') || updateError.message?.includes('InternalError')) {
              await new Promise(resolve => setTimeout(resolve, 2000))
              await prisma.user.update({
                where: { clerkId: id },
                data: {
                  email: email || existingUser.email,
                  firstName: first_name || existingUser.firstName,
                  lastName: last_name || existingUser.lastName,
                  username: username || existingUser.username,
                  avatar: image_url || existingUser.avatar,
                }
              })
            } else {
              throw updateError
            }
          }
        } else {
          // Create new user
          try {
            await prisma.user.create({
              data: {
                clerkId: id,
                email: email,
                firstName: first_name || null,
                lastName: last_name || null,
                username: username || null,
                avatar: image_url || null,
                accountStatus: 'learner', 
                linkedinUrl: null,
              }
            })
          } catch (createError) {
            if (createError.message?.includes('timeout') || createError.message?.includes('InternalError')) {
              await new Promise(resolve => setTimeout(resolve, 2000))
              await prisma.user.create({
                data: {
                  clerkId: id,
                  email: email,
                  firstName: first_name || null,
                  lastName: last_name || null,
                  username: username || null,
                  avatar: image_url || null,
                  accountStatus: 'learner', 
                  linkedinUrl: null,
                }
              })
            } else {
              throw createError
            }
          }
        }
    } catch (error) {
      // Return 200 to prevent Clerk from retrying on data errors
      return new Response(JSON.stringify({ 
        error: 'Error syncing user', 
        message: error.message,
        timestamp: new Date().toISOString()
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data

      try {
        await prisma.user.delete({
          where: { clerkId: id }
        })
      } catch (error) {
        return new Response('Error deleting user', { status: 500 })
      }
    }

    return new Response('', { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Error processing webhook',
      message: error.message,
      timestamp: new Date().toISOString()
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
