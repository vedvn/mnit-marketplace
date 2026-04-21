/**
 * blacklist.ts
 * 
 * Spam & scam keyword blacklist for listing title/description screening.
 * If a listing contains any of these terms, it's flagged for human review
 * (PENDING_REVIEW) — never auto-rejected.
 * 
 * Add more terms freely. All checks are case-insensitive.
 */

export const BLACKLISTED_KEYWORDS: string[] = [
  // Obvious scam/fraud signals
  'scam',
  'fake',
  'duplicate',
  'replica',
  'counterfeit',
  'stolen',
  'illegal',
  'pirated',

  // Payment manipulation
  'upi',
  'paytm',
  'gpay',
  'phonepe',
  'pay first',
  'advance payment',
  'deposit first',
  'pay outside',
  'pay separately',

  // Off-platform contact pressure
  'whatsapp me',
  'call me',
  'dm me',
  'direct message',
  'contact separately',
  'outside marketplace',

  // Prohibited item categories
  'alcohol',
  'beer',
  'wine',
  'cigarette',
  'tobacco',
  'drugs',
  'weed',
  'narcotics',
  'knife',
  'weapon',
  'gun',
  'firearm',
  'blade',

  // Adult content
  'adult',
  'porn',
  'xxx',

  // Generic spam signals
  'guaranteed',
  'no questions asked',
  '100% original',
  'exclusive deal',
  'limited time only',
  'act now',
  'urgent sale',
];

/**
 * Checks if a given text contains any blacklisted keywords.
 * @returns The matched keyword or null if clean.
 */
export function findBlacklistedKeyword(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const keyword of BLACKLISTED_KEYWORDS) {
    if (normalized.includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  return null;
}
