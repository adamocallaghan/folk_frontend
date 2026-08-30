'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, UserCheck, GraduationCap, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';

  const { theme } = useTheme();
  const isRefined = theme === 'refined';

  const [roleTab, setRoleTab] = useState<'teacher' | 'student'>('teacher');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (role: 'teacher' | 'student') => {
    setRoleTab(role);
    setError(null);
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          role: roleTab,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      const dest = redirectTarget || data.redirect || (roleTab === 'teacher' ? '/teacher/curriculum' : '/student');
      router.push(dest);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-md space-y-6 ${
      isRefined
        ? 'bg-[#ffffff] border border-[#1a1714]/15 p-8 shadow-sm'
        : 'bg-[#ebd9be] border border-[#1a1714] p-8 shadow-[4px_4px_0px_0px_#1a1714]'
    }`}>
      {/* Title */}
      <div className="space-y-1 text-center">
        <span className={isRefined ? 'text-xs uppercase tracking-wider text-[#8a8075] font-medium' : 'tag-ink mb-1'}>
          Folk Agents Platform
        </span>
        <h1 className="text-3xl font-bold text-[#1a1714] font-serif tracking-tight">
          Sign In
        </h1>
        <p className="text-xs text-[#8a8075]">
          Access the curriculum synthesis workspace & personalized student portal.
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className={`grid grid-cols-2 gap-1 p-1 ${
        isRefined ? 'bg-[#f5f0e8] border border-[#1a1714]/15' : 'bg-[#e8e0d0] border border-[#1a1714]'
      }`}>
        <button
          type="button"
          onClick={() => handleTabChange('teacher')}
          className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            roleTab === 'teacher'
              ? isRefined
                ? 'bg-[#ffffff] text-[#1a1714] shadow-sm'
                : 'bg-[#1a1714] text-[#f5f0e8]'
              : 'text-[#8a8075] hover:text-[#1a1714]'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Teacher / Admin</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('student')}
          className={`py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            roleTab === 'student'
              ? isRefined
                ? 'bg-[#ffffff] text-[#1a1714] shadow-sm'
                : 'bg-[#1a1714] text-[#f5f0e8]'
              : 'text-[#8a8075] hover:text-[#1a1714]'
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Student Portal</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 bg-[#ebd4cc] border border-[#1a1714]/30 text-xs text-[#1a1714] flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[#c84b2f] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#1a1714] mb-1">
            {roleTab === 'teacher' ? 'Username' : 'Student Name / ID'}
          </label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={roleTab === 'teacher' ? 'Enter username...' : 'Enter student ID...'}
            className="w-full border border-[#1a1714]/30 bg-[#f5f0e8] px-3.5 py-2.5 text-xs text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#1a1714] mb-1">
            {roleTab === 'teacher' ? 'Password' : 'Classroom PIN / Password'}
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-[#1a1714]/30 bg-[#f5f0e8] px-3.5 py-2.5 text-xs text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
            />
            <Lock className="h-3.5 w-3.5 absolute right-3 top-3 text-[#8a8075]" />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
              isRefined
                ? 'bg-[#1a1714] text-[#f5f0e8] hover:bg-[#c84b2f]'
                : 'btn-ink w-full py-3'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In as {roleTab === 'teacher' ? 'Teacher' : 'Student'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-[#8a8075]">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
