import {
  LessonPackage,
  LongitudinalProfile,
  SessionEvaluation,
  RemediationPlan,
} from '@/types';

// In browser, route requests through internal Next.js authenticated proxy
const BACKEND_URL =
  typeof window !== 'undefined'
    ? '/api/proxy'
    : (process.env.BACKEND_URL || 'https://folk-agent-workflows-897366780891.us-east1.run.app');

export interface CurriculumGenerateRequest {
  teacher_input: string;
  target_age_group: string;
  enable_audio?: boolean;
  enable_simplification?: boolean;
  target_student_id?: string;
}

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

export async function fetchHealth(): Promise<{ status: string }> {
  try {
    const res = await fetch(`${BACKEND_URL}/health`, { cache: 'no-store' });
    if (!res.ok) return { status: 'offline' };
    return res.json();
  } catch {
    return { status: 'offline' };
  }
}

export async function generateCurriculum(
  payload: CurriculumGenerateRequest
): Promise<{ status: string; package_id: string; curriculum: LessonPackage }> {
  const res = await fetch(`${BACKEND_URL}/curriculum/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'Failed to generate curriculum');
  }
  return res.json();
}

export async function listAllCurricula(): Promise<{
  status: string;
  total: number;
  curricula: CurriculumSummary[];
}> {
  const res = await fetch(`${BACKEND_URL}/curricula`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to list curricula');
  return res.json();
}

export async function getCurriculumPackage(
  packageId: string
): Promise<{ status: string; package_id: string; curriculum: LessonPackage }> {
  const res = await fetch(`${BACKEND_URL}/curriculum/${packageId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Curriculum package ${packageId} not found.`);
  return res.json();
}

export async function sendStudentChat(payload: {
  student_id: string;
  session_id: string;
  message: string;
  lesson_id?: string;
}): Promise<{ status: string; reply: string; pedagogical_action: string }> {
  const res = await fetch(`${BACKEND_URL}/student/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to send student chat message');
  return res.json();
}

export async function evaluateSession(payload: {
  session_id: string;
  student_id: string;
  lesson_id: string;
  quiz_answers?: { [qId: string]: boolean };
  chat_transcript?: string;
}): Promise<{ status: string; session_evaluation: any }> {
  const res = await fetch(`${BACKEND_URL}/analytics/evaluate-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to evaluate session');
  return res.json();
}

export async function getStudentProfile(
  studentId: string
): Promise<{ status: string; student_id: string; profile: LongitudinalProfile }> {
  const res = await fetch(`${BACKEND_URL}/student/profile/${studentId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Student profile ${studentId} not found`);
  return res.json();
}

export async function listStudentProfiles(): Promise<{
  status: string;
  total: number;
  profiles: LongitudinalProfile[];
}> {
  const res = await fetch(`${BACKEND_URL}/student/profiles`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to list student profiles');
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
  learning_style_affinities?: string[];
  teacher_notes?: string;
  mastery_map?: Record<string, any>;
  recurrent_misconceptions?: string[];
  scaffolding_recommendations?: string[];
}): Promise<{ status: string; student_id: string; profile: any }> {
  const res = await fetch(`${BACKEND_URL}/student/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save student profile');
  return res.json();
}

export async function sendTeacherDiscovery(payload: {
  teacher_id: string;
  query?: string;
  message?: string;
  target_student_id?: string;
  student_id?: string;
}): Promise<{ status: string; reply: string; pedagogical_action: string }> {
  const res = await fetch(`${BACKEND_URL}/governance/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to send teacher discovery query');
  return res.json();
}

export async function getRemediationPlan(
  studentId: string
): Promise<{ status: string; plan: RemediationPlan }> {
  const res = await fetch(`${BACKEND_URL}/remediation/plan/${studentId}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch remediation plan');
  return res.json();
}

export async function approveRemediationPlan(
  planOrPayload: string | { plan_id: string; student_id?: string; approved?: boolean; teacher_id?: string; teacher_comments?: string }
): Promise<{ status: string; message: string }> {
  const planId = typeof planOrPayload === 'string' ? planOrPayload : planOrPayload.plan_id;
  const body = typeof planOrPayload === 'object' ? JSON.stringify(planOrPayload) : undefined;
  const res = await fetch(`${BACKEND_URL}/remediation/plan/${planId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) throw new Error('Failed to approve remediation plan');
  return res.json();
}

export const approveRemediation = approveRemediationPlan;
