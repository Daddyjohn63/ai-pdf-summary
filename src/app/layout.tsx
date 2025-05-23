import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Source_Sans_3 as FontSans } from 'next/font/google';
import './globals.css';
import Header from '@/components/common/header';
//import { Footer } from '@/components/common/footer';
import { Toaster } from 'sonner';
import Footer from '@/components/common/footer';

const fontSans = FontSans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: 'AI pdf summarizer',
  description: 'Summarize your pdfs with AI'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${fontSans.variable} font-sans antialiased`}>
          <div className="relative flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            {/* <Footer /> */}
          </div>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
