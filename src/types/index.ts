export interface LessonSection {
  section_title?: string;
  title?: string;
  duration_minutes?: number;
  estimated_minutes?: number;
  learning_objective?: string;
  learning_objectives?: string[];
  core_concepts?: string[];
  key_concepts?: string[];
}

export interface LessonFramework {
  topic: string;
  target_age_group: string;
  pedagogical_hook: string;
  prerequisites: string[];
  lesson_outline?: LessonSection[];
  sections?: LessonSection[];
  total_duration_minutes?: number;
}

export interface LessonContentSection {
  heading?: string;
  title?: string;
  body_text?: string;
  content?: string;
  check_for_understanding_prompt?: string;
}

export interface PrimaryLessonText {
  lesson_title?: string;
  introduction?: string;
  main_content_sections?: LessonContentSection[];
  key_takeaways?: string[];
  estimated_lexile_level?: string;
}

export interface VisualAssetsPackage {
  mermaid_diagram_syntax: string;
  diagram_caption?: string;
  ascii_fallback_diagram?: string;
}

export interface QuizQuestion {
  question_id: string;
  question_text: string;
  options?: string[];
  correct_answer: string;
  socratic_hint?: string;
  rubric_criteria?: string;
}

export interface AssessmentPackage {
  quiz_title: string;
  questions: QuizQuestion[];
}

export interface AudioSegment {
  speaker_role: string;
  voice_tone: string;
  ssml_content: string;
}

export interface AudioPackage {
  audio_enabled?: boolean;
  estimated_duration_seconds?: number;
  segments: AudioSegment[];
}

export interface SimplifiedVariation {
  simplified_lexile_level: string;
  simplified_text: string;
  adapted_metaphors?: string[];
}

export interface LessonPackage {
  package_id: string;
  topic?: string;
  target_age_group?: string;
  framework?: LessonFramework;
  primary_text?: PrimaryLessonText;
  visuals?: VisualAssetsPackage;
  visual_assets?: VisualAssetsPackage;
  assessment?: AssessmentPackage;
  audio?: AudioPackage;
  audio_package?: AudioPackage;
  simplified_variation?: SimplifiedVariation | null;
  created_at?: string;
}

export interface MasteryItem {
  concept_name: string;
  mastery_percentage: number;
  attempts: number;
  last_tested_date: string;
  status: "mastered" | "progressing" | "needs_remediation";
}

export interface LongitudinalProfile {
  student_id: string;
  reading_level: string;
  learning_style_affinities: string[];
  mastery_map: Record<string, MasteryItem>;
  recurrent_misconceptions: string[];
  cognitive_growth_trend: string;
  total_sessions_completed: number;
  scaffolding_recommendations: string[];
  last_updated?: string;
}

export interface SessionEvaluation {
  session_id: string;
  student_id: string;
  comprehension_score: number;
  friction_points: string[];
  cognitive_load_index: "Low" | "Optimal" | "High" | "Overloaded";
  active_inquiry_level: "Passive" | "Moderate" | "Highly Curious";
  immediate_takeaways: string[];
  evaluated_at?: string;
}

export interface RemediationRule {
  rule_id: string;
  action_type: string;
  description: string;
}

export interface RemediationPlan {
  plan_id: string;
  student_id: string;
  created_at: string;
  identified_learning_gaps: string[];
  proposed_interventions: RemediationRule[];
  status: "proposed" | "teacher_approved" | "rejected";
  expected_outcome: string;
  teacher_notes?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
