import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Understand our secure platform protection process, student verification, and how MNIT Marketplace protects buyers and sellers on campus.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
