/**
 * ============================================================================
 * Centralized TypeScript Interface & Domain Type Definitions
 * Mirroring FastAPI Pydantic Models & Supabase PostgreSQL Database Schema
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. Core Enumerations & Database Domain Types
// ----------------------------------------------------------------------------

export type UserRole = 'student' | 'mentor' | 'admin';

export type DoubtStatus = 'pending' | 'matched' | 'resolved' | 'cancelled';

export type UrgencyLevel = 'Standard' | 'Urgent';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

// ----------------------------------------------------------------------------
// 2. FastAPI Mirror: Authenticated User Model (auth.py)
// ----------------------------------------------------------------------------

export interface AuthenticatedUser {
  id: string;
  email?: string | null;
  role: string | UserRole;
  aud?: string | null;
  app_metadata: {
    provider?: string;
    providers?: string[];
    role?: string;
    [key: string]: unknown;
  };
  user_metadata: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    role?: string;
    education_level?: string;
    headline?: string;
    bio?: string;
    [key: string]: unknown;
  };
}

// ----------------------------------------------------------------------------
// 3. FastAPI Mirror: Structured Doubt & Classifier Models (classifier.py)
// ----------------------------------------------------------------------------

export interface StructuredDoubt {
  title: string;
  description: string;
  category: string;
  tags: string[];
  urgency: UrgencyLevel | string;
}

export interface ClassifyDoubtRequest {
  transcript: string;
}

export interface ClassifyDoubtResponse {
  success: boolean;
  raw_transcript: string;
  structured_doubt: StructuredDoubt;
  processing_time_ms: number;
}

// ----------------------------------------------------------------------------
// 4. FastAPI Mirror: Semantic Mentor Matching Models (embedding_service.py)
// ----------------------------------------------------------------------------

export interface MentorMatchResult {
  mentor_id: string;
  full_name: string;
  headline: string;
  bio?: string | null;
  expertise_tags: string[];
  rating: number;
  similarity: number;
  match_percentage: string;
}

export interface MatchMentorRequest {
  title: string;
  description?: string;
  category?: string;
  match_count?: number;
  match_threshold?: number;
}

export interface MatchMentorResponse {
  success: boolean;
  query_title: string;
  query_category?: string | null;
  embedding_dimensions: number;
  matches: MentorMatchResult[];
  processing_time_ms: number;
}

// ----------------------------------------------------------------------------
// 5. FastAPI Mirror: Roadmap Generator Models (roadmap_service.py)
// ----------------------------------------------------------------------------

export interface ResourceItem {
  name: string;
  url: string;
  type: 'docs' | 'github' | 'tutorial' | 'course' | string;
}

export interface ProjectCheckpoint {
  title: string;
  deliverable: string;
}

export interface Milestone {
  id: number;
  title: string;
  description: string;
  week_number?: number;
  key_topics: string[];
  project_checkpoint: ProjectCheckpoint | string;
  checkpoint_project?: string;
  estimated_hours: number;
  subtasks: string[];
  resources: ResourceItem[];
  key_skills: string[];
}

export interface StructuredRoadmap {
  title: string;
  track_title?: string;
  summary: string;
  estimated_weeks: number;
  total_estimated_hours: number;
  skill_level: string;
  target_timeline: string;
  milestones: Milestone[];
}

export interface GenerateRoadmapRequest {
  student_goal: string;
  current_skill_level?: string;
  target_timeline?: string;
  focus_areas?: string[];
}

export interface GenerateRoadmapResponse {
  success: boolean;
  student_goal: string;
  roadmap: StructuredRoadmap;
  processing_time_ms: number;
}

// ----------------------------------------------------------------------------
// 6. FastAPI Mirror: Persisted Roadmap & Storage Models (roadmap_storage.py)
// ----------------------------------------------------------------------------

export interface PersistedMilestone {
  id: string;
  roadmap_id: string;
  step_number: number;
  title: string;
  description?: string | null;
  estimated_hours: number;
  subtasks: string[];
  resources: Array<Record<string, unknown> | ResourceItem>;
  checkpoint_project?: string | null;
  key_skills: string[];
  is_completed: boolean;
  completed_at?: string | null;
  created_at: string;
}

export interface PersistedRoadmap {
  id: string;
  student_id: string;
  goal: string;
  track_title: string;
  summary?: string | null;
  total_estimated_hours: number;
  skill_level: string;
  target_timeline: string;
  is_active: boolean;
  progress_percentage: number;
  milestones: PersistedMilestone[];
  created_at: string;
  updated_at: string;
}

export interface SaveRoadmapRequest {
  student_goal: string;
  roadmap: StructuredRoadmap | Record<string, unknown>;
}

export interface SaveRoadmapResponse {
  success: boolean;
  roadmap_id: string;
  saved_roadmap: PersistedRoadmap;
  milestone_count: number;
  processing_time_ms: number;
}

// ----------------------------------------------------------------------------
// 7. FastAPI Mirror: Audio Processing Response (main.py)
// ----------------------------------------------------------------------------

export interface AudioProcessingResponse {
  success: boolean;
  transcript: string;
  structured_doubt?: StructuredDoubt | null;
  file_name: string;
  file_size_bytes: number;
  audio_format: string;
  duration_seconds?: number | null;
  processing_time_ms: number;
  user_id: string;
  user_role: string;
}

// ----------------------------------------------------------------------------
// 8. Supabase PostgreSQL Relational Schema Entities (schema.sql)
// ----------------------------------------------------------------------------

export interface ProfileRow {
  id: string; // references auth.users(id)
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface StudentRow {
  id: string; // references public.profiles(id)
  education_level?: string | null;
  learning_goals?: string | null;
  learning_interests: string[];
  created_at: string;
  updated_at: string;
}

export interface MentorRow {
  id: string; // references public.profiles(id)
  headline?: string | null;
  bio?: string | null;
  expertise_tags: string[];
  skill_embedding?: number[] | null; // 384-dimensional vector
  is_available: boolean;
  rating: number;
  resolved_count: number;
  created_at: string;
  updated_at: string;
}

export interface DoubtRow {
  id: string;
  student_id: string;
  title: string;
  description: string;
  audio_url?: string | null;
  transcript?: string | null;
  category: string;
  tags: string[];
  status: DoubtStatus;
  urgency: UrgencyLevel | string;
  embedding?: number[] | null; // 384-dimensional vector
  matched_mentor_ids: string[];
  assigned_mentor_id?: string | null;
  answer?: string | null;
  answered_by_name?: string | null;
  answered_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoadmapRow {
  id: string;
  student_id: string;
  goal: string;
  track_title: string;
  summary?: string | null;
  total_estimated_hours: number;
  skill_level: string;
  target_timeline: string;
  is_active: boolean;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface MilestoneRow {
  id: string;
  roadmap_id: string;
  step_number: number;
  title: string;
  description?: string | null;
  estimated_hours: number;
  subtasks: string[];
  resources: Array<Record<string, unknown>>;
  checkpoint_project?: string | null;
  key_skills: string[];
  is_completed: boolean;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------------
// 9. Frontend View Models & UI State Helpers
// ----------------------------------------------------------------------------

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  specialization?: string[];
}

export interface Doubt {
  id: string;
  title: string;
  description: string;
  audioUrl?: string;
  audio_url?: string;
  studentId: string;
  student_id?: string;
  studentName?: string;
  createdAt: string;
  created_at?: string;
  status: DoubtStatus;
  category: string;
  matchedMentors?: string[];
  matched_mentor_ids?: string[];
  similarityScore?: number;
  tags?: string[];
  transcript?: string;
  urgency?: UrgencyLevel | string;
  answer?: string;
  answeredBy?: string;
  answered_by_name?: string;
  answeredAt?: string;
  answered_at?: string;
}

export interface RoadmapMilestone {
  id: string | number;
  title: string;
  description: string;
  category?: string;
  estimatedHours?: number;
  estimated_hours?: number;
  completed?: boolean;
  is_completed?: boolean;
  resources?: Array<string | ResourceItem | Record<string, unknown>>;
  subtasks?: string[];
  key_skills?: string[];
  checkpoint_project?: string;
}

export interface SystemMetrics {
  totalQueries: number;
  activeStudents: number;
  activeMentors: number;
  avgResolutionTimeMin: number;
  resolutionHistory: { time: string; avgMinutes: number; count: number }[];
  categoryBreakdown: { name: string; value: number }[];
  systemUptime: string;
}
