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
  const timestamp = new Date().toISOString()
  console.log(`🔔 DEBUG [${timestamp}]: Webhook endpoint called`)
  console.log(`   - Environment: ${process.env.NODE_ENV}`)
  console.log(`   - URL: ${req.url}`)
  
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
      console.error('❌ DEBUG: CLERK_WEBHOOK_SECRET is missing from environment variables')
      return new Response('Webhook secret not configured', { status: 400 })
    }
    
    console.log(`✅ DEBUG: Webhook secret found (length: ${WEBHOOK_SECRET.length})`)

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
      console.error('Error verifying webhook:', err)
      return new Response('Error occured', {
        status: 400,
      })
    }

    // Handle the webhook
    const eventType = evt.type
    
    console.log(`🔔 DEBUG: Webhook received - Event Type: ${eventType}`)

    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, username, image_url } = evt.data

      try {
        // Validate required data
        if (!id) {
          console.error('❌ DEBUG: Missing user ID in webhook data')
          return new Response('Missing user ID', { status: 400 })
        }

        const email = email_addresses?.[0]?.email_address || ''
        
        console.log(`📝 DEBUG: Processing ${eventType} for user:`)
        console.log(`   - Clerk ID: ${id}`)
        console.log(`   - Email: ${email}`)
        console.log(`   - Username: ${username || 'no username'}`)
        console.log(`   - First Name: ${first_name || 'no first name'}`)
        console.log(`   - Last Name: ${last_name || 'no last name'}`)
        console.log(`   - Avatar: ${image_url || 'no avatar'}`)

        // Check if user exists with retry logic
        console.log(`🔍 DEBUG: Checking if user exists in database for Clerk ID: ${id}`)
        console.log(`🔍 DEBUG: DATABASE_URL configured: ${!!process.env.DATABASE_URL}`)
        console.log(`🔍 DEBUG: Environment: ${process.env.NODE_ENV || 'development'}`)
        
        let existingUser = null
        try {
          const queryStartTime = Date.now()
          console.log(`🔍 DEBUG: Executing Prisma query: findUnique user by clerkId`)
          
          existingUser = await prisma.user.findUnique({
            where: { clerkId: id }
          })
          
          const queryTime = Date.now() - queryStartTime
          console.log(`✅ DEBUG: Query completed in ${queryTime}ms`)
          
          if (existingUser) {
            console.log(`✅ DEBUG: User found in database:`)
            console.log(`   - Database ID: ${existingUser.id}`)
            console.log(`   - Email: ${existingUser.email}`)
            console.log(`   - Account Status: ${existingUser.accountStatus}`)
          } else {
            console.log(`⚠️ DEBUG: User NOT found in database - will create new user`)
          }
        } catch (dbError) {
          const errorDetails = {
            message: dbError.message,
            code: dbError.code,
            name: dbError.name,
            stack: dbError.stack?.substring(0, 500),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            databaseUrlPresent: !!process.env.DATABASE_URL
          }
          
          console.error(`❌ DEBUG: Database query error - Full details:`, JSON.stringify(errorDetails, null, 2))
          
          // If database connection fails, wait and retry once
          if (dbError.message?.includes('timeout') || dbError.message?.includes('InternalError') || dbError.message?.includes('fatal alert')) {
            console.log('⚠️ DEBUG: Database connection issue detected, retrying in 2 seconds...')
            console.log('⚠️ DEBUG: Error type:', {
              hasTimeout: dbError.message?.includes('timeout'),
              hasInternalError: dbError.message?.includes('InternalError'),
              hasFatalAlert: dbError.message?.includes('fatal alert'),
              fullMessage: dbError.message
            })
            
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            try {
              console.log('🔍 DEBUG: Retrying database query...')
              const retryStartTime = Date.now()
              existingUser = await prisma.user.findUnique({
                where: { clerkId: id }
              })
              const retryTime = Date.now() - retryStartTime
              console.log(`✅ DEBUG: Retry query completed in ${retryTime}ms`)
              console.log(`🔍 DEBUG: Retry result - User exists: ${existingUser ? 'YES' : 'NO'}`)
            } catch (retryError) {
              console.error(`❌ DEBUG: Retry query also failed:`, {
                message: retryError.message,
                timestamp: new Date().toISOString()
              })
              throw retryError
            }
          } else {
            throw dbError
          }
        }

        if (existingUser) {
          // Update existing user
          console.log(`🔄 DEBUG: Updating existing user in database`)
          try {
            const updatedUser = await prisma.user.update({
              where: { clerkId: id },
              data: {
                email: email || existingUser.email,
                firstName: first_name || existingUser.firstName,
                lastName: last_name || existingUser.lastName,
                username: username || existingUser.username,
                avatar: image_url || existingUser.avatar,
              }
            })
            console.log('✅ DEBUG: User updated successfully!')
            console.log(`   - Database ID: ${updatedUser.id}`)
            console.log(`   - Clerk ID: ${updatedUser.clerkId}`)
            console.log(`   - Email: ${updatedUser.email}`)
            console.log(`   - Name: ${updatedUser.firstName} ${updatedUser.lastName}`)
            
            const verifyUser = await prisma.user.findUnique({
              where: { clerkId: id }
            })
            console.log(`✅ DEBUG: Verification query - User exists: ${verifyUser ? 'YES' : 'NO'}`)
            if (verifyUser) {
              console.log(`   - Verified Email: ${verifyUser.email}`)
              console.log(`   - Verified Status: ${verifyUser.accountStatus}`)
            }
          } catch (updateError) {
            if (updateError.message?.includes('timeout') || updateError.message?.includes('InternalError')) {
              console.log('⚠️ Retrying user update...')
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
              console.log('✅ User updated successfully after retry:', id)
            } else {
              throw updateError
            }
          }
        } else {
          // Create new user
          console.log(`➕ DEBUG: Creating new user in database`)
          console.log(`   - Data to be inserted:`)
          console.log(`     * Clerk ID: ${id}`)
          console.log(`     * Email: ${email}`)
          console.log(`     * First Name: ${first_name || null}`)
          console.log(`     * Last Name: ${last_name || null}`)
          console.log(`     * Username: ${username || null}`)
          console.log(`     * Avatar: ${image_url || null}`)
          console.log(`     * Account Status: learner`)
          
          try {
            const newUser = await prisma.user.create({
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
            console.log('✅ DEBUG: User created successfully!')
            console.log(`   - Database ID: ${newUser.id}`)
            console.log(`   - Clerk ID: ${newUser.clerkId}`)
            console.log(`   - Email: ${newUser.email}`)
            console.log(`   - Account Status: ${newUser.accountStatus}`)
            console.log(`   - Created At: ${newUser.createdAt}`)
            
            // Verify user was created by querying again
            const verifyUser = await prisma.user.findUnique({
              where: { clerkId: id }
            })
            console.log(`✅ DEBUG: Verification query after creation - User exists: ${verifyUser ? 'YES' : 'NO'}`)
            if (verifyUser) {
              console.log(`   - Verified Database ID: ${verifyUser.id}`)
              console.log(`   - Verified Email: ${verifyUser.email}`)
              console.log(`   - Verified Account Status: ${verifyUser.accountStatus}`)
            } else {
              console.error(`❌ DEBUG: CRITICAL - User was created but verification query failed!`)
            }
          } catch (createError) {
            if (createError.message?.includes('timeout') || createError.message?.includes('InternalError')) {
              console.log('⚠️ Retrying user creation...')
              await new Promise(resolve => setTimeout(resolve, 2000))
              const newUser = await prisma.user.create({
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
              console.log('✅ User created successfully after retry:', { id, userId: newUser.id, email })
            } else {
              throw createError
            }
          }
        }
    } catch (error) {
      console.error('❌ DEBUG: Error syncing user to database:', {
        error: error.message,
        stack: error.stack,
        userId: id,
        eventType,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      })
      // Return 200 to prevent Clerk from retrying on data errors, but log for monitoring
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
      console.log(`🗑️ DEBUG: Processing user.deleted event for Clerk ID: ${id}`)

      try {
        await prisma.user.delete({
          where: { clerkId: id }
        })
        console.log(`✅ DEBUG: User deleted successfully: ${id}`)
      } catch (error) {
        console.error('❌ DEBUG: Error deleting user from database:', error)
        return new Response('Error deleting user', { status: 500 })
      }
    }

    console.log(`✅ DEBUG: Webhook processing completed successfully for event: ${eventType}`)
    return new Response('', { status: 200 })
  } catch (error) {
    console.error('❌ DEBUG: Critical webhook error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
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
