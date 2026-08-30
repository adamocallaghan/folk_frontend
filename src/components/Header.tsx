'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Users, Compass, LogOut, UserCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const isRefined = theme === 'refined';

  const [userSession, setUserSession] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setUserSession(data.user);
        } else {
          setUserSession(null);
        }
      })
      .catch(() => setUserSession(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUserSession(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      router.push('/login');
    }
  };

  const navItems = [
    { href: '/teacher/curriculum', label: 'Curriculum Studio', icon: BookOpen },
    { href: '/teacher/students', label: 'Student Profiles', icon: Users },
    { href: '/student', label: 'Student Lessons', icon: Compass },
    { href: '/teacher/governance', label: 'Teacher Governance', icon: Users },
  ];

  if (pathname === '/login') {
    return (
      <header className="sticky top-0 z-50 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#1a1714]/15 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link href="/login" className="flex items-center gap-2.5">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1a1714]">
                Folk
              </span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#1a1714]/15 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1a1714]">
              Folk
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-[#1a1714] font-bold border-b-2 border-[#1a1714] pb-0.5'
                      : 'text-[#8a8075] hover:text-[#1a1714]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Session Badge & Actions */}
          <div className="flex items-center gap-4">
            {userSession && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#1a1714]">
                <UserCheck className="h-3.5 w-3.5 text-[#c84b2f]" />
                <span className="font-medium">{userSession.username}</span>
                <span className="text-[10px] text-[#8a8075]">({userSession.role})</span>
              </div>
            )}

            {userSession && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-[#8a8075] hover:text-[#c84b2f] transition-colors py-1 px-2 border border-[#1a1714]/15 hover:border-[#c84b2f]"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
