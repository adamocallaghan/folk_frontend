'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Users, Compass, SlidersHorizontal, LogOut, UserCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
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
      <header className={`sticky top-0 z-50 transition-colors ${
        isRefined
          ? 'bg-[#ffffff]/90 backdrop-blur-md border-b border-[#1a1714]/15'
          : 'bg-[#e8e0d0] border-b border-[#1a1714]'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link href="/login" className="flex items-center gap-2.5">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1a1714]">
                Folk Agents
              </span>
            </Link>

            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1 text-[11px] transition-all ${
                isRefined
                  ? 'border border-[#1a1714]/20 hover:border-[#1a1714] text-[#1a1714] px-2.5 py-1'
                  : 'btn-paper py-1 px-2 text-[10px]'
              }`}
            >
              <SlidersHorizontal className="h-3 w-3 text-[#c84b2f]" />
              <span>Style: <strong>{isRefined ? 'Refined' : 'Classic'}</strong></span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  if (isRefined) {
    return (
      <header className="sticky top-0 z-50 bg-[#ffffff]/95 backdrop-blur-md border-b border-[#1a1714]/15 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1a1714]">
                Folk Agents
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
            <div className="flex items-center gap-3">
              {userSession && (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#1a1714]">
                  <UserCheck className="h-3.5 w-3.5 text-[#c84b2f]" />
                  <span className="font-medium">{userSession.username}</span>
                  <span className="text-[10px] text-[#8a8075]">({userSession.role})</span>
                </div>
              )}

              <button
                onClick={toggleTheme}
                className="flex items-center gap-1 text-[11px] border border-[#1a1714]/20 hover:border-[#1a1714] text-[#1a1714] px-2.5 py-1 transition-all"
                title="Toggle UI Aesthetics"
              >
                <SlidersHorizontal className="h-3 w-3 text-[#c84b2f]" />
                <span>Style: <strong>{isRefined ? 'Refined' : 'Classic'}</strong></span>
              </button>

              {userSession && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-[11px] text-[#8a8075] hover:text-[#c84b2f] transition-colors p-1"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Classic Neo-Brutalist Layout
  return (
    <header className="sticky top-0 z-50 bg-[#e8e0d0] border-b border-[#1a1714]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1a1714]">
              Folk Agents
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold border transition-all ${
                    isActive
                      ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]'
                      : 'bg-[#f5f0e8] text-[#1a1714] border-[#1a1714] hover:bg-[#ebd9be]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn-paper flex items-center gap-1 text-[10px] py-1 px-2"
              title="Toggle UI Style"
            >
              <SlidersHorizontal className="h-3 w-3 text-[#c84b2f]" />
              <span>Style: <strong>{isRefined ? 'Refined' : 'Classic'}</strong></span>
            </button>

            {userSession && (
              <button
                onClick={handleLogout}
                className="btn-paper flex items-center gap-1 text-[10px] py-1 px-2"
                title="Sign Out"
              >
                <LogOut className="h-3 w-3" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
