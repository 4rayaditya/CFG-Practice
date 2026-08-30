import type { Doubt } from '../types';

export type PriorityTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STANDARD';

export interface PriorityEvaluation {
  score: number;
  tier: PriorityTier;
  badgeLabel: string;
  badgeColor: string;
  triggeredRules: string[];
  recommendedAction: string;
}

/**
 * Deterministic Rule-Based Priority Engine
 * Evaluates student doubts against SLA, urgency indicators, struggle signals, and complexity.
 */
export function evaluateDoubtPriority(doubt: Doubt, studentHistory?: { totalDoubts?: number; resolvedCount?: number }): PriorityEvaluation {
  let score = 10; // Baseline score
  const triggeredRules: string[] = [];

  const textToAnalyze = `${doubt.title} ${doubt.description} ${doubt.transcript || ''} ${doubt.urgency || ''}`.toLowerCase();

  // Rule 1: Urgency Marker or Blocking Keywords (+40 pts)
  const isUrgentFlag = String(doubt.urgency || '').toLowerCase() === 'urgent';
  const urgentKeywords = ['urgent', 'asap', 'emergency', 'blocking', 'blocked', 'deadline', 'cannot proceed', 'broken in production', 'exam tomorrow', 'failing test', 'stuck for hours'];
  const hasUrgentKeyword = urgentKeywords.some((kw) => textToAnalyze.includes(kw));

  if (isUrgentFlag || hasUrgentKeyword) {
    score += 40;
    triggeredRules.push(isUrgentFlag ? 'Marked Urgent by Student' : 'Blocking Roadblock Keywords');
  }

  // Rule 2: Wait Time / Queue SLA (+15 to +30 pts)
  if (doubt.createdAt) {
    const diffMs = Date.now() - new Date(doubt.createdAt).getTime();
    const waitMins = Math.floor(diffMs / 60000);
    if (waitMins >= 30) {
      score += 30;
      triggeredRules.push(`Extended Wait Time (${waitMins}m in queue)`);
    } else if (waitMins >= 10) {
      score += 15;
      triggeredRules.push(`Queue SLA Alert (${waitMins}m waiting)`);
    }
  }

  // Rule 3: Milestone / Project Checkpoint Blocker (+20 pts)
  const checkpointKeywords = ['checkpoint', 'milestone', 'project', 'assignment', 'submission', 'portfolio', 'interview prep'];
  if (checkpointKeywords.some((kw) => textToAnalyze.includes(kw))) {
    score += 20;
    triggeredRules.push('Career Milestone Checkpoint Blocker');
  }

  // Rule 4: High-Complexity Technical Category (+15 pts)
  if (['Algorithms', 'AI/ML', 'System Design'].includes(doubt.category)) {
    score += 15;
    triggeredRules.push(`Complex Domain: ${doubt.category}`);
  }

  // Rule 5: Struggling Student Signal (+20 pts)
  if (studentHistory && studentHistory.totalDoubts && studentHistory.totalDoubts > 2 && (studentHistory.resolvedCount || 0) === 0) {
    score += 20;
    triggeredRules.push('Multiple Unresolved Doubts (Struggling Learner)');
  }

  // Determine Priority Tier
  let tier: PriorityTier = 'STANDARD';
  let badgeLabel = 'Standard Priority';
  let badgeColor = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let recommendedAction = 'Answer during standard queue review';

  if (score >= 70) {
    tier = 'CRITICAL';
    badgeLabel = 'CRITICAL PRIORITY';
    badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-xs shadow-rose-950/50';
    recommendedAction = 'Immediate intervention needed - Student is blocked';
  } else if (score >= 45) {
    tier = 'HIGH';
    badgeLabel = 'HIGH PRIORITY';
    badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-xs shadow-amber-950/50';
    recommendedAction = 'Prioritize in current mentor session';
  } else if (score >= 25) {
    tier = 'MEDIUM';
    badgeLabel = 'MEDIUM PRIORITY';
    badgeColor = 'bg-sky-950/80 text-sky-300 border-sky-500/50';
    recommendedAction = 'Answer within standard turnaround window';
  }

  return {
    score,
    tier,
    badgeLabel,
    badgeColor,
    triggeredRules: triggeredRules.length > 0 ? triggeredRules : ['Standard Student Intake'],
    recommendedAction,
  };
}

/**
 * Sort doubts by priority score descending
 */
export function sortDoubtsByPriority(doubts: Doubt[]): Doubt[] {
  return [...doubts].sort((a, b) => {
    const evalA = evaluateDoubtPriority(a);
    const evalB = evaluateDoubtPriority(b);
    return evalB.score - evalA.score;
  });
}
