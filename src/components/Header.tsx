'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { fetchHealth } from '@/lib/api';
import { BookOpen, Sparkles, ShieldCheck, Activity, Terminal } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  const navLinks = [
    { name: 'Studio', href: '/teacher/curriculum', icon: Sparkles },
    { name: 'Student Tutoring', href: '/student', icon: BookOpen },
    { name: 'Teacher Governance', href: '/teacher/governance', icon: ShieldCheck },
  ];

  return (
    <header className="border-b border-[#27272a] bg-[#09090b] sticky top-0 z-50">
      <div className="mx-auto flex h-13 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm text-white tracking-tight">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-white text-black font-mono text-xs font-black">
              F
            </span>
            <span>FOLK OS</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    active
                      ? 'bg-[#18181b] text-white border border-[#27272a]'
                      : 'text-[#a1a1aa] hover:text-white hover:bg-[#121215]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121215] border border-[#27272a] font-mono text-[11px]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                online === true ? 'bg-emerald-400' : online === false ? 'bg-rose-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-[#a1a1aa]">Cloud Run:</span>
            <span className="text-white font-semibold">{online ? 'Live' : 'Connecting'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
