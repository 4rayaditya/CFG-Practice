/**
 * ============================================================================
 * Shifting Orbits — Cradle to College Platform
 * Centralized TypeScript Interface & Domain Type Definitions
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. Core Enumerations & Database Domain Types
// ----------------------------------------------------------------------------

export type UserRole = 'student' | 'mentor' | 'admin';

export type DoubtStatus = 'pending' | 'matched' | 'resolved' | 'cancelled';

export type UrgencyLevel = 'Standard' | 'Urgent';

export type PriorityTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL';

export type CradleToCollegeStage = 
  | 'Grade 8 (Middle School)'
  | 'Grade 9 (Early High School)'
  | 'Grade 10 (Secondary Boards)'
  | 'Grade 11 (Senior Secondary)'
  | 'Grade 12 (College Prep & Boards)'
  | 'College 1st Year (Freshman)'
  | 'College 2nd Year (Undergraduate)'
  | 'Vocational & Career Launch';

// ----------------------------------------------------------------------------
// 2. Offline Home Visit Data Models (Speech-to-Text Field Logging)
// ----------------------------------------------------------------------------

export interface OfflineHomeVisit {
  id: string;
  studentId: string;
  studentName: string;
  mentorId: string;
  mentorName: string;
  visitDate: string; // ISO date string
  rawSpeechTranscript: string;
  summary: string;
  livingEnvironment: string;
  academicObservations: string;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  actionItems: string[];
  tags: string[];
  createdAt: string;
}

// ----------------------------------------------------------------------------
// 3. Rule-Based Student Priority Evaluation Models
// ----------------------------------------------------------------------------

export interface StudentPriorityEvaluation {
  score: number; // 0 to 100
  tier: PriorityTier;
  badgeLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  triggeredRules: string[];
  recommendedAction: string;
  requiresUrgentVisit: boolean;
  daysSinceLastVisit: number;
}

// ----------------------------------------------------------------------------
// 4. Student Detailed Dossier Models (15 Underprivileged Students)
// ----------------------------------------------------------------------------

export interface StudentDossier {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  cradleStage: CradleToCollegeStage;
  age: number;
  schoolOrCollege: string;
  dreamCareer: string;
  trackTitle: string;
  attendanceRate: number; // Percentage (e.g. 72%)
  academicScore: number; // Percentage (e.g. 68%)
  learningInterests: string[];
  skillsMastered: string[];
  financialAidStatus: 'Full NGO Scholarship' | 'Subsidized Learning' | 'Hardware/Device Grant';
  assignedMentorId: string;
  assignedMentorName: string;
  assignedMentorEmail: string;
  lastHomeVisitDate: string; // ISO date string
  homeVisits: OfflineHomeVisit[];
  doubtsCount: number;
  unresolvedDoubtsCount: number;
  recentDoubts: Doubt[];
  urgentFlag: boolean;
  specialNotes?: string;
  priorityEvaluation?: StudentPriorityEvaluation;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// 5. Mentor Profile & SLA Governance Models (5 Mentors)
// ----------------------------------------------------------------------------

export interface MentorSLAStatus {
  isInactiveOver10Days: boolean;
  daysSinceLastActive: number;
  noDoubtSolvedIn5Days: boolean;
  daysSinceLastDoubtResolved: number;
  noOfflineVisitIn30Days: boolean;
  daysSinceLastOfflineVisit: number;
  hasAnySlaBreach: boolean;
}

export interface MentorProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  headline: string;
  bio: string;
  organization: string;
  expertiseTags: string[];
  rating: number;
  resolvedCount: number;
  assignedStudentIds: string[];
  assignedStudents?: StudentDossier[];
  lastActiveDate: string; // ISO date
  lastDoubtResolvedDate: string; // ISO date
  lastOfflineVisitDate: string; // ISO date
  slaStatus: MentorSLAStatus;
  isAvailable: boolean;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// 6. 1-on-1 Mentorship Request Models
// ----------------------------------------------------------------------------

export interface MentorshipRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  mentorId: string;
  mentorName: string;
  topic: string;
  description: string;
  urgency: UrgencyLevel | string;
  preferredMode: 'In-Person Home Visit' | 'Audio/Voice Call' | 'Doubt Chat Guidance';
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  createdAt: string;
}

// ----------------------------------------------------------------------------
// 7. Doubts, Roadmaps, and System Models
// ----------------------------------------------------------------------------

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
  assignedMentorId?: string;
  assigned_mentor_id?: string;
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

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  specialization?: string[];
  assignedStudentIds?: string[];
  assignedMentorId?: string;
}
