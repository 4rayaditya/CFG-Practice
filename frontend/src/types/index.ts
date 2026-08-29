export type UserRole = 'student' | 'mentor' | 'admin';

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
  studentId: string;
  studentName: string;
  createdAt: string;
  status: 'pending' | 'matched' | 'resolved';
  category: string;
  matchedMentors?: string[];
  similarityScore?: number;
  tags?: string[];
  transcript?: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  category: string;
  estimatedHours: number;
  completed: boolean;
  resources: string[];
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
