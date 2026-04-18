import Link from "next/link";
import { ShieldCheck, Mail, MapPin, ArrowUpRight, ExternalLink } from "lucide-react";

// Social icons as inline SVGs (lucide-react v1 doesn't include brand icons)
const GithubIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FOOTER_LINKS = {
  Platform: [
    { label: "Browse Market", href: "/market" },
    { label: "Sell an Item", href: "/sell" },
    { label: "How It Works", href: "/about" },
    { label: "My Profile", href: "/profile" },
  ],
  Support: [
    { label: "Contact Admin", href: "mailto:mnitmarketplace@gmail.com" },
    { label: "Report a Scam", href: "mailto:mnitmarketplace@gmail.com?subject=Scam%20Report" },
    { label: "Terms & Rules", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Employee Desk", href: "/employee" },
  ],
  Campus: [
    { label: "MNIT Jaipur", href: "https://mnit.ac.in", external: true },
    { label: "Student Portal", href: "https://erp.mnit.ac.in", external: true },
  ],
};

const SOCIAL_LINKS = [
  { Icon: GithubIcon, href: "https://github.com", label: "GitHub" },
  { Icon: TwitterIcon, href: "https://twitter.com", label: "Twitter" },
  { Icon: InstagramIcon, href: "https://instagram.com", label: "Instagram" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-zinc-950 text-white mt-auto">
      {/* Top Banner */}
      <div className="w-full max-w-7xl mx-auto px-6 py-16 bento-border-b border-zinc-800">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          {/* Branding */}
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="bg-primary-600 text-white px-2 py-0.5 rounded-sm text-xl font-black tracking-tighter">MNIT</span>
              <span className="text-white text-xl font-black tracking-tighter">MARKETPLACE</span>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">
              The official, secure campus marketplace exclusively for MNIT Jaipur students.
              Zero scams. Verified listings. Automated payouts.
            </p>
            <div className="flex items-center gap-2 mt-5 text-primary-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">@mnit.ac.in Verified Only</span>
            </div>
          </div>

          {/* Quick Stat Boxes */}
          <div className="w-full md:w-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800 border border-zinc-800 shrink-0">
            <div className="p-6 sm:px-8 sm:py-6 text-center">
              <div className="text-3xl font-black text-white mb-1">100%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Verified</div>
            </div>
            <div className="p-6 sm:px-8 sm:py-6 text-center">
              <div className="text-3xl font-black text-primary-500 mb-1">₹0</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Hidden Fees</div>
            </div>
            <div className="p-6 sm:px-8 sm:py-6 text-center">
              <div className="text-3xl font-black text-white mb-1">12h</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Escrow Hold</div>
            </div>
          </div>
        </div>
      </div>

      {/* Links Grid */}
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 py-12 border-b border-zinc-800">
          {Object.entries(FOOTER_LINKS).map(([category, links], i) => (
            <div
              key={category}
              className={`${i !== 0 ? 'md:pl-8 md:border-l border-zinc-800' : ''} md:pr-8`}
            >
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={'external' in link && link.external ? "_blank" : undefined}
                      rel={'external' in link && link.external ? "noopener noreferrer" : undefined}
                      className="group flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors font-medium"
                    >
                      {link.label}
                      {'external' in link && link.external && (
                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className="md:pl-8 md:border-l border-zinc-800">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-6">
              Contact
            </h3>
            <div className="space-y-4">
              <a
                href="mailto:mnitmarketplace@gmail.com"
                className="flex items-start gap-3 group"
              >
                <Mail className="w-4 h-4 mt-0.5 text-zinc-600 group-hover:text-primary-500 transition-colors shrink-0" />
                <span className="text-sm text-zinc-400 group-hover:text-white transition-colors break-all">
                  mnitmarketplace@gmail.com
                </span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-zinc-600 shrink-0" />
                <span className="text-sm text-zinc-400 leading-relaxed">
                  MNIT Jaipur, JLN Marg,<br />Jaipur, Rajasthan 302017
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">
          © {currentYear} MNIT Marketplace · Built for MNIT Students
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-3">
          {SOCIAL_LINKS.map(({ Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-8 h-8 flex items-center justify-center border border-zinc-800 text-zinc-500 hover:border-primary-600 hover:text-primary-500 transition-all"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
