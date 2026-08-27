import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Folk OS - Multi-Agent Pedagogical Platform',
  description: 'Autonomous multi-agent educational operating system powered by Google ADK and Gemini 3.7',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090b] text-[#fafafa] min-h-screen antialiased">
        <Header />
        <main className="min-h-[calc(100vh-3.25rem)]">{children}</main>
      </body>
    </html>
  );
}
