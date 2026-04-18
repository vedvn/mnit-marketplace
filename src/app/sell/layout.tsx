import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell an Item',
  description: 'List your used items for sale on MNIT Marketplace. Follow our platform safety rules to reach verified student buyers securely.',
};

export default function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
