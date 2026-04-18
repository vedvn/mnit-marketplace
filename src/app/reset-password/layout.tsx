import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Set New Password',
  description: 'Securely update your MNIT Marketplace account with a new password to regain access to the campus marketplace.',
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
