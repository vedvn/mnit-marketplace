import { sendEmail } from './resend';
import WelcomeEmail from './emails/WelcomeEmail';
import AccountBannedEmail from './emails/AccountBannedEmail';
import AccountUnbannedEmail from './emails/AccountUnbannedEmail';
import ListingDeletedEmail from './emails/ListingDeletedEmail';
import ListingApprovedEmail from './emails/ListingApprovedEmail';
import ListingRejectedEmail from './emails/ListingRejectedEmail';
import ItemSoldEmail from './emails/ItemSoldEmail';
import PayoutCompletedEmail from './emails/PayoutCompletedEmail';

/**
 * Direct Service Calls for Platform Emails
 * We call these directly from Server Actions and Middleware to avoid
 * the brittleness of internal HTTP fetch calls in Next.js.
 */

export async function triggerWelcomeEmail(email: string, name: string) {
  console.log(`[EmailService] Triggering Welcome Email to ${email}`);
  return sendEmail({
    to: email,
    subject: 'Welcome to MNIT Marketplace!',
    react: WelcomeEmail({ name }),
  });
}

export async function triggerAccountBannedEmail(email: string, name: string, reason: string, until: string | null) {
  console.log(`[EmailService] Triggering Ban Email to ${email}`);
  return sendEmail({
    to: email,
    subject: 'Important notice regarding your account access',
    react: AccountBannedEmail({ name, reason, until }),
  });
}

export async function triggerAccountUnbannedEmail(email: string, name: string) {
  console.log(`[EmailService] Triggering Unban Email to ${email}`);
  return sendEmail({
    to: email,
    subject: 'Account Access Restored - Welcome back!',
    react: AccountUnbannedEmail({ name }),
  });
}

export async function triggerListingDeletedEmail(email: string, name: string, itemTitle: string, reason?: string) {
  console.log(`[EmailService] Triggering Listing Deleted Email to ${email} for "${itemTitle}"`);
  return sendEmail({
    to: email,
    subject: `Notice: Your listing "${itemTitle}" has been removed`,
    react: ListingDeletedEmail({ name, itemTitle, reason }),
  });
}

export async function triggerListingApprovedEmail(email: string, name: string, productTitle: string, productId: string) {
  console.log(`[EmailService] Triggering Listing Approved Email to ${email} for "${productTitle}"`);
  return sendEmail({
    to: email,
    subject: `Success: Your listing "${productTitle}" is now live!`,
    react: ListingApprovedEmail({ name, productTitle, productId }),
  });
}

export async function triggerListingRejectedEmail(email: string, name: string, productTitle: string, reason: string) {
  console.log(`[EmailService] Triggering Listing Rejected Email to ${email} for "${productTitle}"`);
  return sendEmail({
    to: email,
    subject: `Update: Your listing "${productTitle}" requires changes`,
    react: ListingRejectedEmail({ name, productTitle, reason }),
  });
}

export async function triggerItemSoldEmail(
  email: string, 
  sellerName: string, 
  productTitle: string, 
  amount: number, 
  platformFee: number,
  payout: number,
  buyerName: string,
  buyerPhone: string,
  buyerEmail: string
) {
  console.log(`[EmailService] Triggering Item Sold Email to ${email} for "${productTitle}"`);
  return sendEmail({
    to: email,
    subject: `CHA-CHING! You just sold your "${productTitle}"!`,
    react: ItemSoldEmail({ 
      sellerName, 
      buyerName, 
      buyerPhone, 
      buyerEmail, 
      productTitle, 
      amount, 
      platformFee, 
      payout 
    }),
  });
}

export async function triggerPayoutCompletedEmail(email: string, sellerName: string, productTitle: string, amount: number) {
  console.log(`[EmailService] Triggering Payout Completed Email to ${email} for "${productTitle}"`);
  return sendEmail({
    to: email,
    subject: `Payment Sent: ₹${amount} has been processed`,
    react: PayoutCompletedEmail({ sellerName, productTitle, amount }),
  });
}
