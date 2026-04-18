import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Join MNIT Marketplace',
  description: 'Create your MNIT Marketplace account with your @mnit.ac.in email to start buying and selling securely on campus.',
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
