export interface DiagramItem {
  diagram_id?: string;
  id?: string;
  title?: string;
  diagram_title?: string;
  type?: string;
  diagram_type?: string;
  syntax?: string;
  mermaid_syntax?: string;
  mermaid_code?: string;
  caption?: string;
  diagram_caption?: string;
  educational_focus?: string;
}

export interface LessonSectionItem {
  section_id?: string;
  id?: string;
  title?: string;
  section_title?: string;
  heading?: string;
  body_markdown?: string;
  body_text?: string;
  content?: string;
  estimated_minutes?: number;
  key_concepts?: string[];
  checkpoint_question?: string;
  check_for_understanding_prompt?: string;
}

export interface QuizQuestionItem {
  question_id?: string;
  id?: string;
  type?: string;
  question_type?: string;
  prompt?: string;
  question_text?: string;
  question?: string;
  text?: string;
  options?: string[];
  correct_answer?: string;
  explanation?: string;
  hint?: string;
  socratic_hint?: string;
  misconception_targeted?: string;
}

export interface AudioSegmentItem {
  speaker_role?: string;
  voice_tone?: string;
  ssml_content?: string;
  estimated_duration_sec?: number;
}

export interface LessonPackage {
  package_id: string;
  topic?: string;
  target_age_group?: string;
  framework?: {
    topic?: string;
    target_age_group?: string;
    pedagogical_hook?: string;
    learning_objectives?: string[];
    prerequisites?: string[];
  };
  primary_text?: {
    lesson_title?: string;
    introduction?: string;
    sections?: LessonSectionItem[];
    main_content_sections?: LessonSectionItem[];
    conclusion?: string;
    glossary?: { [term: string]: string };
  };
  visuals?: {
    mermaid_diagram_syntax?: string;
    diagram_caption?: string;
    diagrams?: DiagramItem[];
  };
  visual_assets?: {
    mermaid_diagram_syntax?: string;
    diagram_caption?: string;
    diagrams?: DiagramItem[];
  };
  assessment?: {
    quiz_title?: string;
    passing_score?: number;
    questions?: QuizQuestionItem[];
  };
  assessment_package?: {
    quiz_title?: string;
    passing_score?: number;
    questions?: QuizQuestionItem[];
  };
  audio?: {
    segments?: AudioSegmentItem[];
  };
  audio_package?: {
    segments?: AudioSegmentItem[];
  };
  simplified_variation?: {
    simplified_text?: string;
    simplified_lexile_level?: string;
    vocabulary_glossary?: { [term: string]: string };
  };
}

export interface LongitudinalProfile {
  student_id: string;
  display_name?: string;
  age?: number;
  grade_level?: string;
  reading_level?: string;
  reading_difficulty_flags?: string[];
  modalities_flags?: string[];
  teacher_notes?: string;
  total_sessions_completed?: number;
  cognitive_growth_trend?: string;
  mastery_map?: {
    [concept: string]: {
      concept_name?: string;
      mastery_percentage: number;
      status: string;
      attempts: number;
      last_assessed?: string;
    };
  };
  recurrent_misconceptions?: string[];
  learning_style_affinities?: string[];
  scaffolding_recommendations?: string[];
  updated_at?: string;
}

export interface RemediationPlan {
  plan_id: string;
  student_id: string;
  created_at: string;
  identified_learning_gaps: string[];
  proposed_interventions: {
    rule_id: string;
    action_type: string;
    description: string;
  }[];
  status: string;
  expected_outcome: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
