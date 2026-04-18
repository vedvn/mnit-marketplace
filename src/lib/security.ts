/**
 * Basic security utility to sanitize user-provided text.
 * Prevents common Stored XSS attacks by escaping HTML tags.
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates that a string doesn't contain suspicious script patterns.
 */
export function isSafeInput(text: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(text));
}
