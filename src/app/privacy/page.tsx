import Link from "next/link";
import { ArrowLeft, Eye, Database, Lock, Share2, UserX, Bell, RefreshCw, Mail as MailIcon, ShieldCheck, Cookie, UserSquare2, Fingerprint } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | MNIT Marketplace",
  description: "Learn how MNIT Marketplace collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  const sections = [
    {
      id: "data-collected",
      icon: Database,
      number: "01",
      title: "Data We Collect",
      content: [
        {
          heading: "Personal Identification Data",
          body: "We collect your full legal name and your official @mnit.ac.in institutional email address. This data is mandatory for the verification of your status as a current member of the MNIT community and to maintain a secure, campus-exclusive environment.",
        },
        {
          heading: "Voluntary Profile Information",
          body: "Users may optionally provide additional details such as hostel residential address, phone number, and UPI ID. Phone numbers and UPI IDs are utilized solely for facilitating secure transaction payouts and platform-critical communications. This data remains private and is never displayed to other users.",
        },
        {
          heading: "Marketplace Listing Data",
          body: "When listing an item, we collect the product title, multi-angle gallery images, detailed descriptions, and a private 'Live Verification Photo'. We also log the pickup location chosen from our specified on-campus handover points.",
        },
        {
          heading: "Transaction & Payment History",
          body: "We record transaction metadata including Razorpay Order IDs, Payment IDs, transaction timestamps, and amounts. We do *not* store raw financial credentials such as card numbers or UPI PINs; these are processed exclusively by Razorpay's PCI-DSS compliant infrastructure.",
        },
      ],
    },
    {
      id: "how-we-use",
      icon: Eye,
      number: "02",
      title: "Usage of Personal Data",
      content: [
        {
          heading: "Marketplace Facilitation",
          body: "Your data is used primarily to authenticate your identity, manage your listings, and facilitate the connection between buyers and sellers. We use your email to send critical transaction updates and security alerts.",
        },
        {
          heading: "Platform Moderation & Safety",
          body: "The 'Live Verification Photo' and your device fingerprint are used by our employee moderation team to prevent fraud and ensure that all items listed are in the physical possession of the seller.",
        },
        {
          heading: "Automated Payout Processing",
          body: "Your provided payout details are shared with Razorpay X to enable automated fund transfers once a buyer confirms a successful handover. We do not manually handle or store your bank credentials beyond what is necessary for this API interaction.",
        },
      ],
    },
    {
      id: "data-storage",
      icon: Lock,
      number: "03",
      title: "Security & Encryption Standards",
      content: [
        {
          heading: "Encryption at Rest and in Transit",
          body: "All personal and transactional data is stored on Supabase (PostgreSQL) and is encrypted at rest using AES-256. All communication between your browser and our platform is encrypted via TLS 1.3/SSL, ensuring your data cannot be intercepted.",
        },
        {
          heading: "Restricted Media Storage",
          body: "Private verification photos are stored in an isolated Supabase Storage bucket. These images are inaccessible via public URLs and can only be viewed by authorized administrators using time-limited, cryptographically signed internal links.",
        },
        {
          heading: "Infrastructure Redundancy",
          body: "Data is mirrored across multiple secure cloud regions to prevent data loss. Access to production databases is strictly limited to the Platform Administration Team through multi-factor authentication.",
        },
      ],
    },
    {
      id: "third-parties",
      icon: Share2,
      number: "04",
      title: "Third-Party Data Disclosures",
      content: [
        {
          heading: "Razorpay (Payment Infrastructure)",
          body: "We share essential order metadata with Razorpay to process your payments securely. They act as an independent data processor and manage all financial credentials under their own strict privacy standards.",
        },
        {
          heading: "Google Analytics (Behavioral Data)",
          body: "We use Google Analytics to collect anonymized usage statistics. We do not share your Name, Email, or User ID with Google. This data helps us optimize platform performance and surface popular categories.",
        },
        {
          heading: "Transactional Email Systems",
          body: "Your institutional email address is shared with our transactional mail providers solely for the delivery of platform-critical notifications and account recovery links.",
        },
      ],
    },
    {
      id: "roles",
      icon: ShieldCheck,
      number: "05",
      title: "Data Protection Roles",
      content: [
        {
          heading: "The Data Controller",
          body: "The MNIT Marketplace Platform Administration Team acts as the primary Data Controller. We determine the purposes and means of processing your data, prioritizing campus safety and user privacy above all else.",
        },
        {
          heading: "The Data Processors",
          body: "Cloud infrastructure providers (Supabase) and payment gateways (Razorpay) act as Data Processors, handling your information strictly according to our security protocols and instructions.",
        },
      ],
    },
    {
      id: "rights",
      icon: UserX,
      number: "06",
      title: "User Rights & Data Control",
      content: [
        {
          heading: "Access and Correction",
          body: "You have the right to access all personal data we hold about you and correct any inaccuracies directly through your Profile Dashboard or by contacting the administration team.",
        },
        {
          heading: "The Right to be Forgotten",
          body: "Upon request, we will permanently delete your personal account data within 30 days, provided there are no active disputes or legal retention obligations associated with your transaction history.",
        },
        {
          heading: "Data Portability",
          body: "You may request a machine-readable export of the data you have provided to us for use in other services, which we will provide within 14 business days.",
        },
      ],
    },
    {
      id: "notices",
      icon: Bell,
      number: "07",
      title: "Policy Updates & Notifications",
      content: [
        {
          heading: "Protocol for Policy Changes",
          body: "MNIT Marketplace reserves the right to modify this Privacy Policy. Any material changes that impact how we use your data will be communicated via your @mnit.ac.in email address at least 7 days before taking effect.",
        },
        {
          heading: "Log of Updates",
          body: "The platform maintains a version-controlled history of privacy policies. Your continued use of the platform after an update constitutes acceptance of the new terms.",
        },
      ],
    },
    {
      id: "contact",
      icon: MailIcon,
      number: "08",
      title: "Contact & Grievance Redressal",
      content: [
        {
          heading: "Privacy Support Channels",
          body: "For any privacy-related queries, security reports, or data deletion requests, you may reach our administration team via the following channels.",
        },
        {
          heading: "Contact Details",
          body: "Email: mnitmarketplace@gmail.com · Subject: Privacy Query\nPhone: +91 7760677104\nAddress: MNIT Jaipur, JLN Marg, Jaipur, Rajasthan 302017",
        },
      ],
    },
    {
      id: "cookies",
      icon: Cookie,
      number: "09",
      title: "Cookies & Tracking Mechanisms",
      content: [
        {
          heading: "Essential Session Cookies",
          body: "We set mandatory cookies through Supabase to maintain your secure authentication session. These are strictly necessary for the platform to function and expire automatically when you log out.",
        },
        {
          heading: "Performance & Analytics",
          body: "Non-essential cookies from Google Analytics may be used to track behavioral patterns. You can opt-out of these through your browser's cookie settings without impacting your use of the marketplace.",
        },
      ],
    },
    {
      id: "children",
      icon: UserSquare2,
      number: "10",
      title: "Children's Privacy Protection",
      content: [
        {
          heading: "Minimum Age Requirement",
          body: "MNIT Marketplace is strictly restricted to users aged 18 or older. We do not knowingly collect or process data from minors. Registration from a minor is a violation of our terms and will result in account termination.",
        },
        {
          heading: "Underage Data Removal",
          body: "If we discover that data has been collected from an individual under 18, we will immediately initiate an irreversible deletion process for that data and notify the user via their institutional email.",
        },
      ],
    },
    {
      id: "dpdp",
      icon: Fingerprint,
      number: "11",
      title: "DPDP Act Compliance (India)",
      content: [
        {
          heading: "Statutory User Rights",
          body: "Under India's Digital Personal Data Protection (DPDP) Act, you have the right to request a summary of processed data, nominate a representative for data management, and withdraw your consent for future processing at any time.",
        },
        {
          heading: "Grievance Redressal Officer",
          body: "In compliance with the Act, our Platform Administrator serves as the Grievance Redressal Officer for all personal data matters. We aim to resolve all grievances within the statutory timeframe.",
        },
      ],
    },
  ];

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
              <a href="mailto:mnitmarketplace@gmail.com" className="text-primary-400 hover:text-primary-300 transition-colors font-bold">
                mnitmarketplace@gmail.com
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
