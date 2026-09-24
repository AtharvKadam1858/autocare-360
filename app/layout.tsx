import type { Metadata } from 'next';
import './globals.css';
import { DashboardShell } from '@/components/DashboardShell';

export const metadata: Metadata = {
  title: 'AUTOCARE 360 | Complete Vehicle Service Management',
  description: 'Enterprise automobile service center management platform for bookings, job cards, estimates, customer approvals, billing, and deliveries.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
