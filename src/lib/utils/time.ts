import { DELIVERY_WINDOW_START, DELIVERY_WINDOW_END } from '../constants/delivery';

/**
 * Checks if the current time is within the institutional P2P delivery window (IST).
 * Standard Operating Hours: 07:00 AM - 09:00 PM IST.
 */
export function isDeliveryWindowOpen(): boolean {
  try {
    const now = new Date();
    
    // Get current hour in IST (Asia/Kolkata)
    const istTimeString = now.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false
    });
    
    const istHour = parseInt(istTimeString, 10);
    
    // Check if hour is between START (inclusive) and END (exclusive)
    // 7:00:00 to 20:59:59 is considered within window
    // 21:00:00 is precisely when the window closes.
    return istHour >= DELIVERY_WINDOW_START && istHour < DELIVERY_WINDOW_END;
  } catch (error) {
    console.error('[TimeUtil] Failed to calculate IST hour:', error);
    // Safer to return false if time cannot be verified (institutional safety)
    return false;
  }
}

/**
 * Returns a human-readable countdown or status message for the delivery window.
 */
export function getDeliveryStatusMessage(): string {
  const isOpen = isDeliveryWindowOpen();
  if (isOpen) return "Safe P2P Delivery Window Active";
  return "P2P Delivery Window Closed (7 AM - 9 PM)";
}
