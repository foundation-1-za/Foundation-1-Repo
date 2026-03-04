import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';
import { AuthProvider } from '@/lib/auth-context';
import { RealtimeProvider } from '@/lib/realtime/context';
import { RealtimeNotificationToast } from '@/components/RealtimeNotification';

export const metadata: Metadata = {
  title: 'Generocity — Zero Capital Expenditure Solar for South African Businesses',
  description: 'Generocity — zero capital expenditure solar solutions for South African businesses in partnership with Green Share VPP. No upfront cost, immediate energy savings.',
  keywords: 'Foundation-1, Generocity, solar, South Africa, zero capex, business energy, Green Share VPP, renewable energy',
};

import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ThemeProvider>
            <AuthProvider>
              <RealtimeProvider>
                {children}
                <RealtimeNotificationToast />
              </RealtimeProvider>
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
