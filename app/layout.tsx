import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mission Control Dashboard | Automation Hub',
  description: 'Monitor and manage your AI automation agents, tasks, and projects in real-time',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
