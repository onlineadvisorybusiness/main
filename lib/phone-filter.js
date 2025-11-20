const PHONE_PATTERNS = [
  // International format: +1-234-567-8900, +12345678900, +1 234 567 8900
  /\+\d{1,4}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,9}/g,
  
  // US format: (123) 456-7890, 123-456-7890, 123.456.7890
  /\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}/g,
  
  // 10-15 digit numbers (common phone number lengths)
  /\b\d{10,15}\b/g,
  
  // With spaces: 123 456 7890, 1 234 567 8900
  /\b\d{1,2}[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{4,10}\b/g,
  
  // Written numbers (one two three...)
  /\b(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)\b/gi,
  
  // Common phone number keywords with numbers
  /(?:phone|mobile|cell|call|text|whatsapp|telegram)[\s:]*[\+\-]?\d{1,4}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,9}/gi,
  
  // Pattern: "my number is", "contact me at", etc.
  /(?:my|contact|reach|call|text|message|whatsapp|telegram)[\s]+(?:me|us)[\s]+(?:at|on|via)[\s:]*[\+\-]?\d{1,4}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,4}[\s\-]?\d{1,9}/gi,
]

const DISGUISED_PATTERNS = [
  // Numbers separated by words: "one two three four five six seven eight nine zero"
  /\b(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)[\s\-]*(?:one|two|three|four|five|six|seven|eight|nine|zero|oh)\b/gi,
  
  // Numbers with text separators: "123abc456def7890"
  /\b\d{3}[a-z]{1,3}\d{3}[a-z]{1,3}\d{4,10}\b/gi,
]


function isValidPhoneNumber(match) {
  const cleaned = match.replace(/[\s\-\(\)\.\+]/g, '')
  
  // Too short or too long
  if (cleaned.length < 10 || cleaned.length > 15) {
    return false
  }
  
  // Common false positives to exclude
  const falsePositives = [
    /^\d{4}$/, // Years (2024, 1990, etc.)
    /^0+$/, // All zeros
    /^1+$/, // All ones
    /^\d{6,8}$/, // Dates (123456, 12345678)
  ]
  
  for (const pattern of falsePositives) {
    if (pattern.test(cleaned)) {
      return false
    }
  }
  
  // Check if it's a valid phone number format
  // Should have at least 10 digits
  const digitCount = cleaned.replace(/\D/g, '').length
  return digitCount >= 10 && digitCount <= 15
}

/**
 * Removes phone numbers from text and replaces them with a placeholder
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text with phone numbers removed
 */
export function removePhoneNumbers(text) {
  if (!text || typeof text !== 'string') {
    return text
  }
  
  let sanitized = text
  const replacements = []
  
  // Apply all phone number patterns
  for (const pattern of PHONE_PATTERNS) {
    sanitized = sanitized.replace(pattern, (match) => {
      // Clean the match and validate
      const cleaned = match.replace(/[\s\-\(\)\.\+]/g, '')
      
      if (isValidPhoneNumber(match)) {
        replacements.push(match)
        return '[Phone number removed for security]'
      }
      
      return match
    })
  }
  
  // Apply disguised patterns
  for (const pattern of DISGUISED_PATTERNS) {
    sanitized = sanitized.replace(pattern, () => {
      return '[Phone number removed for security]'
    })
  }
  
  // Additional check: look for sequences of 10+ digits anywhere
  sanitized = sanitized.replace(/\b\d{10,15}\b/g, (match) => {
    if (isValidPhoneNumber(match)) {
      return '[Phone number removed for security]'
    }
    return match
  })
  
  return sanitized
}

/**
 * Checks if text contains phone numbers without removing them
 * @param {string} text - The text to check
 * @returns {boolean} - True if phone numbers are detected
 */
export function containsPhoneNumber(text) {
  if (!text || typeof text !== 'string') {
    return false
  }
  
  for (const pattern of PHONE_PATTERNS) {
    const matches = text.match(pattern)
    if (matches && matches.some(match => isValidPhoneNumber(match))) {
      return true
    }
  }
  
  return false
}

/**
 * Sanitizes message content before saving
 * This is the main function to use when processing messages
 * @param {string} content - Message content to sanitize
 * @returns {string} - Sanitized content
 */
export function sanitizeMessageContent(content) {
  if (!content || typeof content !== 'string') {
    return content
  }
  
  return removePhoneNumbers(content)
}

