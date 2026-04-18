import Link from "next/link";
import { ArrowLeft, Eye, Database, Lock, Share2, UserX, Bell, RefreshCw, Mail } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | MNIT Marketplace",
  description: "Learn how MNIT Marketplace collects, uses, and protects your personal data.",
};

const sections = [
  {
    id: "data-collected",
    icon: Database,
    number: "01",
    title: "Data We Collect",
    content: [
      {
        heading: "Account Information",
        body: "When you register, we collect your full name, your @mnit.ac.in institutional email address, and a securely hashed version of your password (we never store your password in plain text). This information is necessary to operate a verified, campus-exclusive marketplace.",
      },
      {
        heading: "Profile Information",
        body: "You may optionally provide additional profile details such as your hostel/residential address on campus, phone number, and UPI ID. Your phone number and UPI ID are used solely for payout purposes and are never shared publicly.",
      },
      {
        heading: "Listing Data",
        body: "When you list an item, we collect the item title, description, price, category, pickup address, publicly displayed gallery images, and a private live verification photo taken at the moment of listing. The live verification photo is stored securely and is accessible only to employee moderators.",
      },
      {
        heading: "Transaction Data",
        body: "We record payment transactions including the Razorpay order ID, payment ID, amount, and timestamp. We do not store your full bank account details, UPI PIN, or card numbers — these are handled exclusively by Razorpay's PCI-DSS compliant infrastructure.",
      },
      {
        heading: "Usage Data",
        body: "We collect anonymized analytics data via Google Analytics (page views, session duration, device type, geographic region at the city level). This data contains no personally identifiable information and is used solely to improve the platform.",
      },
    ],
  },
  {
    id: "how-we-use",
    icon: Eye,
    number: "02",
    title: "How We Use Your Data",
    content: [
      {
        heading: "To Operate the Marketplace",
        body: "Your account information is used to authenticate you, enforce the @mnit.ac.in eligibility requirement, display your profile within the platform, and associate your listings with your identity.",
      },
      {
        heading: "For Payment Processing",
        body: "Your UPI ID or bank details (provided during onboarding) are transmitted to Razorpay X to facilitate automatic seller payouts once a buyer confirms receipt. We do not process payment information ourselves.",
      },
      {
        heading: "For Moderation & Safety",
        body: "Your private live verification photo is used exclusively by our employee moderation team to verify that the item in your public listing exists and is genuinely in your possession. It is never shown to buyers or other users.",
      },
      {
        heading: "For Platform Communications",
        body: "We use your email address to send transactional messages including email verification on signup, notifications about your listings being approved or rejected, and critical account security alerts. We do not send marketing emails.",
      },
      {
        heading: "For Enforcement",
        body: "In cases of suspected fraud, ban evasion, or Terms & Conditions violations, your account data (email, device fingerprint, transaction history) may be reviewed by MNIT Marketplace administrators and, where required, shared with MNIT institute authorities.",
      },
    ],
  },
  {
    id: "data-storage",
    icon: Lock,
    number: "03",
    title: "Data Storage & Security",
    content: [
      {
        heading: "Infrastructure",
        body: "All user data is stored on Supabase (PostgreSQL), a secure cloud database platform. Data is encrypted at rest using AES-256 and in transit using TLS 1.3. Authentication tokens are short-lived and refreshed automatically.",
      },
      {
        heading: "Media Storage",
        body: "Listing images (both public gallery images and private verification photos) are stored in Supabase Storage, a secure object storage system. Public images are served via a CDN. Private verification images are stored in a restricted bucket with no public read access.",
      },
      {
        heading: "Retention Period",
        body: "Active account data is retained for the lifetime of your account. If you request account deletion, your personal data will be permanently removed within 30 days of the request. Anonymized transaction records may be retained for up to 1 year for audit purposes.",
      },
      {
        heading: "Access Controls",
        body: "Access to user data is strictly controlled. Regular users can only see their own private data. Employee moderators can view private verification photos only for listings under review. Platform administrators have elevated access for dispute resolution and enforcement.",
      },
    ],
  },
  {
    id: "third-parties",
    icon: Share2,
    number: "04",
    title: "Third-Party Services",
    content: [
      {
        heading: "Supabase",
        body: "Supabase powers our authentication (email/password login, email confirmation), our database (all user, listing, and transaction records), and our file storage. Supabase processes data under its own Privacy Policy and is GDPR-compliant.",
      },
      {
        heading: "Razorpay",
        body: "Razorpay processes all payment transactions and seller payouts. When you make a purchase, your payment details are entered directly into Razorpay's secure payment modal and are never transmitted to or stored on MNIT Marketplace servers. Razorpay is PCI-DSS Level 1 certified.",
      },
      {
        heading: "Google Analytics",
        body: "We use Google Analytics to collect anonymized, aggregated usage statistics. Google Analytics uses cookies to track session data. No personally identifiable data (name, email, user ID) is sent to Google. You can opt out of Google Analytics tracking via browser extensions.",
      },
      {
        heading: "No Data Sales",
        body: "MNIT Marketplace does not sell, rent, or trade your personal data to any third party for marketing or advertising purposes. Your data is used exclusively to operate the platform as described in this policy.",
      },
    ],
  },
  {
    id: "user-rights",
    icon: UserX,
    number: "05",
    title: "Your Rights",
    content: [
      {
        heading: "Right to Access",
        body: "You have the right to request a copy of all personal data we hold about you. To make such a request, email the admin team at admin@mnit.ac.in with the subject 'Data Access Request'. We will respond within 14 days.",
      },
      {
        heading: "Right to Correction",
        body: "If any of your personal information is inaccurate or outdated, you can update most of it directly from your Profile page. For corrections that cannot be made self-service, contact the admin team.",
      },
      {
        heading: "Right to Deletion",
        body: "You may request permanent deletion of your account and associated data by emailing admin@mnit.ac.in with the subject 'Account Deletion Request'. We will complete the deletion within 30 days. Note: if you have active pending transactions, deletion may be delayed until those are resolved.",
      },
      {
        heading: "Right to Object",
        body: "You may object to certain processing of your data, such as analytics tracking. Disabling Google Analytics cookies in your browser is sufficient to opt out of usage tracking on our platform.",
      },
    ],
  },
  {
    id: "cookies",
    icon: Bell,
    number: "06",
    title: "Cookies",
    content: [
      {
        heading: "Authentication Cookies",
        body: "We use cookies set by Supabase to maintain your login session. These are strictly necessary for the platform to function and cannot be disabled while you are logged in. They contain an encrypted session token with no personally identifiable information embedded.",
      },
      {
        heading: "Analytics Cookies",
        body: "Google Analytics sets cookies (_ga, _gid) to distinguish unique visitors and track sessions. These are non-essential cookies. You can block them using browser settings or a browser extension without affecting platform functionality.",
      },
      {
        heading: "No Advertising Cookies",
        body: "MNIT Marketplace does not use any advertising or tracking cookies from ad networks. You will not be retargeted on other websites based on your activity on our platform.",
      },
    ],
  },
  {
    id: "updates",
    icon: RefreshCw,
    number: "07",
    title: "Policy Updates",
    content: [
      {
        heading: "Notification of Changes",
        body: "If we make material changes to this Privacy Policy, we will notify registered users by email at their @mnit.ac.in address at least 7 days before the changes take effect. The updated policy will also be accessible at this URL.",
      },
      {
        heading: "Continued Use",
        body: "Your continued use of MNIT Marketplace after a Privacy Policy update constitutes your acceptance of the revised policy. If you do not accept the changes, you should stop using the platform and request account deletion.",
      },
    ],
  },
  {
    id: "contact",
    icon: Mail,
    number: "08",
    title: "Contact & Questions",
    content: [
      {
        heading: "Data Controller",
        body: "MNIT Marketplace is operated by students of Malaviya National Institute of Technology, Jaipur. For any privacy-related queries, data deletion requests, or concerns, please contact the platform administration team.",
      },
      {
        heading: "Contact Details",
        body: "Email: mnitmarketplace@gmail.com · Subject: Privacy Query\nAddress: MNIT Jaipur, JLN Marg, Jaipur, Rajasthan 302017\nWe aim to respond to all privacy-related queries within 5 business days.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="w-full max-w-7xl mx-auto px-6 pt-32 pb-16 bento-border-b">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-foreground/50 hover:text-primary-600 transition-colors mb-10">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-primary-600 rounded-full" />
              <span className="mono-subtitle">Legal Document</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-8xl display-title uppercase leading-none wrap-break-word hyphens-auto">
              Privacy<br />
              <span className="text-primary-600">Policy.</span>
            </h1>
          </div>
          <div className="md:pb-2 max-w-sm">
            <p className="text-foreground/70 font-sans leading-relaxed">
              We take your privacy seriously. This policy explains exactly what data we collect, why we collect it, and how it is protected.
            </p>
            <p className="mono-subtitle mt-4">Last updated: April 2026</p>
          </div>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="w-full max-w-7xl mx-auto px-6 py-10 bento-border-b">
        <p className="mono-subtitle mb-5">Jump to section</p>
        <div className="flex flex-wrap gap-3">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest bento-border hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all"
            >
              {s.number} · {s.title}
            </a>
          ))}
        </div>
      </section>

      {/* Sections */}
      <div className="w-full max-w-7xl mx-auto px-6 pb-24">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section
              key={section.id}
              id={section.id}
              className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0 bento-border-b py-16 scroll-mt-24"
            >
              {/* Sidebar */}
              <div className="md:pr-12 mb-8 md:mb-0">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-6xl font-black text-foreground/10 display-title">{section.number}</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary-50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <h2 className="text-xl display-title uppercase">{section.title}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-8 md:pl-12 md:border-l md:border-black/5">
                {section.content.map((item) => (
                  <div key={item.heading}>
                    <h3 className="font-bold text-foreground text-base mb-2 flex items-start gap-2">
                      <span className="w-1 h-4 bg-primary-600 mt-1 shrink-0 block" />
                      {item.heading}
                    </h3>
                    <p className="text-foreground/70 leading-relaxed font-sans text-sm pl-3 whitespace-pre-line">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom banner */}
      <section className="w-full bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl display-title uppercase mb-3">Questions about your data?</h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-lg">
              Reach out to us at{" "}
              <a href="mailto:admin@mnit.ac.in" className="text-primary-400 hover:text-primary-300 transition-colors font-bold">
                admin@mnit.ac.in
              </a>{" "}
              and we will respond within 5 business days.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-0 w-full md:w-auto shrink-0">
            <Link
              href="/terms"
              className="w-full sm:w-auto text-center px-8 py-4 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <Link
              href="/market"
              className="w-full sm:w-auto text-center px-8 py-4 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors"
            >
              Browse Market
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
