import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Folk - Pedagogical System',
  description: 'Adaptive educational platform powered by Google ADK and Gemini 3.7',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#f5f0e8] text-[#1a1714] min-h-screen">
        <Header />
        <main className="min-h-[calc(100vh-3.25rem)]">{children}</main>
      </body>
    </html>
  );
}
