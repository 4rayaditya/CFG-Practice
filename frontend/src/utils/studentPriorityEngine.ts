import type { StudentDossier, StudentPriorityEvaluation, PriorityTier } from '../types';

/**
 * Deterministic Rule-Based Priority Engine for Cradle-to-College Students (Shifting Orbits)
 * Analyzes multi-dimensional risk factors:
 * - Days since last offline home visit (SLA > 30 days)
 * - School attendance & mentor session engagement rate (< 75%)
 * - Academic score risk threshold (< 65%)
 * - Unresolved doubts & urgent roadblock flags
 * - Vulnerability flags identified during home visits
 */
export function evaluateStudentPriority(student: StudentDossier, mentorInactiveDays = 0): StudentPriorityEvaluation {
  let score = 5; // Base score
  const triggeredRules: string[] = [];
  let requiresUrgentVisit = false;

  // 1. Calculate Days Since Last Offline Home Visit
  let daysSinceLastVisit = 0;
  if (student.lastHomeVisitDate) {
    const diffMs = Date.now() - new Date(student.lastHomeVisitDate).getTime();
    daysSinceLastVisit = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Rule 1: Offline Home Visit Overdue (>30 days SLA threshold)
  if (daysSinceLastVisit >= 30) {
    score += 35;
    requiresUrgentVisit = true;
    triggeredRules.push(`Home Visit Overdue (${daysSinceLastVisit} days since last in-person visit > 30d SLA)`);
  } else if (daysSinceLastVisit >= 20) {
    score += 15;
    triggeredRules.push(`Home Visit Follow-up Due (${daysSinceLastVisit} days since check-in)`);
  }

  // Rule 2: Low Attendance Rate (<75%)
  if (student.attendanceRate < 75) {
    score += 30;
    triggeredRules.push(`Severe Attendance Drop (${student.attendanceRate}% attendance < 75% baseline)`);
  } else if (student.attendanceRate < 85) {
    score += 10;
    triggeredRules.push(`Attendance Slippage Alert (${student.attendanceRate}%)`);
  }

  // Rule 3: Academic Score Underperformance (<65%)
  if (student.academicScore < 65) {
    score += 20;
    triggeredRules.push(`Academic Risk Indicator (${student.academicScore}% in core coursework < 65%)`);
  }

  // Rule 4: Urgent Roadblocks & Pending Doubts
  if (student.urgentFlag) {
    score += 25;
    triggeredRules.push('Student Marked Urgent Roadblock');
  } else if (student.unresolvedDoubtsCount >= 2) {
    score += 20;
    triggeredRules.push(`Multiple Unresolved Doubts (${student.unresolvedDoubtsCount} blocking questions pending)`);
  }

  // Rule 5: Counselor / Field Visit High Risk Flag
  if (student.homeVisits && student.homeVisits.length > 0) {
    const latestVisit = student.homeVisits[0];
    if (latestVisit.riskLevel === 'Critical') {
      score += 30;
      requiresUrgentVisit = true;
      triggeredRules.push('Critical Environment / Family Need Flagged in Latest Field Visit');
    } else if (latestVisit.riskLevel === 'High') {
      score += 20;
      triggeredRules.push('High Vulnerability Alert from Recent Home Visit');
    }
  }

  // Rule 6: Assigned Mentor Inactivity (>10 days)
  if (mentorInactiveDays >= 10) {
    score += 15;
    triggeredRules.push(`Assigned Mentor Inactive (${mentorInactiveDays} days since mentor last active)`);
  }

  // Clamp score between 0 and 100
  score = Math.min(100, Math.max(0, score));

  // Determine Priority Tier & Visual Styling
  let tier: PriorityTier = 'NORMAL';
  let badgeLabel = 'On Track / Normal';
  let badgeBg = 'bg-emerald-50';
  let badgeText = 'text-emerald-800';
  let badgeBorder = 'border-emerald-200';
  let recommendedAction = 'Maintain standard cradle-to-college monthly cadence and milestone check-ins.';

  if (score >= 70) {
    tier = 'CRITICAL';
    badgeLabel = 'CRITICAL PRIORITY';
    badgeBg = 'bg-rose-50';
    badgeText = 'text-rose-700';
    badgeBorder = 'border-rose-300 ring-2 ring-rose-500/20';
    recommendedAction = requiresUrgentVisit
      ? '🚨 IMMEDIATE ACTION: Schedule emergency offline home visit & counselor check within 24-48 hours.'
      : '🚨 IMMEDIATE ACTION: Priority academic tutoring intervention & direct mentor call required.';
  } else if (score >= 45) {
    tier = 'HIGH';
    badgeLabel = 'HIGH PRIORITY';
    badgeBg = 'bg-amber-50';
    badgeText = 'text-amber-800';
    badgeBorder = 'border-amber-300 ring-1 ring-amber-500/20';
    recommendedAction = '⚠️ Action Recommended: Mentor check-in call and attendance counseling within 3 days.';
  } else if (score >= 25) {
    tier = 'MEDIUM';
    badgeLabel = 'MEDIUM PRIORITY';
    badgeBg = 'bg-sky-50';
    badgeText = 'text-sky-800';
    badgeBorder = 'border-sky-200';
    recommendedAction = 'Review learning roadmap progress and resolve open study doubts during upcoming session.';
  }

  return {
    score,
    tier,
    badgeLabel,
    badgeBg,
    badgeText,
    badgeBorder,
    triggeredRules: triggeredRules.length > 0 ? triggeredRules : ['Consistent Engagement & On-Track Milestones'],
    recommendedAction,
    requiresUrgentVisit,
    daysSinceLastVisit,
  };
}

/**
 * Filter and sort student list by Priority Score descending
 */
export function sortStudentsByPriority(students: StudentDossier[]): StudentDossier[] {
  return [...students].sort((a, b) => {
    const evalA = a.priorityEvaluation || evaluateStudentPriority(a);
    const evalB = b.priorityEvaluation || evaluateStudentPriority(b);
    return evalB.score - evalA.score;
  });
}
