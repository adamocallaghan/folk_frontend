'use client';

import React, { useEffect, useState } from 'react';
import { Users, Plus, Save, RefreshCw, CheckCircle2 } from 'lucide-react';
import { listStudentProfiles, upsertStudentProfile } from '@/lib/api';
import { LongitudinalProfile } from '@/types';
import CognitiveRadar from '@/components/CognitiveRadar';
import { useTheme } from '@/context/ThemeContext';

export default function TeacherStudentsPage() {
  const { theme } = useTheme();
  const isRefined = theme === 'refined';

  const [students, setStudents] = useState<LongitudinalProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState<number>(14);
  const [gradeLevel, setGradeLevel] = useState('Grade 7-8');
  const [readingLevel, setReadingLevel] = useState('Grade 7-8 (Standard)');
  const [selectedDiffFlags, setSelectedDiffFlags] = useState<string[]>([]);
  const [selectedModalities, setSelectedModalities] = useState<string[]>([
    'Visual Diagrams',
    'Step-by-Step Chunking',
    'Concrete Analogies',
  ]);
  const [teacherNotes, setTeacherNotes] = useState('');

  const difficultyOptions = [
    'Dyslexia / Visual Reader',
    'Needs Chunked Explanations',
    'Needs Extra Worked Examples',
    'Math/Formula Friction (Needs Conceptual First)',
    'English Language Learner (ESL)',
    'Attention / Short Pacing Segments',
  ];

  const modalityOptions = [
    'Visual Diagrams',
    'Concrete Analogies',
    'Step-by-Step Chunking',
    'Flowchart Scaffolds',
    'Socratic Q&A Checks',
    'Audio SSML Narration',
    'Thought Experiments',
  ];

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const res = await listStudentProfiles();
      setStudents(res.profiles || []);
      if (res.profiles && res.profiles.length > 0 && !selectedStudentId) {
        populateForm(res.profiles[0]);
      }
    } catch (err) {
      console.warn('Failed to load student profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const populateForm = (profile: LongitudinalProfile) => {
    setSelectedStudentId(profile.student_id);
    setStudentId(profile.student_id);
    setDisplayName(profile.display_name || profile.student_id);
    setAge(profile.age || 14);
    setGradeLevel(profile.grade_level || 'Grade 7-8');
    setReadingLevel(profile.reading_level || 'Grade 7-8 (Standard)');
    setSelectedDiffFlags(profile.reading_difficulty_flags || []);
    setSelectedModalities(profile.modalities_flags || profile.learning_style_affinities || ['Visual Diagrams', 'Step-by-Step Chunking']);
    setTeacherNotes(profile.teacher_notes || '');
    setSavedSuccess(false);
  };

  const startNewStudent = () => {
    const newId = `student_${Math.random().toString(36).substring(2, 7)}`;
    setSelectedStudentId(null);
    setStudentId(newId);
    setDisplayName('');
    setAge(14);
    setGradeLevel('Grade 7-8');
    setReadingLevel('Grade 7-8 (Standard)');
    setSelectedDiffFlags([]);
    setSelectedModalities(['Visual Diagrams', 'Concrete Analogies', 'Step-by-Step Chunking']);
    setTeacherNotes('');
    setSavedSuccess(false);
  };

  const toggleFlag = (flag: string) => {
    setSelectedDiffFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

  const toggleModality = (mod: string) => {
    setSelectedModalities((prev) =>
      prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) return;

    setSaving(true);
    try {
      const res = await upsertStudentProfile({
        student_id: studentId.trim(),
        display_name: displayName.trim() || studentId.trim(),
        age: Number(age) || 14,
        grade_level: gradeLevel,
        reading_level: readingLevel,
        reading_difficulty_flags: selectedDiffFlags,
        modalities_flags: selectedModalities,
        learning_style_affinities: selectedModalities,
        teacher_notes: teacherNotes,
      });

      setSavedSuccess(true);
      setSelectedStudentId(res.student_id);
      loadProfiles();
    } catch (err: any) {
      console.error('Failed to save student profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const selectedProfile = students.find((s) => s.student_id === selectedStudentId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 ${isRefined ? 'border-b border-[#1a1714]/15' : 'border-b border-[#1a1714]'}`}>
        <div>
          {!isRefined && <span className="tag-ink mb-1">Teacher Workspace</span>}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1714] font-serif tracking-tight">
            Student Profiles & Accommodations
          </h1>
          <p className="text-xs sm:text-sm text-[#8a8075] mt-1">
            Configure reading difficulty flags, learning modalities, and teacher accommodations.
          </p>
        </div>

        <button
          onClick={startNewStudent}
          className={`flex items-center gap-1.5 transition-all ${
            isRefined
              ? 'bg-[#1a1714] text-[#f5f0e8] hover:bg-[#c84b2f] text-xs font-semibold px-4 py-2'
              : 'btn-ink'
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Student</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Student Roster */}
        <div className={`lg:col-span-4 space-y-3 ${isRefined ? 'border-r border-[#1a1714]/15 pr-6' : 'border border-[#1a1714] bg-[#e9e2d5] p-4'}`}>
          <div className="flex items-center justify-between pb-2">
            <h3 className={`text-xs font-bold text-[#1a1714] flex items-center gap-1.5 ${isRefined ? 'font-sans uppercase tracking-wider text-[#8a8075]' : 'uppercase tracking-wider font-mono'}`}>
              <Users className="h-3.5 w-3.5" />
              Class Roster ({students.length})
            </h3>
            <button
              onClick={loadProfiles}
              className="text-[#1a1714] p-1 hover:text-[#c84b2f] transition-colors"
              title="Refresh roster"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#8a8075]">Loading student profiles...</div>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8a8075]">No students registered yet. Click &quot;Add Student&quot; to create one.</div>
          ) : (
            <div className="space-y-1 max-h-[640px] overflow-y-auto pr-1">
              {students.map((st) => {
                const isSelected = selectedStudentId === st.student_id;

                if (isRefined) {
                  return (
                    <button
                      key={st.student_id}
                      onClick={() => populateForm(st)}
                      className={`w-full text-left p-3 transition-all flex flex-col gap-1 border-b border-[#1a1714]/10 last:border-b-0 ${
                        isSelected
                          ? 'bg-[#1a1714] text-[#f5f0e8]'
                          : 'hover:bg-[#1a1714]/5 text-[#1a1714]'
                      }`}
                    >
                      <div className="flex items-baseline justify-between w-full">
                        <h4 className="font-bold font-serif text-sm">{st.display_name || st.student_id}</h4>
                        <span className={`text-xs ${isSelected ? 'text-[#e8e0d0]' : 'text-[#8a8075]'}`}>
                          {st.grade_level || 'Grade 7-8'}
                        </span>
                      </div>

                      <div className={`flex flex-wrap items-center gap-1.5 text-xs ${isSelected ? 'text-[#e8e0d0]/80' : 'text-[#8a8075]'}`}>
                        <span>{st.reading_level || 'Grade 7-8'}</span>
                        {st.reading_difficulty_flags && st.reading_difficulty_flags.length > 0 && (
                          <span className="text-[#c84b2f]">&bull; {st.reading_difficulty_flags.length} accommodations</span>
                        )}
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={st.student_id}
                    onClick={() => populateForm(st)}
                    className={`w-full text-left p-3 border text-xs transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]'
                        : 'bg-[#f5f0e8] border-[#1a1714] text-[#1a1714] hover:bg-[#ebd9be]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <h4 className="font-bold font-serif text-sm">{st.display_name || st.student_id}</h4>
                      <span className={`font-mono text-[10px] ${isSelected ? 'text-[#ebd9be]' : 'text-[#8a8075]'}`}>
                        {st.student_id}
                      </span>
                    </div>

                    <div className={`flex flex-wrap items-center gap-1.5 text-[10px] pt-1 ${isSelected ? 'text-[#e8e0d0]' : 'text-[#8a8075]'}`}>
                      <span>{st.reading_level || 'Grade 7-8'}</span>
                      {st.reading_difficulty_flags && st.reading_difficulty_flags.length > 0 && (
                        <span className="font-mono font-bold text-[#c84b2f]">&bull; {st.reading_difficulty_flags.length} Accommodations</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Profile Editor & Cognitive Details */}
        <div className="lg:col-span-8 space-y-6">
          <form
            onSubmit={handleSave}
            className={`p-6 space-y-5 ${isRefined ? 'bg-[#ffffff] border border-[#1a1714]/15 shadow-sm' : 'border border-[#1a1714] bg-[#ffffff]'}`}
          >
            <div className={`flex items-center justify-between pb-3 ${isRefined ? 'border-b border-[#1a1714]/10' : 'border-b border-[#1a1714]'}`}>
              <div>
                <h2 className="text-xl font-bold text-[#1a1714] font-serif">
                  {selectedStudentId ? `Edit Student: ${displayName || studentId}` : 'Register Student'}
                </h2>
                <p className="text-xs text-[#8a8075] mt-0.5">
                  Stored under `student_profiles/{studentId}`
                </p>
              </div>

              {savedSuccess && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                </span>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1a1714] mb-1">Student Identifier</label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. g1_sarah_jenkins"
                  className="w-full border border-[#1a1714]/30 bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1a1714] mb-1">Full / Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full border border-[#1a1714]/30 bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1a1714] mb-1">Age & Grade</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="border border-[#1a1714]/30 bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
                    placeholder="Age"
                  />
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="border border-[#1a1714]/30 bg-[#f5f0e8] px-2 py-2 text-xs text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
                  >
                    <option value="Grade 5-6">Grade 5-6</option>
                    <option value="Grade 7-8">Grade 7-8</option>
                    <option value="Grade 9-10">Grade 9-10</option>
                    <option value="Grade 11-12">Grade 11-12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1a1714] mb-1">Assessed Reading Level</label>
                <select
                  value={readingLevel}
                  onChange={(e) => setReadingLevel(e.target.value)}
                  className="w-full border border-[#1a1714]/30 bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
                >
                  <option value="Grade 3-4 (Lower Lexile / Foundational)">Grade 3-4 &bull; Lower Lexile / Foundational</option>
                  <option value="Grade 5-6 (Intermediate)">Grade 5-6 &bull; Intermediate</option>
                  <option value="Grade 7-8 (Standard)">Grade 7-8 &bull; Standard</option>
                  <option value="Grade 9-10 (High School)">Grade 9-10 &bull; High School</option>
                  <option value="Grade 11-12 (Advanced / AP)">Grade 11-12 &bull; Advanced / AP</option>
                </select>
              </div>
            </div>

            {/* Reading Difficulty Flags (Refined chips vs classic boxes) */}
            <div className={`space-y-2 pt-3 ${isRefined ? 'border-t border-[#1a1714]/10' : 'border-t border-[#1a1714]/20'}`}>
              <label className="block text-xs font-semibold text-[#1a1714]">
                Reading & Accessibility Accommodations
              </label>
              <div className="flex flex-wrap gap-2">
                {difficultyOptions.map((opt) => {
                  const isChecked = selectedDiffFlags.includes(opt);

                  if (isRefined) {
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleFlag(opt)}
                        className={`px-3 py-1.5 text-xs transition-all ${
                          isChecked
                            ? 'bg-[#1a1714] text-[#f5f0e8] font-medium'
                            : 'bg-[#f5f0e8] hover:bg-[#1a1714]/10 text-[#1a1714]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  }

                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleFlag(opt)}
                      className={`p-2.5 text-left border text-xs transition-colors flex items-center justify-between min-w-[220px] ${
                        isChecked
                          ? 'bg-[#ebd4cc] border-[#1a1714] font-bold text-[#1a1714]'
                          : 'bg-[#f5f0e8] border-[#1a1714]/40 text-[#1a1714] hover:border-[#1a1714]'
                      }`}
                    >
                      <span>{opt}</span>
                      <span className={`text-[10px] font-mono ${isChecked ? 'text-[#c84b2f] font-bold' : 'text-[#8a8075]'}`}>
                        {isChecked ? 'FLAGGED' : '+ ADD'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modalities & Affinities */}
            <div className={`space-y-2 pt-3 ${isRefined ? 'border-t border-[#1a1714]/10' : 'border-t border-[#1a1714]/20'}`}>
              <label className="block text-xs font-semibold text-[#1a1714]">
                Preferred Learning Modalities
              </label>
              <div className="flex flex-wrap gap-2">
                {modalityOptions.map((opt) => {
                  const isChecked = selectedModalities.includes(opt);

                  if (isRefined) {
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleModality(opt)}
                        className={`px-3 py-1.5 text-xs transition-all ${
                          isChecked
                            ? 'bg-[#1a1714] text-[#f5f0e8] font-medium'
                            : 'bg-[#f5f0e8] hover:bg-[#1a1714]/10 text-[#1a1714]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  }

                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleModality(opt)}
                      className={`p-2.5 text-left border text-xs transition-colors flex items-center justify-between min-w-[220px] ${
                        isChecked
                          ? 'bg-[#cbd7c7] border-[#1a1714] font-bold text-[#1a1714]'
                          : 'bg-[#f5f0e8] border-[#1a1714]/40 text-[#1a1714] hover:border-[#1a1714]'
                      }`}
                    >
                      <span>{opt}</span>
                      <span className={`text-[10px] font-mono ${isChecked ? 'text-[#1a1714] font-bold' : 'text-[#8a8075]'}`}>
                        {isChecked ? 'ACTIVE' : '+ ADD'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Teacher Directives */}
            <div className={`space-y-1.5 pt-3 ${isRefined ? 'border-t border-[#1a1714]/10' : 'border-t border-[#1a1714]/20'}`}>
              <label className="block text-xs font-semibold text-[#1a1714]">
                Teacher Directives & Pedagogical Notes
              </label>
              <textarea
                rows={3}
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder="e.g. Focus on concrete analogies before introducing mathematical equations; thrives with visual schematics."
                className="w-full border border-[#1a1714]/30 bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] placeholder-[#8a8075] focus:outline-none focus:border-[#1a1714]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className={isRefined ? 'bg-[#1a1714] text-[#f5f0e8] hover:bg-[#c84b2f] text-xs font-semibold px-6 py-2.5 flex items-center gap-1.5' : 'btn-ink flex items-center gap-1.5'}
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>

          {/* Longitudinal Cognitive Radar */}
          {selectedProfile && selectedProfile.mastery_map && Object.keys(selectedProfile.mastery_map).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#1a1714] font-serif">Longitudinal Mastery & Growth</h3>
              <CognitiveRadar profile={selectedProfile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
