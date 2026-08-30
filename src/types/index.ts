export type TargetAgeGroup =
  | 'Grade 5-6 (10-12yo)'
  | 'Grade 7-8 (12-14yo)'
  | 'Grade 9-10 (14-16yo)'
  | 'Grade 11-12 (16-18yo)';

export interface LessonOutlineSection {
  section_id: string;
  title: string;
  learning_objectives: string[];
  estimated_minutes: number;
  key_concepts: string[];
}

export interface LessonFramework {
  topic: string;
  target_age_group: string;
  prerequisites: string[];
  pedagogical_hook: string;
  sections: LessonOutlineSection[];
  core_summary: string;
}

export interface LessonSectionItem {
  section_id?: string;
  id?: string;
  title?: string;
  heading?: string;
  section_title?: string;
  body_markdown?: string;
  body_text?: string;
  content?: string;
  callout_box?: string;
  key_concepts?: string[];
  estimated_minutes?: number;
  checkpoint_question?: string;
  check_for_understanding_prompt?: string;
}

export interface PrimaryLessonText {
  lesson_title: string;
  reading_level: string;
  introduction: string;
  sections?: LessonSectionItem[];
  main_content_sections?: LessonSectionItem[];
  conclusion: string;
  glossary?: Record<string, string>;
}

export interface VisualBlueprint {
  diagram_id?: string;
  id?: string;
  title?: string;
  diagram_type?: 'mermaid_flowchart' | 'mermaid_sequence' | 'mermaid_mindmap' | 'mermaid_er';
  mermaid_code?: string;
  mermaid_syntax?: string;
  syntax?: string;
  caption?: string;
  type?: string;
}

export type DiagramItem = VisualBlueprint;

export interface VisualAssetsPackage {
  diagrams?: VisualBlueprint[];
  mermaid_diagram_syntax?: string;
  diagram_caption?: string;
}

export interface QuizQuestion {
  question_id?: string;
  id?: string;
  question_type?: 'multiple_choice' | 'true_false' | 'concept_check' | 'short_answer';
  prompt?: string;
  question_text?: string;
  question?: string;
  text?: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  hint?: string;
  socratic_hint?: string;
}

export type QuizQuestionItem = QuizQuestion;

export interface AssessmentPackage {
  quiz_title: string;
  passing_score: number;
  questions: QuizQuestion[];
}

export interface AudioSegmentItem {
  segment_id: string;
  speaker_role?: string;
  text?: string;
  ssml_content?: string;
  ssml_markup?: string;
  duration_seconds_estimate?: number;
  voice_tone?: string;
}

export interface AudioPackage {
  audio_enabled: boolean;
  episode_title?: string;
  style?: string;
  segments: AudioSegmentItem[];
}

export interface SimplifiedVariation {
  needed_for_reading_level?: string;
  simplified_lexile_level?: string;
  simplified_introduction?: string;
  simplified_text?: string;
  simplified_sections?: LessonSectionItem[];
  vocabulary_scaffolding?: Record<string, string>;
}

export interface WorkedExampleStep {
  step_number: number;
  step_title: string;
  explanation: string;
  key_insight?: string;
}

export interface WorkedExampleItem {
  example_id: string;
  title: string;
  problem_or_scenario: string;
  steps: WorkedExampleStep[];
  core_takeaway: string;
}

export interface ConceptualAnalogyItem {
  analogy_id: string;
  concept_name: string;
  real_world_analogy: string;
  thought_experiment_prompt: string;
  why_it_works: string;
}

export interface LessonPackage {
  package_id: string;
  topic?: string;
  created_at: string;
  target_age_group: string;
  framework?: LessonFramework;
  primary_text?: PrimaryLessonText;
  visuals?: VisualAssetsPackage;
  visual_assets?: VisualAssetsPackage;
  assessment?: AssessmentPackage;
  audio?: AudioPackage;
  audio_package?: AudioPackage;
  simplified_variation?: SimplifiedVariation;
  worked_examples?: WorkedExampleItem[];
  worked_examples_package?: { examples: WorkedExampleItem[] };
  conceptual_analogies?: ConceptualAnalogyItem[];
  conceptual_analogies_package?: { analogies: ConceptualAnalogyItem[] };
  metadata?: Record<string, any>;
}

export interface MasteryRecord {
  concept: string;
  mastery_percentage: number;
  attempts: number;
  status: 'Mastered' | 'Developing' | 'Needs Intervention';
  last_evaluated: string;
}

export interface RemediationRule {
  rule_id: string;
  action_type: 'insert_visual_scaffold' | 'simplify_lexile' | 'inject_analogy' | 'chunk_pacing' | 'analogy_anchoring' | 'worked_example_anchoring' | string;
  description: string;
  target_concept?: string;
}

export interface RemediationPlan {
  plan_id: string;
  student_id: string;
  created_at: string;
  identified_learning_gaps: string[];
  proposed_interventions: RemediationRule[];
  status: 'proposed' | 'approved' | 'rejected' | 'active';
  expected_outcome: string;
}

export interface LongitudinalProfile {
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
  active_remediation_rules?: RemediationRule[];
  cognitive_growth_trend?: string;
  total_sessions_completed?: number;
  updated_at?: string;
}

export interface SessionEvaluation {
  session_id: string;
  student_id: string;
  lesson_id: string;
  comprehension_score: number;
  cognitive_load_index: 'Low (Boredom Risk)' | 'Optimal (Zone of Proximal Development)' | 'High (Cognitive Overload)';
  demonstrated_mastery: string[];
  misconceptions_detected: string[];
  recommended_next_action: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
