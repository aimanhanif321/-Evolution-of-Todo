import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SSEProvider } from '@/context/SSEContext';
import { NotificationProvider } from '@/components/NotificationProvider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Taskora - Organize. Focus. Finish.',
  description: 'A modern todo application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SSEProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </SSEProvider>
        </AuthProvider>
      </body>
    </html>
  );
}