'use client';

import React, { useEffect, useState } from 'react';
import { Users, Plus, Save, RefreshCw, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { listStudentProfiles, upsertStudentProfile } from '@/lib/api';
import { LongitudinalProfile } from '@/types';
import CognitiveRadar from '@/components/CognitiveRadar';

export default function TeacherStudentsPage() {
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
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a1714]">
        <div>
          <span className="tag-ink mb-1">Teacher Workspace</span>
          <h1 className="text-3xl font-bold text-[#1a1714] font-serif tracking-tight mt-1">Student Profiles & Accommodations</h1>
          <p className="text-xs text-[#8a8075]">
            Configure reading difficulty flags, learning modalities, and pedagogical accommodations. Lessons generated in Curriculum Studio will tailor content directly to these profiles.
          </p>
        </div>

        <button onClick={startNewStudent} className="btn-ink flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Student</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Student Roster */}
        <div className="lg:col-span-4 border border-[#1a1714] bg-[#e9e2d5] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1a1714]">
            <h3 className="text-xs font-bold text-[#1a1714] uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Users className="h-3.5 w-3.5 text-[#1a1714]" />
              Class Roster ({students.length})
            </h3>
            <button
              onClick={loadProfiles}
              className="text-[#1a1714] p-1 border border-[#1a1714] bg-[#f5f0e8] hover:bg-[#ebd9be]"
              title="Refresh roster"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#8a8075]">Loading student profiles...</div>
          ) : students.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8a8075]">No students registered yet. Click &quot;Add New Student&quot; to create one.</div>
          ) : (
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {students.map((st) => {
                const isSelected = selectedStudentId === st.student_id;
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
          <form onSubmit={handleSave} className="border border-[#1a1714] bg-[#ffffff] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#1a1714]">
              <div>
                <h2 className="text-lg font-bold text-[#1a1714] font-serif">
                  {selectedStudentId ? `Edit Student: ${displayName || studentId}` : 'Register New Student'}
                </h2>
                <p className="text-xs text-[#8a8075]">
                  Persists to Firebase Firestore `student_profiles/{studentId}`
                </p>
              </div>

              {savedSuccess && (
                <span className="tag-ink bg-[#cbd7c7] border-[#1a1714] text-[#1a1714]">
                  <CheckCircle2 className="h-3 w-3" /> Saved to Firestore
                </span>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1714] mb-1 font-mono">STUDENT ID (FIRESTORE KEY)</label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. student_sarah_102"
                  className="w-full border border-[#1a1714] bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1714] mb-1 font-mono">FULL / DISPLAY NAME</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full border border-[#1a1714] bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1714] mb-1 font-mono">AGE & GRADE LEVEL</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="border border-[#1a1714] bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] focus:outline-none"
                    placeholder="Age"
                  />
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="border border-[#1a1714] bg-[#f5f0e8] px-2 py-2 text-xs text-[#1a1714] focus:outline-none"
                  >
                    <option value="Grade 5-6">Grade 5-6</option>
                    <option value="Grade 7-8">Grade 7-8</option>
                    <option value="Grade 9-10">Grade 9-10</option>
                    <option value="Grade 11-12">Grade 11-12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1714] mb-1 font-mono">ASSESSED READING LEVEL</label>
                <select
                  value={readingLevel}
                  onChange={(e) => setReadingLevel(e.target.value)}
                  className="w-full border border-[#1a1714] bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] focus:outline-none"
                >
                  <option value="Grade 3-4 (Lower Lexile / Foundational)">Grade 3-4 &bull; Lower Lexile / Foundational</option>
                  <option value="Grade 5-6 (Intermediate)">Grade 5-6 &bull; Intermediate</option>
                  <option value="Grade 7-8 (Standard)">Grade 7-8 &bull; Standard</option>
                  <option value="Grade 9-10 (High School)">Grade 9-10 &bull; High School</option>
                  <option value="Grade 11-12 (Advanced / AP)">Grade 11-12 &bull; Advanced / AP</option>
                </select>
              </div>
            </div>

            {/* Reading Difficulty Flags */}
            <div className="space-y-2 pt-2 border-t border-[#1a1714]/20">
              <label className="block text-xs font-bold text-[#1a1714] font-mono">
                READING DIFFICULTY & ACCESSIBILITY FLAGS
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {difficultyOptions.map((opt) => {
                  const isChecked = selectedDiffFlags.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleFlag(opt)}
                      className={`p-2.5 text-left border text-xs transition-colors flex items-center justify-between ${
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
            <div className="space-y-2 pt-2 border-t border-[#1a1714]/20">
              <label className="block text-xs font-bold text-[#1a1714] font-mono">
                PREFERRED LEARNING MODALITIES & SCAFFOLDS
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {modalityOptions.map((opt) => {
                  const isChecked = selectedModalities.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleModality(opt)}
                      className={`p-2.5 text-left border text-xs transition-colors flex items-center justify-between ${
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

            {/* Teacher Directives & Pedagogical Notes */}
            <div className="space-y-1.5 pt-2 border-t border-[#1a1714]/20">
              <label className="block text-xs font-bold text-[#1a1714] font-mono">
                TEACHER DIRECTIVES & PEDAGOGICAL NOTES
              </label>
              <textarea
                rows={3}
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                placeholder="e.g. Focus on concrete analogies before introducing mathematical equations; thrives with visual schematics; avoid dense walls of text."
                className="w-full border border-[#1a1714] bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] placeholder-[#8a8075] focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button type="submit" disabled={saving} className="btn-ink flex-1 flex items-center justify-center gap-1.5">
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? 'Saving to Firestore...' : 'Save Student Profile'}</span>
              </button>
            </div>
          </form>

          {/* Longitudinal Cognitive Radar if existing */}
          {selectedProfile && selectedProfile.mastery_map && Object.keys(selectedProfile.mastery_map).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#1a1714] uppercase tracking-wider font-mono">Longitudinal Mastery & Growth</h3>
              <CognitiveRadar profile={selectedProfile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
