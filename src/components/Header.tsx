'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { fetchHealth } from '@/lib/api';
import { BookOpen, Sparkles, ShieldCheck } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(() => setOnline(true))
      .catch(() => setOnline(false));
  }, []);

  const navLinks = [
    { name: 'Curriculum Studio', href: '/teacher/curriculum', icon: Sparkles },
    { name: 'Student Lessons', href: '/student', icon: BookOpen },
    { name: 'Teacher Governance', href: '/teacher/governance', icon: ShieldCheck },
  ];

  return (
    <header className="border-b border-[#1a1714] bg-[#f5f0e8] sticky top-0 z-50">
      <div className="mx-auto flex h-13 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-base text-[#1a1714] tracking-tight">
            <span className="flex h-6 w-6 items-center justify-center bg-[#1a1714] text-[#f5f0e8] font-mono text-xs font-black">
              F
            </span>
            <span className="font-serif text-lg tracking-normal">Folk</span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]'
                      : 'text-[#1a1714] border-transparent hover:border-[#1a1714] hover:bg-[#e8e0d0]'
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
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#e8e0d0] border border-[#1a1714] font-mono text-[11px]">
            <span
              className={`h-2 w-2 ${
                online === true ? 'bg-emerald-600' : online === false ? 'bg-[#c84b2f]' : 'bg-amber-600 animate-pulse'
              }`}
            />
            <span className="text-[#8a8075]">Backend:</span>
            <span className="text-[#1a1714] font-semibold">{online ? 'Online' : 'Connecting'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
