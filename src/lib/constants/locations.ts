/**
 * Official MNIT Marketplace Safe-Handover Zones
 * These locations are selected for their high visibility, security presence, 
 * and accessibility for students. 
 */
export const CAMPUS_SAFE_ZONES = [
  { id: 'vltc_front', name: 'VLTC FrontPorch', area: 'Academic' },
  { id: 'vltc_back', name: 'VLTC BackPorch', area: 'Academic' },
  { id: 'canteen_main', name: 'Central Canteen', area: 'Central' },
  { id: 'hostel_g_gate', name: 'Girls Hostel Main Gate', area: 'Hostels' },
  { id: 'library_entrance', name: 'Central Library Entrance', area: 'Academic' },
  { id: 'sport_complex', name: 'Sports Complex Entrance', area: 'Athletics' },
  { id: 'cc_entrance', name: 'Computer Center Entrance', area: 'Academic' },
  { id: 'dispensary', name: 'MNIT Dispensary Area', area: 'Healthcare' },
] as const;

export type SafeZoneId = typeof CAMPUS_SAFE_ZONES[number]['id'];

/**
 * Validates if the current server time is within the mandated 7:00 AM - 9:00 PM safety window.
 * Uses IST (UTC+5:30) as the reference.
 */
export function isWithinSafetyWindow(): boolean {
  // Get current time in IST
  const now = new Date();
  const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit' } as const;
  const hour = parseInt(new Intl.DateTimeFormat('en-US', options).format(now));

  // Mandated window: 7 AM (07) to 9 PM (21)
  return hour >= 7 && hour < 21;
}
