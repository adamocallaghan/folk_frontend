import { LessonPackage, LongitudinalProfile, RemediationPlan } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export interface CurriculumSummary {
  package_id: string;
  title: string;
  target_age_group: string;
  duration_minutes: number;
  question_count: number;
  has_diagram: boolean;
  has_audio?: boolean;
  has_simplified?: boolean;
  has_worked_examples?: boolean;
  has_analogies?: boolean;
}

export async function fetchHealth() {
  const res = await fetch(`${BACKEND_URL}/api/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function generateCurriculum(payload: {
  teacher_input: string;
  target_age_group?: string;
  enable_audio?: boolean;
  enable_simplification?: boolean;
  package_id?: string;
  target_student_id?: string;
}): Promise<{ status: string; package_id: string; curriculum: LessonPackage }> {
  const res = await fetch(`${BACKEND_URL}/api/curriculum/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to generate curriculum' }));
    throw new Error(err.detail || 'Curriculum synthesis failed');
  }
  return res.json();
}

export async function listAllCurricula(): Promise<{
  status: string;
  count: number;
  curricula: CurriculumSummary[];
}> {
  const res = await fetch(`${BACKEND_URL}/api/curricula`);
  if (!res.ok) throw new Error('Failed to fetch curricula list');
  return res.json();
}

export async function getCurriculumPackage(packageId: string): Promise<{
  status: string;
  package_id: string;
  curriculum: LessonPackage;
}> {
  const res = await fetch(`${BACKEND_URL}/api/curriculum/${packageId}`);
  if (!res.ok) throw new Error(`Failed to load curriculum ${packageId}`);
  return res.json();
}

export async function sendStudentChat(payload: {
  student_id: string;
  session_id: string;
  message: string;
  lesson_id?: string;
}): Promise<{ status: string; reply: string }> {
  const res = await fetch(`${BACKEND_URL}/api/student/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Student chat failed');
  return res.json();
}

export async function evaluateSession(payload: {
  session_id: string;
  student_id: string;
  lesson_id: string;
  quiz_answers: Record<string, any>;
  chat_transcript?: string;
}): Promise<{ status: string; session_evaluation: any }> {
  const res = await fetch(`${BACKEND_URL}/api/analytics/evaluate-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Session evaluation failed');
  return res.json();
}

export async function listStudentProfiles(): Promise<{
  status: string;
  count: number;
  profiles: LongitudinalProfile[];
}> {
  const res = await fetch(`${BACKEND_URL}/api/student/profiles`);
  if (!res.ok) throw new Error('Failed to fetch student profiles');
  return res.json();
}

export async function getStudentProfile(studentId: string): Promise<{
  status: string;
  student_id: string;
  profile: LongitudinalProfile;
}> {
  const res = await fetch(`${BACKEND_URL}/api/student/profile/${studentId}`);
  if (!res.ok) throw new Error(`Student profile ${studentId} not found`);
  return res.json();
}

export async function upsertStudentProfile(payload: {
  student_id: string;
  display_name?: string;
  age?: number;
  grade_level?: string;
  reading_level?: string;
  reading_difficulty_flags?: string[];
  modalities_flags?: string[];
  teacher_notes?: string;
  learning_style_affinities?: string[];
  scaffolding_recommendations?: string[];
}): Promise<{ status: string; student_id: string; profile: LongitudinalProfile }> {
  const res = await fetch(`${BACKEND_URL}/api/student/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save student profile');
  return res.json();
}

export async function sendTeacherDiscovery(payload: {
  teacher_id: string;
  student_id: string;
  message: string;
  session_id?: string;
}): Promise<{ status: string; reply: string }> {
  const res = await fetch(`${BACKEND_URL}/api/teacher/discovery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Teacher discovery failed');
  return res.json();
}

export async function approveRemediation(payload: {
  plan_id: string;
  student_id: string;
  approved: boolean;
  teacher_id: string;
  teacher_comments?: string;
}): Promise<{ status: string; plan_id: string; message: string }> {
  const res = await fetch(`${BACKEND_URL}/api/teacher/approve-remediation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Approval submission failed');
  return res.json();
}
