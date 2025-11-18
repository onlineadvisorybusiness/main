export const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: -5 },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: -6 },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: -8 },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)', offset: -7 },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: -9 },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', offset: -10 },
  { value: 'America/Toronto', label: 'Toronto (EST)', offset: -5 },
  { value: 'America/Vancouver', label: 'Vancouver (PST)', offset: -8 },
  { value: 'America/Mexico_City', label: 'Mexico City (CST)', offset: -6 },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: -3 },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)', offset: -3 },
  { value: 'America/Lima', label: 'Lima (PET)', offset: -5 },
  { value: 'Europe/London', label: 'London (GMT)', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris (CET)', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (CET)', offset: 1 },
  { value: 'Europe/Rome', label: 'Rome (CET)', offset: 1 },
  { value: 'Europe/Madrid', label: 'Madrid (CET)', offset: 1 },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET)', offset: 1 },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET)', offset: 1 },
  { value: 'Europe/Zurich', label: 'Zurich (CET)', offset: 1 },
  { value: 'Europe/Vienna', label: 'Vienna (CET)', offset: 1 },
  { value: 'Europe/Athens', label: 'Athens (EET)', offset: 2 },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)', offset: 3 },
  { value: 'Europe/Istanbul', label: 'Istanbul (TRT)', offset: 3 },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
  { value: 'Asia/Karachi', label: 'Karachi (PKT)', offset: 5 },
  { value: 'Asia/Kolkata', label: 'Kolkata (IST)', offset: 5.5 },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)', offset: 6 },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)', offset: 7 },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 8 },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)', offset: 8 },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)', offset: 8 },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
  { value: 'Asia/Seoul', label: 'Seoul (KST)', offset: 9 },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)', offset: 11 },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEDT)', offset: 11 },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)', offset: 10 },
  { value: 'Australia/Perth', label: 'Perth (AWST)', offset: 8 },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT)', offset: 13 },
  { value: 'Africa/Cairo', label: 'Cairo (EET)', offset: 2 },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)', offset: 2 },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)', offset: 1 },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)', offset: 3 },
  { value: 'Asia/Riyadh', label: 'Riyadh (AST)', offset: 3 },
  { value: 'Asia/Tehran', label: 'Tehran (IRST)', offset: 3.5 },
  { value: 'Asia/Jerusalem', label: 'Jerusalem (IST)', offset: 2 },
  { value: 'Asia/Kuwait', label: 'Kuwait (AST)', offset: 3 },
  { value: 'Asia/Qatar', label: 'Qatar (AST)', offset: 3 },
  { value: 'Asia/Manila', label: 'Manila (PHT)', offset: 8 },
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB)', offset: 7 },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh (ICT)', offset: 7 },
  { value: 'Asia/Taipei', label: 'Taipei (CST)', offset: 8 },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (MYT)', offset: 8 },
  { value: 'Asia/Colombo', label: 'Colombo (IST)', offset: 5.5 },
  { value: 'Asia/Kathmandu', label: 'Kathmandu (NPT)', offset: 5.75 },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 0 },
]

export function getCurrentTimeInTimezone(timezone) {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return formatter.format(now)
  } catch (error) {
    return '--:--'
  }
}

export function getTimezoneOffset(timezone) {
  try {
    const now = new Date()
    const utcTime = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
    const offset = (tzTime - utcTime) / (1000 * 60 * 60)
    return offset
  } catch (error) {
    return 0
  }
}

export function convertTime(timeString, fromTimezone, toTimezone, date = new Date()) {
  try {
    if (fromTimezone === toTimezone) {
      return timeString
    }
    
    const [hours, minutes] = timeString.split(':').map(Number)
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60) {
      console.error('❌ [DEBUG] Invalid time string:', timeString)
      return timeString
    }
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    // Get the offset difference between the two timezones for this specific date
    // This handles DST correctly
    const testDate = new Date(`${year}-${month}-${day}T12:00:00`)
    const fromOffset = getTimezoneOffsetAtDate(fromTimezone, testDate)
    const toOffset = getTimezoneOffsetAtDate(toTimezone, testDate)
    const offsetDiff = toOffset - fromOffset
    

    if (!convertTime._logCount) convertTime._logCount = 0
    if (convertTime._logCount < 10) {
      console.group(`🔄 [DEBUG] convertTime #${convertTime._logCount + 1}`)
      console.log('Input Time:', timeString)
      console.log('From Timezone:', fromTimezone, '(offset: ' + fromOffset.toFixed(2) + 'h)')
      console.log('To Timezone:', toTimezone, '(offset: ' + toOffset.toFixed(2) + 'h)')
      console.log('Date:', `${year}-${month}-${day}`)
      console.log('Offset Difference:', offsetDiff.toFixed(2) + ' hours')
      convertTime._logCount++
    }

    const totalMinutes = hours * 60 + minutes
    const adjustedMinutes = totalMinutes + (offsetDiff * 60)
    
    // Handle day boundaries and normalize
    let adjustedHours = Math.floor(adjustedMinutes / 60)
    let adjustedMins = adjustedMinutes % 60
    
    // Normalize minutes first
    if (adjustedMins < 0) {
      adjustedMins += 60
      adjustedHours -= 1
    } else if (adjustedMins >= 60) {
      adjustedMins -= 60
      adjustedHours += 1
    }
    
    // Normalize hours to 0-23 range
    while (adjustedHours < 0) {
      adjustedHours += 24
    }
    while (adjustedHours >= 24) {
      adjustedHours -= 24
    }
    
    const result = `${String(adjustedHours).padStart(2, '0')}:${String(adjustedMins).padStart(2, '0')}`
    
    if (!convertTime._resultLogCount) convertTime._resultLogCount = 0
    if (convertTime._resultLogCount < 10) {
      console.log('Calculation:', `${timeString} (${totalMinutes} min) + ${(offsetDiff * 60).toFixed(0)} min = ${adjustedMinutes.toFixed(0)} min`)
      console.log('Result:', result, `(${adjustedHours}h ${adjustedMins}m)`)
      console.groupEnd()
      convertTime._resultLogCount++
    }
    // ===================================
    
    return result
  } catch (error) {
    console.error('❌ [DEBUG] Error converting time:', error, { timeString, fromTimezone, toTimezone })
    return timeString
  }
}

// Get timezone offset at a specific date (handles DST)
function getTimezoneOffsetAtDate(timezone, date) {
  try {
    const utcDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12, 0, 0, 0
    ))
    
    // Get the same moment formatted in the target timezone
    const tzFormatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    
    const tzParts = tzFormatter.formatToParts(utcDate)
    const tzHour = parseInt(tzParts.find(p => p.type === 'hour').value)
    const tzMinute = parseInt(tzParts.find(p => p.type === 'minute').value)
    
    const utcMinutes = 12 * 60 // UTC time in minutes (noon)
    const tzMinutes = tzHour * 60 + tzMinute // Timezone time in minutes
    const offsetMinutes = tzMinutes - utcMinutes
    const offsetHours = offsetMinutes / 60
    
    if (!getTimezoneOffsetAtDate._logCount) getTimezoneOffsetAtDate._logCount = 0
    if (getTimezoneOffsetAtDate._logCount < 10) {
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      const tzTimeStr = `${String(tzHour).padStart(2, '0')}:${String(tzMinute).padStart(2, '0')}`
      console.log(`🌍 Offset for ${timezone} on ${dateStr}: UTC 12:00 = ${tzTimeStr} (offset: ${offsetHours.toFixed(2)}h)`)
      getTimezoneOffsetAtDate._logCount++
    }
    // ===================================
    
    return offsetHours
  } catch (error) {
    console.error('❌ [DEBUG] Error getting timezone offset:', error, { timezone })
    return 0
  }
}

export function formatTimezoneLabel(timezone, showTime = true) {
  const tz = timezones.find(t => t.value === timezone)
  if (!tz) return timezone
  
  if (showTime) {
    const currentTime = getCurrentTimeInTimezone(timezone)
    return `${tz.label} (${currentTime})`
  }
  return tz.label
}

export const sortedTimezones = [...timezones].sort((a, b) => {
  const offsetA = getTimezoneOffset(a.value)
  const offsetB = getTimezoneOffset(b.value)
  return offsetA - offsetB
})

