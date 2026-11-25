import CryptoJS from 'crypto-js'

const SECRET_KEY = import.meta.env.VITE_API_SECRET_KEY || ''

/**
 * Decrypts an AES-256-CBC encrypted payload received from backend.
 * Payload structure: base64( 16_bytes_IV + Ciphertext )
 * Gracefully returns original data if it's already an unencrypted object.
 */
export function decryptPayload(data) {
    if (!data) return data

    if (!SECRET_KEY) {
        console.error('VITE_API_SECRET_KEY is not configured in .env')
        return data
    }

    // If response is wrapped in { payload: "..." }
    const encoded = typeof data === 'object' && data.payload ? data.payload : data

    if (typeof encoded !== 'string') {
        return data
    }

    try {
        const key = CryptoJS.SHA256(SECRET_KEY)
        const raw = CryptoJS.enc.Base64.parse(encoded)

        // Must have at least 16 bytes IV + at least 1 block (16 bytes)
        if (raw.sigBytes < 17) {
            return data
        }

        // Extract 16 bytes IV (first 4 32-bit words)
        const ivWords = raw.words.slice(0, 4)
        const iv = CryptoJS.lib.WordArray.create(ivWords, 16)

        // Extract ciphertext (remaining words)
        const cipherWords = raw.words.slice(4)
        const cipherSigBytes = raw.sigBytes - 16
        const ciphertext = CryptoJS.lib.WordArray.create(cipherWords, cipherSigBytes)

        const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, key, { iv: iv })
        const jsonStr = decrypted.toString(CryptoJS.enc.Utf8)

        if (!jsonStr) {
            return data
        }

        try {
            return JSON.parse(jsonStr)
        } catch {
            return jsonStr
        }
    } catch (e) {
        console.warn('Payload decryption failed:', e)
        return data
    }
}

/**
 * Encrypts data into AES-256-CBC base64 payload.
 */
export function encryptPayload(data) {
    if (!SECRET_KEY) {
        console.error('VITE_API_SECRET_KEY is not configured in .env')
        return null
    }

    try {
        const key = CryptoJS.SHA256(SECRET_KEY)
        const iv = CryptoJS.lib.WordArray.random(16)
        const text = typeof data === 'object' ? JSON.stringify(data) : String(data)

        const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv })
        const combined = iv.clone().concat(encrypted.ciphertext)
        return CryptoJS.enc.Base64.stringify(combined)
    } catch (e) {
        console.error('Payload encryption failed:', e)
        return null
    }
}
