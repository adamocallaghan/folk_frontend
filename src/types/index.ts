export interface DiagramItem {
  diagram_id?: string;
  title?: string;
  caption?: string;
  diagram_type?: string;
  mermaid_code?: string;
  mermaid_syntax?: string;
  syntax?: string;
}

export interface VisualAssetsPackage {
  mermaid_diagram_syntax?: string;
  diagram_caption?: string;
  diagrams?: DiagramItem[];
  ascii_fallback_diagram?: string;
}

export interface LessonSectionItem {
  section_id?: string;
  title?: string;
  section_title?: string;
  heading?: string;
  body_markdown?: string;
  body_text?: string;
  content?: string;
  key_concepts?: string[];
  checkpoint_question?: string;
  check_for_understanding_prompt?: string;
  estimated_minutes?: number;
  learning_objectives?: string[];
}

export interface PrimaryLessonText {
  lesson_title?: string;
  introduction?: string;
  reading_level?: string;
  estimated_lexile_level?: string;
  sections?: LessonSectionItem[];
  main_content_sections?: LessonSectionItem[];
  conclusion?: string;
  key_takeaways?: string[];
  glossary?: Array<{ term: string; definition: string }>;
}

export interface QuizQuestionItem {
  question_id?: string;
  id?: string;
  prompt?: string;
  question?: string;
  question_text?: string;
  text?: string;
  options?: string[];
  correct_answer?: string;
  hint?: string;
  socratic_hint?: string;
  question_type?: string;
}

export interface AssessmentPackage {
  quiz_title?: string;
  passing_score?: number;
  questions?: QuizQuestionItem[];
}

export interface AudioSegmentItem {
  speaker_role?: string;
  voice_tone?: string;
  ssml_content?: string;
}

export interface AudioPackage {
  audio_enabled?: boolean;
  estimated_duration_seconds?: number;
  segments?: AudioSegmentItem[];
}

export interface SimplifiedVariation {
  simplified_lexile_level?: string;
  simplified_text?: string;
  adapted_metaphors?: string[];
}

export interface LessonFramework {
  topic?: string;
  target_age_group?: string;
  pedagogical_hook?: string;
  prerequisites?: string[];
  core_summary?: string;
  sections?: any[];
  lesson_outline?: any[];
  total_duration_minutes?: number;
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

export interface LongitudinalProfile {
  student_id: string;
  reading_level: string;
  learning_style_affinities: string[];
  mastery_map: Record<string, {
    concept_name: string;
    mastery_percentage: number;
    attempts: number;
    last_tested_date: string;
    status: string;
  }>;
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
  cognitive_load_index: string;
  active_inquiry_level: string;
  immediate_takeaways: string[];
  evaluated_at?: string;
}

export interface RemediationPlan {
  plan_id: string;
  student_id: string;
  created_at: string;
  identified_learning_gaps: string[];
  proposed_interventions: Array<{
    rule_id: string;
    action_type: string;
    description: string;
  }>;
  status: string;
  expected_outcome: string;
  teacher_notes?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
