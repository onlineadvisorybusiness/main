import { google } from 'googleapis'

// Initialize Google OAuth2 client
export const getGoogleAuth = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback'
  
  // Validate environment variables
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is missing. Please check your .env file.')
  }
  
  if (!clientSecret) {
    throw new Error('GOOGLE_CLIENT_SECRET environment variable is missing. Please check your .env file.')
  }
  
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL environment variable is missing. Please check your .env file.')
  }
  
  // Validate client ID format (should start with a number and contain hyphens)
  if (!clientId.match(/^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/)) {
    // Client ID format may be incorrect
  }
  
  // Validate client secret format (should start with GOCSPX-)
  if (!clientSecret.startsWith('GOCSPX-')) {
    // Client Secret format may be incorrect
  }
  
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export const getGoogleCalendar = (auth) => {
  return google.calendar({ version: 'v3', auth })
}

export const getGoogleAuthUrl = () => {
  const auth = getGoogleAuth()
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'openid',
    'email', 
    'profile'
  ]
  
  return auth.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    include_granted_scopes: true,
    state: 'google_calendar_connect' // Add state parameter for security
  })
}

export const getGoogleTokens = async (code) => {
  try {
    if (!code) {
      throw new Error('Authorization code is required')
    }
    
    const auth = getGoogleAuth()
    const { tokens } = await auth.getToken(code)
    auth.setCredentials(tokens)
    return tokens
  } catch (error) {
    // Provide more specific error messages
    if (error.message === 'invalid_client') {
      throw new Error('Invalid Google OAuth client credentials. Please check your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file and ensure they match your Google Cloud Console configuration.')
    } else if (error.message === 'invalid_grant') {
      throw new Error('Invalid authorization code. The code may have expired or been used already.')
    } else if (error.message === 'redirect_uri_mismatch') {
      throw new Error('Redirect URI mismatch. Please ensure your redirect URI in Google Cloud Console matches: ' + (process.env.NEXT_PUBLIC_APP_URL + '/api/auth/google/callback'))
    }
    
    throw error
  }
}
