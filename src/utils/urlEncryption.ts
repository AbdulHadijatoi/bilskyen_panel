/**
 * Simple URL parameter encryption/decryption utility
 * Uses base64url encoding with a simple XOR cipher for compact, URL-safe encryption
 */

const ENCRYPTION_KEY = 'berken-project-secret-key-2024'

/**
 * Simple XOR cipher for encryption
 */
function xorCipher(text: string, key: string): string {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}

/**
 * Encrypt a URL parameter value
 * Returns a short, URL-safe encrypted string
 */
export function encryptUrlParam(value: string): string {
  try {
    // Apply XOR cipher
    const encrypted = xorCipher(value, ENCRYPTION_KEY)
    // Encode to base64url (URL-safe base64)
    return btoa(encrypted)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  } catch (error) {
    console.error('Encryption error:', error)
    return value // Fallback to original value
  }
}

/**
 * Decrypt a URL parameter value
 */
export function decryptUrlParam(encrypted: string): string | null {
  try {
    // Decode from base64url
    let base64 = encrypted.replace(/-/g, '+').replace(/_/g, '/')
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '='
    }
    // Decode base64
    const decrypted = atob(base64)
    // Apply XOR cipher to decrypt
    return xorCipher(decrypted, ENCRYPTION_KEY)
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

/**
 * Encrypt query parameters in a URL
 */
export function encryptQueryParams(url: string): string {
  try {
    const urlObj = new URL(url, window.location.origin)
    const params = new URLSearchParams(urlObj.search)
    const encryptedParams = new URLSearchParams()

    for (const [key, value] of params.entries()) {
      encryptedParams.set(key, encryptUrlParam(value))
    }

    return `${urlObj.pathname}?${encryptedParams.toString()}${urlObj.hash}`
  } catch (error) {
    console.error('URL encryption error:', error)
    return url
  }
}

/**
 * Decrypt query parameters in a URL
 */
export function decryptQueryParams(url: string): string {
  try {
    const urlObj = new URL(url, window.location.origin)
    const params = new URLSearchParams(urlObj.search)
    const decryptedParams = new URLSearchParams()

    for (const [key, value] of params.entries()) {
      const decrypted = decryptUrlParam(value)
      if (decrypted) {
        decryptedParams.set(key, decrypted)
      } else {
        // If decryption fails, use original value (might be unencrypted)
        decryptedParams.set(key, value)
      }
    }

    return `${urlObj.pathname}?${decryptedParams.toString()}${urlObj.hash}`
  } catch (error) {
    console.error('URL decryption error:', error)
    return url
  }
}

