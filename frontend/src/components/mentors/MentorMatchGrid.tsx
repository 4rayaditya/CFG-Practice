import React, { useState } from 'react';
import { 
  Sparkles, 
  Star, 
  CheckCircle2, 
  Send, 
  Clock, 
  Zap, 
  Award, 
  UserCheck, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';

export interface Mentor {
  id: string;
  fullName: string;
  headline: string;
  bio?: string;
  avatarUrl?: string;
  expertiseTags: string[];
  rating: number;
  reviewsCount?: number;
  resolvedCount?: number;
  matchScore: number; // e.g. 94 (percentage)
  isAvailable?: boolean;
  location?: string;
  responseSpeed?: string;
}

export interface MentorMatchGridProps {
  mentors?: Mentor[];
  isLoading?: boolean;
  doubtTitle?: string;
  onSelectMentor?: (mentor: Mentor) => void;
  onRequestMentorship?: (mentor: Mentor, note?: string) => Promise<void> | void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export const MentorMatchGrid: React.FC<MentorMatchGridProps> = ({
  mentors = [],
  isLoading = false,
  doubtTitle,
  onSelectMentor,
  onRequestMentorship,
  emptyTitle = 'No matching mentors found',
  emptyDescription = 'Try adjusting your question keywords or broadening your topic.',
  className = '',
}) => {
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestNote, setRequestNote] = useState<string>('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState<boolean>(false);
  const [requestedMentorIds, setRequestedMentorIds] = useState<Set<string>>(new Set());
  const [successToastMentor, setSuccessToastMentor] = useState<string | null>(null);

  // Helper for match score pill styling
  const getMatchScoreBadge = (score: number) => {
    if (score >= 90) {
      return {
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300/80 shadow-xs',
        indicator: 'bg-emerald-500',
        label: `${score}% Top Match`,
      };
    }
    if (score >= 75) {
      return {
        badgeBg: 'bg-sky-50 text-sky-800 border-sky-300/80 shadow-xs',
        indicator: 'bg-sky-500',
        label: `${score}% Great Match`,
      };
    }
    return {
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-300/80 shadow-xs',
      indicator: 'bg-amber-500',
      label: `${score}% Match`,
    };
  };

  const handleOpenRequestModal = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setRequestNote(`Hi ${mentor.fullName.split(' ')[0]}, I would appreciate your mentorship on: "${doubtTitle || 'my technical question'}".`);
  };

  const handleSendRequest = async () => {
    if (!selectedMentor) return;
    setIsSubmittingRequest(true);
    try {
      if (onRequestMentorship) {
        await onRequestMentorship(selectedMentor, requestNote);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      setRequestedMentorIds((prev) => new Set([...prev, selectedMentor.id]));
      setSuccessToastMentor(selectedMentor.fullName);
      setSelectedMentor(null);
      setTimeout(() => setSuccessToastMentor(null), 4000);
    } catch (err) {
      console.error('Failed to submit mentorship request:', err);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // ---------------------------------------------------------------------------
  // SKELETON LOADING STATE
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-slate-200 rounded-md animate-pulse" />
          <div className="h-4 w-28 bg-slate-200 rounded-md animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-2xl bg-slate-200" />
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-4/5 bg-slate-200 rounded" />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <div className="h-5 w-16 bg-slate-200 rounded-md" />
                <div className="h-5 w-20 bg-slate-200 rounded-md" />
                <div className="h-5 w-14 bg-slate-200 rounded-md" />
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-9 w-32 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // EMPTY STATE
  // ---------------------------------------------------------------------------
  if (!mentors || mentors.length === 0) {
    return (
      <div className={`light-panel rounded-3xl p-8 text-center space-y-3 ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-100">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{emptyTitle}</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{emptyDescription}</p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER MENTOR MATCH GRID
  // ---------------------------------------------------------------------------
  return (
    <div className={`space-y-5 ${className}`}>
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Semantic Mentor Matches</h2>
            <p className="text-xs text-slate-500">Ranked by 384-dimensional vector similarity to your doubt</p>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80 self-start sm:self-auto">
          {mentors.length} Verified Volunteers Available
        </span>
      </div>

      {/* Success Toast */}
      {successToastMentor && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mentorship request successfully sent to <strong>{successToastMentor}</strong>!</span>
          </div>
          <button 
            onClick={() => setSuccessToastMentor(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mentors.map((mentor) => {
          const badge = getMatchScoreBadge(mentor.matchScore);
          const isRequested = requestedMentorIds.has(mentor.id);
          const initials = mentor.fullName
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return (
            <div
              key={mentor.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 p-6 flex flex-col justify-between space-y-4 relative group"
            >
              <div>
                {/* Card Top: Avatar & Match Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar with fallback and presence dot */}
                    <div className="relative shrink-0">
                      {mentor.avatarUrl ? (
                        <img
                          src={mentor.avatarUrl}
                          alt={mentor.fullName}
                          className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                          {initials}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="Active Volunteer" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                          {mentor.fullName}
                        </h3>
                        <span title="Verified Mentor">
                          <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                        {mentor.headline}
                      </p>
                    </div>
                  </div>

                  {/* Match Percentage Pill Badge */}
                  <div className={`px-2.5 py-1 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1.5 shrink-0 ${badge.badgeBg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.indicator} animate-pulse`} />
                    <span>{badge.label}</span>
                  </div>
                </div>

                {/* Bio Snippet */}
                {mentor.bio && (
                  <p className="text-xs text-slate-600 mt-3.5 line-clamp-2 leading-relaxed">
                    {mentor.bio}
                  </p>
                )}

                {/* Expertise Tag Chips */}
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {mentor.expertiseTags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-lg bg-sky-50/80 hover:bg-sky-100 text-sky-800 border border-sky-100 text-[10px] font-semibold transition"
                    >
                      #{tag}
                    </span>
                  ))}
                  {mentor.expertiseTags.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-semibold">
                      +{mentor.expertiseTags.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Rating & Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{mentor.rating.toFixed(1)}</span>
                  {mentor.reviewsCount ? (
                    <span className="text-[10px] text-slate-400 font-normal">({mentor.reviewsCount})</span>
                  ) : null}
                </div>

                {/* Direct Request Mentorship Action */}
                <button
                  type="button"
                  id={`btn-request-mentor-${mentor.id}`}
                  onClick={() => handleOpenRequestModal(mentor)}
                  disabled={isRequested}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                    isRequested
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white hover:scale-[1.02] active:scale-98'
                  }`}
                >
                  {isRequested ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Requested</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Mentorship</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* INTERACTIVE REQUEST CONFIRMATION MODAL */}
      {/* --------------------------------------------------------------------- */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                  {selectedMentor.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Request Mentorship</h3>
                  <p className="text-xs text-slate-500">Routing doubt to {selectedMentor.fullName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mentor Details Summary */}
            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-sky-900 block">{selectedMentor.headline}</span>
                <span className="text-[11px] text-sky-700">★ {selectedMentor.rating.toFixed(2)} Rating • Volunteer Mentor</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg">
                {selectedMentor.matchScore}% Match
              </span>
            </div>

            {/* Note Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Personalized Note to Mentor
              </label>
              <textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                rows={3}
                className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                placeholder="Add any specific context or code snippet link..."
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedMentor(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-send-request"
                onClick={handleSendRequest}
                disabled={isSubmittingRequest}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-2 transition hover:scale-[1.02] active:scale-98 disabled:opacity-50"
              >
                {isSubmittingRequest ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Request...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Mentorship Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
