import Link from "next/link";
import { ShieldCheck, AlertTriangle, Ban, CreditCard, Camera, Scale, UserCheck, Clock, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | MNIT Marketplace",
  description: "Read the full terms, rules, and conditions for using the MNIT Marketplace campus marketplace.",
};

const sections = [
  {
    id: "eligibility",
    icon: UserCheck,
    number: "01",
    title: "Eligibility & Access",
    content: [
      {
        heading: "Exclusive Access",
        body: "MNIT Marketplace is exclusively available to current students, faculty, and staff of Malaviya National Institute of Technology (MNIT), Jaipur. Access requires a valid @mnit.ac.in institutional email address. Any attempt to register using a non-institutional email will be automatically rejected.",
      },
      {
        heading: "Account Responsibility",
        body: "You are solely responsible for maintaining the confidentiality of your account credentials. All activity under your account is your responsibility. You must not share, transfer, or sell your account to any other person. MNIT Marketplace reserves the right to terminate accounts that violate these terms.",
      },
      {
        heading: "One Account Per Person",
        body: "Each person is permitted only one active account on the platform. Creating multiple accounts, especially after a ban, is a serious violation and will result in permanent exclusion of all associated accounts and devices.",
      },
    ],
  },
  {
    id: "listings",
    icon: Camera,
    number: "02",
    title: "Listings & Live Verification",
    content: [
      {
        heading: "Mandatory Live Photo Requirement",
        body: "Every item listed on MNIT Marketplace must be accompanied by a live verification photo captured directly through the application's camera at the time of listing. This photo is private and never shown to buyers — it is used exclusively by our employee moderators to verify ownership and authenticity before the listing is approved.",
      },
      {
        heading: "Accurate Representation",
        body: "All listings must accurately represent the item being sold. The publicly displayed gallery images must be actual photos of the specific item you own. Using stock images, images downloaded from the internet, or images belonging to a different unit of the product is strictly prohibited and grounds for an immediate ban.",
      },
      {
        heading: "Prohibited Items",
        body: "You must not list items that are illegal, stolen, hazardous, counterfeit, or otherwise not permitted to be sold within the MNIT campus. This includes, but is not limited to: prescription drugs, alcohol, weapons, copyrighted material, and any items that violate MNIT institutional rules.",
      },
      {
        heading: "Moderation Review",
        body: "All submitted listings enter a PENDING_REVIEW status. Our trained employee moderators will compare your public gallery photos with your private live verification photo. Only upon successful verification will your listing be published. MNIT Marketplace reserves the right to reject any listing without providing a specific reason.",
      },
    ],
  },
  {
    id: "escrow",
    icon: CreditCard,
    number: "03",
    title: "Payments & Escrow System",
    content: [
      {
        heading: "How Escrow Works",
        body: "All transactions on MNIT Marketplace are conducted through a secure escrow system powered by Razorpay. When a buyer completes payment, the funds are held securely by the platform. The money is NOT transferred to the seller at the time of purchase — it is held in trust until the buyer explicitly confirms that the item has been received in satisfactory condition.",
      },
      {
        heading: "Platform Fee",
        body: "A platform fee of ₹10 is charged per transaction. This fee covers payment processing costs, platform maintenance, and moderation operations. This fee is non-refundable.",
      },
      {
        heading: "Payout Release",
        body: "The seller's payout is automatically triggered once the buyer clicks 'Confirm Received' in their profile dashboard. The funds will then be routed to the seller's bank account or UPI handle within the standard Razorpay payout timeline (typically 1-3 business days). MNIT Marketplace is not responsible for delays caused by banking or payment gateway infrastructure.",
      },
      {
        heading: "Dispute & Refunds",
        body: "If a buyer does not confirm receipt within 7 days of a reported successful handover, MNIT Marketplace moderators will review the evidence submitted by both parties and make a final binding decision. Refunds are only issued in cases of verified non-delivery or MNIT Marketplace moderator-confirmed fraud.",
      },
    ],
  },
  {
    id: "handover",
    icon: Clock,
    number: "04",
    title: "Handover Rules",
    content: [
      {
        heading: "Campus-Only Handovers",
        body: "All physical item handovers must take place within the MNIT Jaipur campus at the pickup location specified in the listing. Off-campus meetups are not facilitated or endorsed by MNIT Marketplace.",
      },
      {
        heading: "Seller Obligation",
        body: "Once an item is purchased, the seller is obligated to meet the buyer at the designated pickup location within a reasonable timeframe (to be agreed upon via contact information). Failure to appear for a handover, especially after receiving payment, is considered fraudulent behaviour.",
      },
      {
        heading: "Item Condition at Handover",
        body: "The item must be in the same condition as described and photographed at the time of listing. Substituting the item with a damaged, different, or inferior version at handover is fraud and will result in a permanent ban and financial liability.",
      },
      {
        heading: "Buyer's Inspection Rights",
        body: "Buyers have the right to inspect the item upon pickup before confirming receipt. If an item is significantly not as described, the buyer should not confirm receipt and must immediately raise a dispute through their profile dashboard within 24 hours of the attempted handover.",
      },
    ],
  },
  {
    id: "conduct",
    icon: Scale,
    number: "05",
    title: "User Conduct & Anti-Scam Policy",
    content: [
      {
        heading: "Zero Tolerance for Fraud",
        body: "MNIT Marketplace has a strict zero-tolerance policy for fraudulent behaviour. This includes but is not limited to: listing items you do not own, failing to bring an item after receiving payment, deliberately misrepresenting an item's condition, and any attempt to conduct off-platform financial transactions to bypass the escrow system.",
      },
      {
        heading: "Prohibited Actions",
        body: "The following actions are strictly prohibited on the platform: (a) Attempting to contact buyers/sellers to arrange payments outside of the Razorpay gateway; (b) Manipulating the review and moderation system; (c) Harassment of other users or moderators; (d) Creating fake listings as a test or joke; (e) Sharing your login credentials with others.",
      },
      {
        heading: "Reporting Mechanism",
        body: "If you encounter suspicious activity, a potentially fraudulent listing, or any behaviour that violates these terms, you are obligated to report it immediately via the 'Report a Scam' link in the footer or by emailing the admin team. MNIT Marketplace actively investigates all reports.",
      },
    ],
  },
  {
    id: "bans",
    icon: Ban,
    number: "06",
    title: "Bans & Enforcement",
    content: [
      {
        heading: "Permanent, Unappealable Bans",
        body: "MNIT Marketplace enforces a strict permanent ban policy for users found guilty of fraudulent activity. If our moderation team determines that you have: (a) failed to hand over an item after receiving payment; (b) deliberately misrepresented an item; (c) engaged in any form of financial fraud; or (d) attempted to circumvent the escrow system — you will be permanently banned from the platform with no right of appeal.",
      },
      {
        heading: "What a Ban Entails",
        body: "A permanent ban includes the immediate and irreversible removal of your current listings, cancellation of any pending transactions, forfeiture of any held escrow funds pending investigation, and blocking of your @mnit.ac.in email, phone number, and device fingerprint from creating new accounts.",
      },
      {
        heading: "Temporary Bans",
        body: "MNIT Marketplace may also issue temporary bans for minor violations such as repeatedly posting inaccurate listings, failing to show up for a handover once (first offence), or minor harassment. The duration and terms of temporary bans are at the sole discretion of the admin team.",
      },
      {
        heading: "Ban Circumvention",
        body: "Any attempt to circumvent a ban by creating a new account, using a different email, or using another person's account will result in a permanent ban for all involved accounts and will be reported to MNIT institute authorities.",
      },
    ],
  },
  {
    id: "liability",
    icon: AlertTriangle,
    number: "07",
    title: "Liability & Disclaimers",
    content: [
      {
        heading: "Platform Disclaimer",
        body: "MNIT Marketplace is a student-run campus marketplace facilitating peer-to-peer transactions. While we implement rigorous verification and moderation measures, we are ultimately a technology platform and not a retailer. We cannot guarantee the quality, safety, or legal compliance of any item listed.",
      },
      {
        heading: "Limitation of Liability",
        body: "To the maximum extent permitted by applicable law, MNIT Marketplace and its administrators shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of the platform, including loss of data, loss of profits, or damages resulting from transactions conducted on the platform.",
      },
      {
        heading: "Indemnification",
        body: "By using MNIT Marketplace, you agree to indemnify, defend, and hold harmless MNIT Marketplace, its administrators, and affiliated MNIT personnel from any claims, damages, losses, or expenses arising from your violation of these Terms & Conditions or your conduct on the platform.",
      },
    ],
  },
  {
    id: "changes",
    icon: ShieldCheck,
    number: "08",
    title: "Changes to Terms",
    content: [
      {
        heading: "Right to Modify",
        body: "MNIT Marketplace reserves the right to modify, update, or replace these Terms & Conditions at any time. Significant changes will be communicated via email to your registered @mnit.ac.in address.",
      },
      {
        heading: "Continued Use",
        body: "Your continued use of the MNIT Marketplace platform after any modifications to these Terms constitutes your acceptance of the updated Terms. If you do not agree with any updated terms, you must discontinue use of the platform immediately.",
      },
      {
        heading: "Governing Authority",
        body: "All disputes arising from the use of MNIT Marketplace that cannot be resolved through internal moderation will be subject to the internal disciplinary procedures of MNIT Jaipur and, where applicable, the laws of India.",
      },
    ],
  },
];

export default function TermsPage() {
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
              Terms &<br />
              <span className="text-primary-600">Conditions.</span>
            </h1>
          </div>
          <div className="md:pb-2 max-w-sm">
            <p className="text-foreground/70 font-sans leading-relaxed">
              By creating an account or using MNIT Marketplace, you agree to be fully bound by these terms. Please read carefully — these are not optional.
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
                    <p className="text-foreground/70 leading-relaxed font-sans text-sm pl-3">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Agreement Banner */}
      <section className="w-full bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl display-title uppercase mb-3">You agree by using the platform.</h2>
            <p className="text-zinc-400 text-sm font-light leading-relaxed max-w-lg">
              By creating an account, listing items, or completing a purchase on MNIT Marketplace, you confirm that you have read and accepted all of the above terms without reservation.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-0 w-full md:w-auto shrink-0">
            <Link
              href="/market"
              className="w-full sm:w-auto text-center px-8 py-4 bg-primary-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-900 transition-colors"
            >
              Browse Market
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto text-center px-8 py-4 bg-white text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-zinc-100 transition-colors"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
