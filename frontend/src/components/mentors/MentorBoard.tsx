import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  User, 
  Radio, 
  Volume2, 
  Sparkles, 
  Search, 
  Filter, 
  AlertCircle, 
  Tag, 
  Check, 
  Loader2,
  RefreshCw,
  MessageSquare,
  Send,
  Code,
  BookOpen,
  Mic,
  MicOff,
  Flame,
  ArrowUpDown,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { useRealtimeDoubts, saveLocalCachedDoubts, getLocalCachedDoubts } from '../../hooks/useRealtimeDoubts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useVoiceToText } from '../../hooks/useVoiceToText';
import { evaluateDoubtPriority, sortDoubtsByPriority } from '../../utils/priorityEngine';
import type { Doubt } from '../../types';

export const MentorBoard: React.FC = () => {
  const { user } = useAuth();
  
  // Load all doubts to manage Open and Resolved tabs seamlessly
  const { doubts, loading, error, refetch, updateOptimisticDoubt } = useRealtimeDoubts({
    filterStatus: 'all',
    limit: 100,
  });

  const [activeTab, setActiveTab] = useState<'open' | 'resolved' | 'all'>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'priority' | 'newest' | 'oldest'>('priority');

  // Answer Modal State
  const [activeAnsweringDoubt, setActiveAnsweringDoubt] = useState<Doubt | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Voice-to-Text hook for dictating answers
  const {
    isListening,
    transcript: voiceTranscript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceToText();

  // Sync voice transcript into answer text
  const handleToggleVoiceDictation = () => {
    if (isListening) {
      stopListening();
      if (voiceTranscript) {
        setAnswerText((prev) => (prev ? `${prev}\n\n${voiceTranscript}` : voiceTranscript));
        resetTranscript();
      }
    } else {
      resetTranscript();
      startListening();
    }
  };

  // Keep answerText updated with ongoing speech if listening
  React.useEffect(() => {
    if (isListening && voiceTranscript) {
      // Append interim voice transcript nicely
    }
  }, [isListening, voiceTranscript]);

  // Extract unique categories dynamically
  const categories = ['All', ...Array.from(new Set(doubts.map((d) => d.category).filter(Boolean)))];

  // Filter doubts by tab, search, and category
  const filteredDoubts = doubts.filter((doubt) => {
    // Tab filter
    if (activeTab === 'open' && doubt.status !== 'pending' && doubt.status !== 'matched') return false;
    if (activeTab === 'resolved' && doubt.status !== 'resolved') return false;

    // Category filter
    const matchesCategory = selectedCategory === 'All' || doubt.category === selectedCategory;

    // Search query
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      doubt.title.toLowerCase().includes(searchLower) ||
      doubt.description.toLowerCase().includes(searchLower) ||
      (doubt.transcript && doubt.transcript.toLowerCase().includes(searchLower)) ||
      (doubt.studentName && doubt.studentName.toLowerCase().includes(searchLower)) ||
      (doubt.tags && doubt.tags.some((t) => t.toLowerCase().includes(searchLower)));

    return matchesCategory && matchesSearch;
  });

  // Sort filtered doubts
  const sortedDoubts = [...filteredDoubts].sort((a, b) => {
    if (sortBy === 'priority') {
      const pA = evaluateDoubtPriority(a).score;
      const pB = evaluateDoubtPriority(b).score;
      return pB - pA;
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
  });

  const openDoubtsCount = doubts.filter((d) => d.status === 'pending' || d.status === 'matched').length;
  const resolvedDoubtsCount = doubts.filter((d) => d.status === 'resolved').length;
  const criticalDoubtsCount = doubts.filter(
    (d) => (d.status === 'pending' || d.status === 'matched') && evaluateDoubtPriority(d).tier === 'CRITICAL'
  ).length;

  /**
   * Open the answering modal for a specific doubt
   */
  const handleOpenAnswerModal = (doubt: Doubt) => {
    setActiveAnsweringDoubt(doubt);
    setAnswerText(doubt.answer || '');
    setCodeSnippet('');
    setReferenceUrl('');
    setActionErrorMsg(null);
    resetTranscript();
  };

  /**
   * Submit the mentor's answer and resolve the question
   */
  const handleSubmitAnswer = async () => {
    if (!activeAnsweringDoubt) return;
    if (!answerText.trim() && !codeSnippet.trim()) {
      setActionErrorMsg('Please provide an answer explanation or code snippet.');
      return;
    }

    setIsSubmittingAnswer(true);
    setActionErrorMsg(null);

    const fullAnswer = [
      answerText.trim(),
      codeSnippet.trim() ? `\n\n\`\`\`\n${codeSnippet.trim()}\n\`\`\`` : '',
      referenceUrl.trim() ? `\n\n📌 **Recommended Reference:** [${referenceUrl.trim()}](${referenceUrl.trim()})` : '',
    ].filter(Boolean).join('');

    const mentorName = user?.fullName || user?.name || 'Dr. Sarah Jenkins (Volunteer Mentor)';
    const answeredAt = new Date().toISOString();

    const partialUpdate: Partial<Doubt> = {
      status: 'resolved',
      answer: fullAnswer,
      answeredBy: mentorName,
      answered_by_name: mentorName,
      answeredAt: answeredAt,
      answered_at: answeredAt,
    };

    try {
      // 1. Update Supabase
      const { error: supaError } = await supabase
        .from('doubts')
        .update({
          status: 'resolved',
          answer: fullAnswer,
          answered_by_name: mentorName,
          answered_at: answeredAt,
          updated_at: answeredAt,
        })
        .eq('id', activeAnsweringDoubt.id);

      if (supaError) {
        console.warn('Supabase remote update notice, saving to local cache:', supaError.message);
      }

      // 2. Update local state and persistent storage
      updateOptimisticDoubt(activeAnsweringDoubt.id, partialUpdate);

      const allCached = getLocalCachedDoubts();
      const updatedCache = allCached.map((d) => (d.id === activeAnsweringDoubt.id ? { ...d, ...partialUpdate } : d));
      saveLocalCachedDoubts(updatedCache);

      setActionSuccessMsg(`✅ Question answered & resolved successfully! Sent to ${activeAnsweringDoubt.studentName || 'student'}.`);
      setActiveAnsweringDoubt(null);
      setTimeout(() => setActionSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      setActionErrorMsg(err.message || 'Failed to submit answer. Please try again.');
    } finally {
      setIsSubmittingAnswer(false);
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Mentor Q&A Resolution Hub
              </h1>
              {/* Realtime Live Pulse Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Radio className="w-3.5 h-3.5" />
                <span>Live Realtime Sync</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Provide direct guidance, review transcribed doubts, and resolve roadblocks with code solutions and voice notes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white text-xs font-semibold transition shadow-sm"
              title="Refresh queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-400' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-teal-950/40 border border-teal-500/20 text-teal-300 text-xs font-bold">
              {openDoubtsCount} Open Pending
            </div>
          </div>
        </div>

        {/* Action Success / Error Notifications */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Critical Priority Alert Banner */}
        {criticalDoubtsCount > 0 && activeTab === 'open' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-slate-900 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                <Flame className="w-5 h-5 animate-pulse text-rose-400" />
              </div>
              <div>
                <span className="font-bold text-rose-100 block">
                  {criticalDoubtsCount} Student {criticalDoubtsCount === 1 ? 'Question Requires' : 'Questions Require'} Urgent Attention
                </span>
                <span className="text-[11px] text-rose-300/80">
                  Identified by the Rule-Based Priority Engine (SLA wait time & blocking roadblocks)
                </span>
              </div>
            </div>
            <button
              onClick={() => { setSortBy('priority'); }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition"
            >
              View Critical First
            </button>
          </div>
        )}

        {/* Queue Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('open')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'open'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Open Questions ({openDoubtsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resolved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'resolved'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Resolved & Answers ({resolvedDoubtsCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'all'
                  ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Questions ({doubts.length})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-teal-500"
            >
              <option value="priority">Rule Priority (Critical First)</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest / SLA Wait Time</option>
            </select>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doubts by keyword, tag, or student..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 text-slate-200 placeholder-slate-500 text-xs transition outline-none"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: Masonry / Responsive Grid */}
      <div className="max-w-7xl mx-auto">
        {/* Loading Skeletons */}
        {loading && doubts.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-3xl bg-slate-900/40 border border-slate-800/60 p-6 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-6 bg-slate-800 rounded w-4/5" />
                  <div className="h-16 bg-slate-800/60 rounded w-full" />
                </div>
                <div className="h-10 bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedDoubts.length === 0 && (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 p-8 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-teal-950/60 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">
              {activeTab === 'open' ? 'Queue Cleared! All Caught Up' : 'No Questions Found'}
            </h3>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              {activeTab === 'open'
                ? 'There are currently no open doubts matching your filter. New voice intakes will appear here automatically in real-time.'
                : 'No doubts found matching the current search parameters.'}
            </p>
          </div>
        )}

        {/* Responsive Grid of Doubt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {sortedDoubts.map((doubt) => {
            const priorityEval = evaluateDoubtPriority(doubt);
            const isResolved = doubt.status === 'resolved';
            const tags = doubt.tags && doubt.tags.length > 0 ? doubt.tags : [doubt.category];

            return (
              <div
                key={doubt.id}
                className={`group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 hover:from-slate-900 hover:to-slate-850 border transition-all duration-300 p-6 backdrop-blur-sm ${
                  isResolved
                    ? 'border-emerald-500/30 shadow-sm'
                    : priorityEval.tier === 'CRITICAL'
                    ? 'border-rose-500/50 shadow-lg shadow-rose-950/30'
                    : 'border-slate-800/80 hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-950/20'
                }`}
              >
                <div>
                  {/* Top Row: Category & Priority Tier Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      {doubt.category}
                    </span>

                    {/* Priority Engine Badge */}
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold ${priorityEval.badgeColor}`}
                      title={priorityEval.triggeredRules.join(' • ')}
                    >
                      {priorityEval.tier === 'CRITICAL' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                      )}
                      <span>{priorityEval.tier}</span>
                    </div>
                  </div>

                  {/* Doubt Title */}
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-teal-300 transition-colors leading-snug">
                    {doubt.title}
                  </h3>

                  {/* Transcribed Description / Spoken Query */}
                  <div className="mt-3 relative">
                    <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                      {doubt.transcript ? (
                        <span className="italic text-slate-200">&ldquo;{doubt.transcript}&rdquo;</span>
                      ) : (
                        doubt.description
                      )}
                    </p>
                  </div>

                  {/* Answer Preview if already answered */}
                  {isResolved && doubt.answer && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Answered by {doubt.answeredBy || 'Volunteer Mentor'}</span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed whitespace-pre-line font-mono">
                        {doubt.answer}
                      </p>
                    </div>
                  )}

                  {/* Priority Engine Triggered Rules Pills */}
                  {!isResolved && priorityEval.triggeredRules.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {priorityEval.triggeredRules.slice(0, 2).map((rule, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 text-[10px]"
                        >
                          ⚡ {rule}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Row of Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((tag, idx) => (
                      <span
                        key={`${doubt.id}-tag-${idx}`}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[11px] font-medium"
                      >
                        <Tag className="w-2.5 h-2.5 text-teal-400" />
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Student Info & Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-800/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-bold border border-slate-700 text-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-medium text-slate-300 truncate max-w-[100px] block text-[11px]">
                        {doubt.studentName || 'Student'}
                      </span>
                      <span className="text-[10px] text-slate-500">{formatTimeAgo(doubt.createdAt)}</span>
                    </div>
                  </div>

                  {/* Interactive Answer / Edit Action */}
                  <button
                    type="button"
                    id={`btn-answer-doubt-${doubt.id}`}
                    onClick={() => handleOpenAnswerModal(doubt)}
                    className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-md ${
                      isResolved
                        ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20'
                        : 'bg-teal-500 hover:bg-teal-400 text-slate-950 hover:shadow-teal-500/20 active:scale-95'
                    }`}
                  >
                    {isResolved ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>View / Edit Answer</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Answer Roadblock</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* RICH ANSWER & RESOLUTION MODAL */}
      {/* --------------------------------------------------------------------- */}
      {activeAnsweringDoubt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase">
                    {activeAnsweringDoubt.category}
                  </span>
                  <span className="text-xs text-slate-400">Asked by {activeAnsweringDoubt.studentName || 'Student'}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100">{activeAnsweringDoubt.title}</h3>
              </div>
              <button
                onClick={() => setActiveAnsweringDoubt(null)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Original Student Query Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Student road block:
              </span>
              <p className="text-xs text-slate-200 italic leading-relaxed">
                &ldquo;{activeAnsweringDoubt.transcript || activeAnsweringDoubt.description}&rdquo;
              </p>
            </div>

            {/* Error notice if any */}
            {actionErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionErrorMsg}</span>
              </div>
            )}

            {/* Form Fields: Answer explanation */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200">
                    Solution & Conceptual Explanation
                  </label>
                  {/* Voice Dictation Toggle */}
                  {isVoiceSupported && (
                    <button
                      type="button"
                      onClick={handleToggleVoiceDictation}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        isListening
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3 text-teal-400" />}
                      <span>{isListening ? 'Stop Speaking' : 'Dictate with Voice'}</span>
                    </button>
                  )}
                </div>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={4}
                  placeholder="Explain the solution clearly, step-by-step guidance, why the issue occurred, and architectural best practices..."
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs text-slate-100 placeholder-slate-500 outline-none leading-relaxed transition"
                />
              </div>

              {/* Code Snippet Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-teal-400" />
                  <span>Code Snippet / Implementation Example (Optional)</span>
                </label>
                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  rows={3}
                  placeholder="Paste working code example or fix here..."
                  className="w-full p-3 rounded-xl bg-slate-950 font-mono text-xs text-teal-300 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 placeholder-slate-600 outline-none leading-relaxed transition"
                />
              </div>

              {/* Reference Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                  <span>Recommended Documentation or Tutorial Link (Optional)</span>
                </label>
                <input
                  type="url"
                  value={referenceUrl}
                  onChange={(e) => setReferenceUrl(e.target.value)}
                  placeholder="https://react.dev/... or https://fastapi.tiangolo.com/..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs text-slate-100 placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveAnsweringDoubt(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-submit-answer"
                onClick={handleSubmitAnswer}
                disabled={isSubmittingAnswer || (!answerText.trim() && !codeSnippet.trim())}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition hover:scale-[1.02] active:scale-98 disabled:opacity-50"
              >
                {isSubmittingAnswer ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Resolving & Notifying Student...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Answer & Resolve Roadblock</span>
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

export default MentorBoard;
