# MNIT Marketplace

A full-stack campus marketplace platform built for MNIT Jaipur students to buy, sell, and exchange goods within a trusted campus community along with a dedicated space to share notes and previous year question papers (PYQs).

🔗 **Live:** [mnitmarketplace.store](https://mnitmarketplace.store)

> ## ✨ Features
- Buy and sell listings within the MNIT student community
- AI-assisted listing verification powered by the Groq API
- Secure payments via Razorpay, with an integrated commission model
- Notes & PYQ sharing, backed by the Google Drive API for storage
- Automated email notifications via Resend

> ## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS v4
- **Auth:** Supabase Auth (`@supabase/ssr`)
- **Payments:** Razorpay
- **AI Integration:** Groq API (listing verification) *(called via direct REST/fetch — no SDK dependency, so it won't appear in package.json)*
- **Email:** Resend + React Email (styled transactional emails)
- **File Storage:** Google Drive API (notes & PYQs)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Charts/Analytics:** Recharts
- **Data Export:** csv-stringify
- **Deployment:** Vercel

> ## Getting Started

Clone the repo and install dependencies:

```bash
git clone https://github.com/vedvn/mnit-marketplace.git
cd mnit-marketplace
npm install
```

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
GROQ_API_KEY=your_groq_api_key
RESEND_API_KEY=your_resend_api_key
GOOGLE_DRIVE_CLIENT_ID=your_google_drive_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_drive_client_secret
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## License

This project, **MNIT MarketPlace**, is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0) by Ved Narasalagi (@vedvn). 

- **Attribution:** Others can share, copy, and modify this code, but they must give appropriate credit to Ved Narasalagi.
- **Non-Commercial:** Others **cannot** use this code or platform for commercial purposes, sales, or financial gain.

For the full legal terms, please read the [LICENSE](LICENSE) file or visit the [Creative Commons Website](http://creativecommons.org).

### Commercial Use & Inquiries
If you are interested in using MNIT MarketPlace for commercial purposes or campus-wide deployment with financial features enabled, please contact me directly via my GitHub profile or open an issue.
