import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Folk Education Hub — ADK Multi-Agent Platform",
  description:
    "Next-generation autonomous multi-agent educational ecosystem powered by Google ADK and Gemini 3.7 Flash.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen flex flex-col bg-[#07090e] text-slate-100 selection:bg-indigo-500 selection:text-white">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <footer className="w-full border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500">
          <p>
            Folk Multi-Agent Education System &bull; Powered by Google Agent Development Kit (ADK) &bull; Cloud Run in us-east1
          </p>
        </footer>
      </body>
    </html>
  );
}
