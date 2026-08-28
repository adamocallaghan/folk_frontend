import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Folk - Adaptive Teaching & Tutoring Platform',
  description: 'Multi-agent pedagogical platform for tailored curriculum synthesis, Socratic tutoring, and teacher governance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="refined">
      <body className="min-h-screen bg-[#f5f0e8] text-[#1a1714] antialiased selection:bg-[#1a1714] selection:text-[#f5f0e8]">
        <ThemeProvider>
          <Header />
          <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
