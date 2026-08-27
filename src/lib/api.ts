import {
  LessonPackage,
  LongitudinalProfile,
  SessionEvaluation,
  RemediationPlan,
} from "@/types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export interface CurriculumSummary {
  package_id: string;
  title: string;
  target_age_group: string;
  duration_minutes: number;
  has_diagram: boolean;
  question_count: number;
  created_at?: string;
}

export async function fetchHealth(): Promise<{
  status: string;
  timestamp: string;
  workflows: string[];
  framework: string;
  model: string;
}> {
  const res = await fetch(`${BACKEND_URL}/api/health`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch health: ${res.statusText}`);
  }
  return res.json();
}

export async function listAllCurricula(): Promise<{
  status: string;
  total: number;
  curricula: CurriculumSummary[];
}> {
  const res = await fetch(`${BACKEND_URL}/api/curricula`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to list curricula: ${res.statusText}`);
  }
  return res.json();
}

export async function generateCurriculum(payload: {
  teacher_input: string;
  target_age_group: string;
  enable_audio?: boolean;
  enable_simplification?: boolean;
  package_id?: string;
}): Promise<{ status: string; package_id: string; curriculum: LessonPackage }> {
  const res = await fetch(`${BACKEND_URL}/api/curriculum/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      enable_audio: true,
      enable_simplification: false,
      ...payload,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Curriculum generation failed: ${err}`);
  }
  return res.json();
}

export async function getCurriculumPackage(
  packageId: string
): Promise<{ status: string; package_id: string; curriculum: LessonPackage }> {
  const res = await fetch(`${BACKEND_URL}/api/curriculum/${packageId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load curriculum package ${packageId}`);
  }
  return res.json();
}

export async function sendStudentChat(payload: {
  student_id: string;
  session_id: string;
  message: string;
  lesson_id?: string;
}): Promise<{
  status: string;
  student_id: string;
  session_id: string;
  reply: string;
  confusions_logged: Array<{ concept: string; details: string }>;
  quiz_state: Record<string, any>;
}> {
  const res = await fetch(`${BACKEND_URL}/api/student/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Student chat failed: ${err}`);
  }
  return res.json();
}

export async function evaluateSession(payload: {
  session_id: string;
  student_id: string;
  lesson_id: string;
  quiz_answers?: Record<string, any>;
  session_confusions?: Array<{ concept: string; details: string }>;
  chat_transcript?: string;
}): Promise<{
  status: string;
  session_id: string;
  student_id: string;
  session_evaluation: SessionEvaluation;
  updated_longitudinal_profile?: LongitudinalProfile;
}> {
  const res = await fetch(`${BACKEND_URL}/api/analytics/evaluate-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quiz_answers: {},
      session_confusions: [],
      chat_transcript: "",
      ...payload,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Session evaluation failed: ${err}`);
  }
  return res.json();
}

export async function getStudentProfile(
  studentId: string
): Promise<{ status: string; student_id: string; profile: LongitudinalProfile }> {
  const res = await fetch(`${BACKEND_URL}/api/student/profile/${studentId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to load profile for ${studentId}`);
  }
  return res.json();
}

export async function sendTeacherDiscovery(payload: {
  teacher_id: string;
  student_id: string;
  message: string;
  session_id?: string;
}): Promise<{
  status: string;
  teacher_id: string;
  student_id: string;
  session_id: string;
  reply: string;
}> {
  const res = await fetch(`${BACKEND_URL}/api/teacher/discovery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Teacher discovery query failed: ${err}`);
  }
  return res.json();
}

export async function approveRemediation(payload: {
  plan_id: string;
  student_id: string;
  approved: boolean;
  teacher_id: string;
  teacher_comments?: string;
  custom_rule_overrides?: Array<{
    rule_id: string;
    action_type: string;
    description: string;
  }>;
}): Promise<{
  status: string;
  plan_id: string;
  approved: boolean;
  message: string;
}> {
  const res = await fetch(`${BACKEND_URL}/api/teacher/approve-remediation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Remediation approval failed: ${err}`);
  }
  return res.json();
}
