import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Log in to your MNIT Marketplace account to buy, sell, and manage your campus listings.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
