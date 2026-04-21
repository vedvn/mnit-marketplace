import Link from "next/link";
import { ShieldCheck, AlertTriangle, Ban, CreditCard, Camera, Scale, UserCheck, Clock, ArrowLeft, Mail as MailIcon, Lock, Database, MapPin, FileSearch } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | MNIT Marketplace",
  description: "Read the full terms, rules, and conditions for using the MNIT Marketplace campus marketplace.",
};

export default function TermsPage() {
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
          heading: "Platform Independence",
          body: "MNIT Marketplace is an independent student-run initiative. By using this platform, you acknowledge and agree that MNIT Marketplace is NOT affiliated with, endorsed by, managed by, or officially sanctioned by Malaviya National Institute of Technology (MNIT) Jaipur. The institute bears no responsibility for the operations, transactions, or moderation of this platform.",
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
          body: "You must not list items that are illegal, stolen, hazardous, counterfeit, or otherwise not permitted to be sold within the MNIT campus. The following categories are explicitly prohibited and will result in immediate listing removal and potential account suspension:\n\n• Alcohol, beer, wine, tobacco, cigarettes, or any intoxicants\n• Illegal drugs, narcotics, or controlled substances\n• Weapons of any kind — knives, blades, firearms, or any item designed to cause harm\n• Prescription medication, pharmaceutical drugs, or health supplements with unverified claims\n• Counterfeit, replica, pirated, or stolen goods of any kind\n• Adult content, pornography, or any sexually explicit material\n• Copyrighted digital content (pirated software, cracked apps, illegally copied media)\n• Any items that violate MNIT institutional rules or Indian law",
        },
        {
          heading: "Moderation Review",
          body: "All submitted listings enter a PENDING_REVIEW status. Our trained employee moderators will compare your public gallery photos with your private live verification photo. Only upon successful verification will your listing be published. MNIT Marketplace reserves the right to reject any listing without providing a specific reason.",
        },
      ],
    },
    {
      id: "guarantee",
      icon: CreditCard,
      number: "03",
      title: "Secure Payment & Platform Guarantee",
      content: [
        {
          heading: "Platform Payment Hold",
          body: "All transactions on MNIT Marketplace are conducted through a secure payment system powered by Razorpay. When a buyer completes payment, the funds are held securely by the Platform Administrator. The money is NOT transferred to the seller at the time of purchase — it is held in trust by the administrator until the buyer explicitly confirms that the item has been received in satisfactory condition.",
        },
        {
          heading: "Platform Fee",
          body: "A percentage-based platform fee is deducted from the seller's total payout for every successful transaction. This fee covers payment processing, platform maintenance, and secure transaction facilitation. This fee is non-refundable.",
        },
        {
          heading: "Seller Conduct & Confirmation",
          body: "Once an item has been physically exchanged, the seller may politely request the buyer to 'Confirm Received' via the platform dashboard. Sellers are strictly prohibited from utilizing external automation, pressure tactics, or harassment to force a payment release. The final decision to release funds rests with the buyer's confirmation or Administrator intervention.",
        },
        {
          heading: "Payout Release",
          body: "The seller's payout is initiated once the buyer clicks 'Confirm Received' in their profile dashboard. The funds will then be processed and routed to the seller's bank account or UPI handle within the standard processing timeline.",
        },
        {
          heading: "Refund & Cancellation Policy",
          body: "Buyers can request a cancellation before the item handover is reported. Once a refund is approved by the Platform Administrator, it will be processed through the original payment method within 5-7 business days as per banking standards.",
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
          heading: "Specified Pickup Windows",
          body: "To ensure campus safety and visibility, all physical item handovers MUST occur between 7:00 AM and 9:00 PM. Meetups outside of these hours are strictly prohibited and will not be facilitated by platform administration.",
        },
        {
          heading: "Restricted Handover Locations",
          body: "Handovers must only take place at the specified on-campus locations listed in the product details (e.g., Canteen, Hostel Main Gate, VLTC). Attempting to move a handover to an off-campus or unlisted location is a violation of our safety protocols.",
        },
        {
          heading: "Seller Obligation",
          body: "Once an item is purchased, the seller is obligated to meet the buyer at the designated pickup location within a reasonable timeframe. Failure to appear for a handover, especially after receiving payment, is considered fraudulent behaviour.",
        },
        {
          heading: "Item Condition & Inspection",
          body: "The item must be in the same condition as described and photographed at the time of listing. Buyers must meticulously inspect the item before clicking 'Confirm Received'. Once the receipt is confirmed, the transaction is final.",
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
          body: "MNIT Marketplace has a strict zero-tolerance policy for fraudulent behaviour. This includes but is not limited to: listing items you do not own, failing to bring an item after receiving payment, deliberately misrepresenting an item's condition, and any attempt to conduct off-platform financial transactions to bypass the platform payment gateway.",
        },
        {
          heading: "Prohibited Actions",
          body: "The following actions are strictly prohibited and will result in an immediate permanent ban: (a) Attempting to contact buyers or sellers to arrange payments outside of the Razorpay gateway; (b) Listing items that are not in your physical possession at the time of listing; (c) Using the platform for commercial, bulk, or business-related sales (this is a peer-to-peer student marketplace only); (d) Manipulating the review or moderation system through fake accounts or collusion; (e) Any form of harassment, hate speech, or abuse directed at other users or platform administrators; (f) Creating fake or 'test' listings; (g) Sharing your @mnit.ac.in account credentials with any other individual; (h) Using automated scripts, bots, or scraping tools to interact with the platform; (i) Providing false, misleading, or curated evidence during a dispute resolution process; (j) Any attempt to circumvent platform security measures or the platform safety hold system.",
        },
        {
          heading: "Automated Content Screening",
          body: "All listing titles and descriptions are automatically scanned by our content moderation system before submission. Listings containing flagged terms — including but not limited to: words associated with prohibited items (e.g. 'weapon', 'drugs', 'alcohol'), off-platform payment requests (e.g. 'pay outside', 'advance payment', 'UPI'), off-platform contact pressure (e.g. 'WhatsApp me', 'DM me'), or spam signals (e.g. 'guaranteed', 'urgent sale', 'no questions asked') — are automatically routed to PENDING_REVIEW for human moderation. This is not an automatic rejection; a human moderator will review every flagged listing. This system exists to protect buyers from scams and to maintain a safe, trustworthy marketplace.",
        },
        {
          heading: "Reporting Mechanism",
          body: "If you encounter suspicious activity, a potentially fraudulent listing, or any behaviour that violates these terms, you are obligated to report it immediately via the 'Report a Scam' link in the footer or by contacting the admin team at mnitmarketplace@gmail.com.",
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
          heading: "Strict Enforcement Policy",
          body: "MNIT Marketplace enforces an absolute zero-tolerance policy. If our administration team determines that you have: (a) failed to hand over an item after receiving payment; (b) deliberately misrepresented an item; (c) engaged in any form of financial fraud; or (d) attempted to circumvent the platform payment gateway — STRICT, IMMEDIATE, and IRREVERSIBLE action will be taken, including a permanent ban from the platform with no right of appeal.",
        },
        {
          heading: "Harassment Policy",
          body: "Any form of harassment, intimidation, or abuse directed at other users—whether occurring over online platforms (WhatsApp, Call, etc.) or during physical on-campus meetups—is strictly prohibited. MNIT Marketplace maintains a professional environment, and violation of this conduct will lead to immediate platform expulsion.",
        },
        {
          heading: "What a Ban Entails",
          body: "A permanent ban includes the immediate removal of your current listings, cancellation of pending transactions, and blocking of your @mnit.ac.in email, phone number, and device fingerprint from the platform.",
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
          heading: "Intermediary Disclosure",
          body: "MNIT Marketplace operates strictly as an intermediary e-commerce marketplace platform under Section 79 of the IT Act. We facilitate the meeting and transaction between student buyers and sellers. We are NOT a party to the contract of sale for any items. The contract for sale of any product is a strictly bipartite contract between the seller and the buyer.",
        },
        {
          heading: "Condition Disclaimer",
          body: "While we implement rigorous verification measures, we cannot guarantee the quality, safety, or legal compliance of any item listed. Buyers must inspect items upon physical delivery.",
        },
        {
          heading: "Indemnification",
          body: "By using MNIT Marketplace, you agree to indemnify, defend, and hold harmless MNIT Marketplace and its administrators from any claims, damages, losses, or expenses arising from your violation of these Terms & Conditions or your conduct on the platform.",
        },
        {
          heading: "Limitation of Liability",
          body: "To the maximum extent permitted by applicable law, MNIT Marketplace and its administrators shall not be liable for any indirect, incidental, or consequential damages arising from the use of the platform.",
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
          body: "All disputes arising from the use of MNIT Marketplace that cannot be resolved through internal platform moderation will be subject to the final and binding decision of the Platform Administration and, where applicable, the laws of India.",
        },
      ],
    },
    {
      id: "contact",
      icon: MailIcon,
      number: "09",
      title: "Contact Information",
      content: [
        {
          heading: "Support Channels",
          body: "For any queries, disputes, or support requests regarding your transactions, you may contact our administrator team through the following channels.",
        },
        {
          heading: "Official Email",
          body: "mnitmarketplace@gmail.com",
        },
        {
          heading: "Support Phone",
          body: "+91 7760677104",
        },
        {
          heading: "Contact Address",
          body: "Malaviya National Institute of Technology, Jawahar Lal Nehru Marg, Jaipur, Rajasthan 302017",
        },
      ],
    },
    {
      id: "ip",
      icon: Lock,
      number: "10",
      title: "Intellectual Property Rights",
      content: [
        {
          heading: "Ownership of Intellectual Property",
          body: "All content, features, and functionality of the MNIT Marketplace platform—including but not limited to all software code, databases, algorithms, user interface designs, visual graphics, logos, distinctive brand features, and text translations—are the exclusive intellectual property of the Independent Platform Administration. These assets are protected by Indian and international copyright, trademark, and trade secret laws.",
        },
        {
          heading: "Restrictions on Use",
          body: "Users are granted a limited, non-exclusive, and non-transferable license to access and use the platform for its intended purpose of peer-to-peer campus trading. You are strictly prohibited from: (a) Copying, modifying, or creating derivative works of any part of the platform; (b) Reverse engineering, decompiling, or attempting to extract the source code; (c) Using any automated 'scraping' or 'crawling' tools to harvest data; (d) Using our branding, logo, or name in any way that implies an official endorsement or affiliation without explicit written consent.",
        },
        {
          heading: "Reporting Intellectual Property Infringement",
          body: "We respect the intellectual property rights of others. If you believe that any content listed on our platform infringes upon your copyright or trademark, please provide a detailed notification to our administration team at mnitmarketplace@gmail.com. We will investigate and remove infringing content within 48 hours of verification.",
        },
      ],
    },
    {
      id: "licensing",
      icon: Database,
      number: "11",
      title: "User Content & Data Licensing",
      content: [
        {
          heading: "Ownership of User-Generated Content",
          body: "You retain all intellectual property rights and ownership to the original photographs, descriptions, and comments you upload to MNIT Marketplace. You represent and warrant that you own or have the necessary licenses and permissions to use and authorize us to use all content you submit.",
        },
        {
          heading: "License Granted to Platform",
          body: "By uploading content to the platform, you grant MNIT Marketplace a non-exclusive, royalty-free, sub-licensable, and worldwide license to host, display, reproduce, and distribute your content solely for the purpose of operating, promoting, and improving the marketplace services. This includes displaying your listing images to potential buyers and utilizing verification photos for internal moderation audits.",
        },
        {
          heading: "Responsibility for Content",
          body: "You are solely responsible for the legality and accuracy of the content you provide. MNIT Marketplace does not endorse any user-provided content and expressly disclaims any liability in connection with such content. We reserve the right, though not the obligation, to remove any content that we deem, in our sole discretion, to be inaccurate, offensive, or in violation of these Terms.",
        },
      ],
    },
    {
      id: "warranties",
      icon: AlertTriangle,
      number: "12",
      title: "Disclaimer of Warranties",
      content: [
        {
          heading: "As-Is and As-Available Basis",
          body: "MNIT Marketplace is provided on an 'AS IS' and 'AS AVAILABLE' basis without any warranties of any kind, whether express or implied. We do not warrant that: (a) The platform will function without interruption or be available at any particular time or location; (b) Any errors or defects will be corrected; (c) The platform is free of viruses or other harmful components; or (d) The results of using the platform will meet your specific requirements.",
        },
        {
          heading: "Product & Transactional Disclaimer",
          body: "As a pure intermediary, MNIT Marketplace makes no representations or warranties regarding the items listed by users. We do not guarantee the quality, safety, authenticity, or legal compliance of any product. Your use of the platform and your interactions with other users are at your own sole risk and discretion.",
        },
        {
          heading: "User Identity Verification",
          body: "While we implement institutional email verification and live photo requirements, we do not guarantee the absolute identity of any user. Users must exercise their own judgment and due diligence during on-campus handovers.",
        },
      ],
    },
    {
      id: "jurisdiction",
      icon: MapPin,
      number: "13",
      title: "Governing Law & Dispute Resolution",
      content: [
        {
          heading: "Choice of Law",
          body: "These Terms & Conditions and your use of MNIT Marketplace shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.",
        },
        {
          heading: "exclusive Jurisdiction",
          body: "Any legal action, suit, or proceeding arising out of or related to these Terms, the platform's operation, or any dispute between users and the Platform Administration shall be instituted exclusively in the competent courts located in Jaipur, Rajasthan, India. You hereby consent to the personal jurisdiction of such courts.",
        },
        {
          heading: "Class Action Waiver",
          body: "To the extent permitted by law, you agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a class, consolidated, or representative action.",
        },
      ],
    },
    {
      id: "miscellaneous",
      icon: FileSearch,
      number: "14",
      title: "Miscellaneous Provisions",
      content: [
        {
          heading: "Force Majeure",
          body: "MNIT Marketplace shall not be liable for any failure or delay in the performance of its obligations hereunder where such failure or delay results from any cause beyond our reasonable control, including but not limited to: severe weather, natural disasters, acts of God, strikes, institutional lockdowns, power failures, or major telecommunication infrastructure outages.",
        },
        {
          heading: "Severability & Waiver",
          body: "If any provision of these Terms is found by a court of competent jurisdiction to be invalid or unenforceable, the parties agree that the court should endeavor to give effect to the parties' intentions as reflected in the provision, and the other provisions of these Terms shall remain in full force and effect. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.",
        },
        {
          heading: "Entire Agreement",
          body: "These Terms & Conditions constitute the entire and exclusive agreement between you and the MNIT Marketplace Platform Administration regarding the use of the platform, superseding and replacing any prior agreements, oral or written, between the parties regarding the subject matter.",
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
