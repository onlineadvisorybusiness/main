import jwt from 'jsonwebtoken'

const getZoomToken = () => {
  if (!process.env.ZOOM_API_KEY || !process.env.ZOOM_API_SECRET) {
    throw new Error('Zoom API credentials not configured')
  }
  
  const payload = {
    iss: process.env.ZOOM_API_KEY,
    exp: Math.floor(Date.now() / 1000) + 3600 
  }
  
  return jwt.sign(payload, process.env.ZOOM_API_SECRET)
}

const zoomApiRequest = async (endpoint, options = {}) => {
  const token = getZoomToken()
  const url = `https://api.zoom.us/v2${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Zoom API request failed' }))
    throw new Error(error.message || `Zoom API error: ${response.status}`)
  }
  
  return response.json()
}

export const createZoomMeeting = async (meetingData) => {
  const body = {
    topic: meetingData.topic || 'Advisory Meeting',
    type: 2,
    start_time: meetingData.startTime,
    duration: meetingData.duration || 60,
    timezone: meetingData.timezone || 'UTC',
    agenda: meetingData.agenda || '',
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: true,
      watermark: false,
      use_pmi: false,
      approval_type: 0,
      audio: 'both',
      auto_recording: 'none',
      enforce_login: false,
      enforce_login_domains: '',
      alternative_hosts: '',
      close_registration: false,
      show_share_button: true,
      allow_multiple_devices: true,
      registrants_confirmation_email: true,
      waiting_room: false,
      request_permission_to_unmute_participants: false,
      global_dial_in_countries: ['US'],
      global_dial_in_numbers: [
        {
          country_name: 'US',
          number: '+1 646 558 8656',
          type: 'toll'
        }
      ]
    }
  }
  
  return zoomApiRequest('/users/me/meetings', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export const getZoomMeeting = async (meetingId) => {
  return zoomApiRequest(`/meetings/${meetingId}`)
}

export const updateZoomMeeting = async (meetingId, updateData) => {
  return zoomApiRequest(`/meetings/${meetingId}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  })
}

export const deleteZoomMeeting = async (meetingId) => {
  await zoomApiRequest(`/meetings/${meetingId}`, {
    method: 'DELETE'
  })
  return { success: true }
}

export const listZoomMeetings = async (userId = 'me') => {
  const response = await zoomApiRequest(`/users/${userId}/meetings`)
  return response.meetings || []
}
