import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  User, 
  Sparkles, 
  Send, 
  MessageSquare, 
  ExternalLink, 
  Star, 
  Tag, 
  AlertCircle, 
  Filter, 
  Check, 
  Code,
  Flame,
  ThumbsUp,
  Heart,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useRealtimeDoubts, saveLocalCachedDoubts, getLocalCachedDoubts } from '../../hooks/useRealtimeDoubts';
import { evaluateDoubtPriority } from '../../utils/priorityEngine';
import { useAuth } from '../../hooks/useAuth';
import type { Doubt } from '../../types';

export interface StudentDoubtHubProps {
  onAskNewQuestion?: () => void;
}

export const StudentDoubtHub: React.FC<StudentDoubtHubProps> = ({ onAskNewQuestion }) => {
  const { user } = useAuth();
  const { doubts, loading, refetch } = useRealtimeDoubts({ filterStatus: 'all', limit: 100 });
  const [filterTab, setFilterTab] = useState<'all' | 'open' | 'resolved'>('all');
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>(null);
  const [ratedDoubtIds, setRatedDoubtIds] = useState<Record<string, number>>({});
  const [thankedDoubtIds, setThankedDoubtIds] = useState<Set<string>>(new Set());

  // Filter for student's doubts or public feed
  const studentDoubts = doubts.filter((d) => {
    if (filterTab === 'open') return d.status === 'pending' || d.status === 'matched';
    if (filterTab === 'resolved') return d.status === 'resolved';
    return true;
  });

  const openCount = doubts.filter((d) => d.status === 'pending' || d.status === 'matched').length;
  const resolvedCount = doubts.filter((d) => d.status === 'resolved').length;

  const handleRateAnswer = (doubtId: string, rating: number) => {
    setRatedDoubtIds((prev) => ({ ...prev, [doubtId]: rating }));
  };

  const handleThankMentor = (doubtId: string) => {
    setThankedDoubtIds((prev) => new Set([...prev, doubtId]));
  };

  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Feed Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-sky-600" />
            <span>My Questions & Mentor Solutions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track live answers from volunteer engineers and view your resolved roadblocks.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All ({doubts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('open')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'open'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Waiting for Mentor ({openCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('resolved')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === 'resolved'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>
      </div>

      {/* Doubts List */}
      {studentDoubts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No questions in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Record a voice question or type your doubt above to connect with domain mentors.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {studentDoubts.map((doubt) => {
            const isResolved = doubt.status === 'resolved';
            const isExpanded = expandedDoubtId === doubt.id || isResolved;
            const priorityEval = evaluateDoubtPriority(doubt);
            const userRating = ratedDoubtIds[doubt.id] || 0;
            const isThanked = thankedDoubtIds.has(doubt.id);

            return (
              <div
                key={doubt.id}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isResolved
                    ? 'border-emerald-200/90 hover:border-emerald-300'
                    : 'border-slate-200 hover:border-sky-300'
                }`}
              >
                {/* Header Strip */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 text-xs font-semibold uppercase">
                        {doubt.category}
                      </span>
                      {isResolved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                          <span>In Mentor Queue</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimeAgo(doubt.createdAt)}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {doubt.title}
                  </h3>

                  {/* Spoken transcript or description */}
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {doubt.transcript ? (
                      <span className="italic">&ldquo;{doubt.transcript}&rdquo;</span>
                    ) : (
                      doubt.description
                    )}
                  </p>

                  {/* Tags */}
                  {doubt.tags && doubt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {doubt.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mentor Solution Box (If Answered) */}
                  {isResolved && doubt.answer && (
                    <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-emerald-950 block">
                              Mentor Solution & Explanation
                            </span>
                            <span className="text-[10px] text-emerald-700 font-medium">
                              By {doubt.answeredBy || 'Volunteer Mentor'} • {formatTimeAgo(doubt.answeredAt)}
                            </span>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          Verified Solution
                        </span>
                      </div>

                      <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-normal space-y-2">
                        {doubt.answer}
                      </div>

                      {/* Student Feedback Actions: Rating & Thank You */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-100">
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500 font-semibold mr-1.5">Rate Mentor:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleRateAnswer(doubt.id, star)}
                              className="p-1 hover:scale-110 transition"
                              title={`Rate ${star} stars`}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= (userRating || 5)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleThankMentor(doubt.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isThanked
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isThanked ? 'fill-rose-500 text-rose-500' : ''}`} />
                          <span>{isThanked ? 'Thanked Mentor!' : 'Send Thank You'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
