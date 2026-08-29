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
  MessageSquare
} from 'lucide-react';
import { useRealtimeDoubts } from '../../hooks/useRealtimeDoubts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import type { Doubt } from '../../types';

export const MentorBoard: React.FC = () => {
  const { user } = useAuth();
  const { doubts, loading, error, refetch, updateOptimisticDoubt } = useRealtimeDoubts({
    filterStatus: 'open',
    limit: 50,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveSuccessId, setResolveSuccessId] = useState<string | null>(null);
  const [resolveErrorMessage, setResolveErrorMessage] = useState<string | null>(null);

  // Extract unique categories dynamically from active doubts
  const categories = ['All', ...Array.from(new Set(doubts.map((d) => d.category).filter(Boolean)))];

  // Filter doubts based on search term and category
  const filteredDoubts = doubts.filter((doubt) => {
    const matchesCategory = selectedCategory === 'All' || doubt.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      doubt.title.toLowerCase().includes(searchLower) ||
      doubt.description.toLowerCase().includes(searchLower) ||
      (doubt.transcript && doubt.transcript.toLowerCase().includes(searchLower)) ||
      (doubt.tags && doubt.tags.some((t) => t.toLowerCase().includes(searchLower))) ||
      doubt.studentName.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  /**
   * Handles resolving a doubt in Supabase.
   * Supabase Realtime broadcast (or optimistic update) causes the resolved doubt
   * to instantly vanish from the open feed.
   */
  const handleResolveQuestion = async (doubt: Doubt) => {
    try {
      setResolvingId(doubt.id);
      setResolveErrorMessage(null);

      // Perform the Supabase UPDATE to change status to 'resolved'
      const { error: updateError } = await supabase
        .from('doubts')
        .update({
          status: 'resolved',
          answered_by_name: user?.name || 'Volunteer Mentor',
          answered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', doubt.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Optimistically update local state in case WebSocket broadcast has high latency
      setResolveSuccessId(doubt.id);
      updateOptimisticDoubt(doubt.id, { status: 'resolved' });
    } catch (err: any) {
      console.error('[MentorBoard] Failed to resolve doubt:', err);
      setResolveErrorMessage(err.message || 'Failed to resolve question. Please try again.');
    } finally {
      setResolvingId(null);
    }
  };

  /**
   * Formats timestamp into a human-readable relative string
   */
  const formatTimeAgo = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString; // Fallback if already relative format
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
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Live Mentor Queue
              </h1>
              {/* Realtime Live Pulse Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Radio className="w-3.5 h-3.5" />
                <span>Realtime Active</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Live broadcast of student doubts intake. Questions vanish automatically once marked resolved.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white text-sm font-medium transition-all shadow-sm"
              title="Refresh queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
              <span>Refresh</span>
            </button>
            <div className="px-4 py-2 rounded-xl bg-teal-950/40 border border-teal-500/20 text-teal-300 text-sm font-semibold">
              {doubts.length} Open {doubts.length === 1 ? 'Doubt' : 'Doubts'}
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doubts by title, tag, or student..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 text-slate-200 placeholder-slate-500 text-sm transition-all outline-none"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <Filter className="w-4 h-4 text-slate-500 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20'
                    : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Global Error Banner if action failed */}
        {resolveErrorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{resolveErrorMessage}</span>
            </div>
            <button
              onClick={() => setResolveErrorMessage(null)}
              className="text-xs underline hover:text-rose-200"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Masonry / Responsive Grid */}
      <div className="max-w-7xl mx-auto">
        {/* Loading Skeletons */}
        {loading && doubts.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 animate-pulse flex flex-col justify-between"
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

        {/* Initial Error State */}
        {error && doubts.length === 0 && (
          <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800/80 p-8">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3 opacity-90" />
            <h3 className="text-lg font-semibold text-white">Error Connecting to Queue</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mt-1 mb-4">
              {error.message}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-xl text-sm transition-all"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDoubts.length === 0 && !error && (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800 p-8">
            <div className="w-16 h-16 rounded-2xl bg-teal-950/60 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200">Inbox Zero! All Caught Up</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mt-2">
              {searchQuery || selectedCategory !== 'All'
                ? 'No open doubts match your current filters. Try changing or clearing your search.'
                : 'There are currently no pending student doubts. New questions will appear here instantly in realtime.'}
            </p>
          </div>
        )}

        {/* Responsive Masonry / Grid of Doubt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredDoubts.map((doubt) => {
            const isResolving = resolvingId === doubt.id;
            const isSuccess = resolveSuccessId === doubt.id;
            const tags = doubt.tags && doubt.tags.length > 0 
              ? doubt.tags 
              : [doubt.category];

            return (
              <div
                key={doubt.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/50 hover:from-slate-900 hover:to-slate-850 border border-slate-800/80 hover:border-teal-500/40 p-5 md:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-teal-950/20 backdrop-blur-sm"
              >
                <div>
                  {/* Card Header: Category & Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      {doubt.category}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimeAgo(doubt.createdAt)}</span>
                    </div>
                  </div>

                  {/* Doubt Title */}
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-teal-300 transition-colors leading-snug line-clamp-2">
                    {doubt.title}
                  </h3>

                  {/* Transcribed Description / Content */}
                  <div className="mt-3 relative">
                    <p className="text-sm text-slate-300/90 leading-relaxed line-clamp-4 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/50">
                      {doubt.transcript ? (
                        <span className="italic text-slate-200">
                          &ldquo;{doubt.transcript}&rdquo;
                        </span>
                      ) : (
                        doubt.description
                      )}
                    </p>
                  </div>

                  {/* Audio Intake Preview Indicator (if audioUrl present) */}
                  {doubt.audioUrl && (
                    <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-xs">
                      <Volume2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Voice Recording Attached</span>
                    </div>
                  )}

                  {/* Row of Tags as Small Pill Badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tags.map((tag, idx) => (
                      <span
                        key={`${doubt.id}-tag-${idx}`}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-xs font-medium transition-colors"
                      >
                        <Tag className="w-2.5 h-2.5 text-teal-400" />
                        {tag.startsWith('#') ? tag : `#${tag}`}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Student Info & Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-800/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-bold border border-slate-700">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium text-slate-300 truncate max-w-[120px]">
                      {doubt.studentName}
                    </span>
                  </div>

                  {/* Resolve Question Button */}
                  <button
                    onClick={() => handleResolveQuestion(doubt)}
                    disabled={isResolving || isSuccess}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-md active:scale-95 ${
                      isSuccess
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-teal-500 hover:bg-teal-400 text-slate-950 hover:shadow-teal-500/20'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isResolving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Resolving...</span>
                      </>
                    ) : isSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolved!</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Resolve Question</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
