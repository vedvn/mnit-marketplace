import crypto from 'crypto';

/**
 * Basic AES-256-GCM Encryption Utility
 * Used for encrypting sensitive fields in the database like dispute reasons.
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getSecretKey() {
  const secret = process.env.DISPUTE_SECRET_KEY;
  if (!secret) {
    throw new Error('DISPUTE_SECRET_KEY environment variable is not set');
  }
  // Ensure the key is exactly 32 bytes for AES-256
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Encrypts a string into a format: iv:authTag:encryptedContent
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getSecretKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv) as crypto.CipherGCM;

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypts a string from the format: iv:authTag:encryptedContent
 */
export function decrypt(encryptedText: string): string {
  try {
    const [ivHex, authTagHex, encryptedContent] = encryptedText.split(':');
    if (!ivHex || !authTagHex || !encryptedContent) {
      throw new Error('Invalid encrypted text format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getSecretKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv) as crypto.DecipherGCM;
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Error Decrypting Content]';
  }
}
