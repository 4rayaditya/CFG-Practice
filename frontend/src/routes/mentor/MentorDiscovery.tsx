import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  ShieldCheck, 
  Send, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Users, 
  Award,
  X,
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { saveLocalCachedDoubts, getLocalCachedDoubts } from '../../hooks/useRealtimeDoubts';
import type { Doubt } from '../../types';

export interface DirectoryMentor {
  id: string;
  fullName: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  expertiseTags: string[];
  rating: number;
  reviewsCount: number;
  resolvedCount: number;
  responseSpeed: string;
  isAvailable: boolean;
}

export const DIRECTORY_MENTORS: DirectoryMentor[] = [
  {
    id: '00000000-0000-0000-0000-000000000002',
    fullName: 'Dr. Sarah Jenkins',
    headline: 'Lead Frontend Architect & React Core Contributor',
    bio: '12+ years architecting web applications, accessible React component systems, and state management pipelines at top tech companies.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    expertiseTags: ['React', 'Frontend', 'TypeScript', 'Tailwind CSS', 'Web Accessibility', 'UI Architecture'],
    rating: 4.98,
    reviewsCount: 142,
    resolvedCount: 48,
    responseSpeed: '< 3.2 mins',
    isAvailable: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    fullName: 'Elena Rostova',
    headline: 'Senior Staff Web Engineer & Media Streaming Specialist',
    bio: 'Specializes in Web Audio API, real-time audio visualization, MediaRecorder streams, and modern React performance optimizations.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    expertiseTags: ['Frontend', 'Web Audio', 'MediaRecorder', 'TypeScript', 'React', 'Canvas API'],
    rating: 4.92,
    reviewsCount: 98,
    resolvedCount: 29,
    responseSpeed: '< 5.1 mins',
    isAvailable: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    fullName: 'Marcus Vance',
    headline: 'Competitive Programmer & Algorithms Coach',
    bio: 'Ex-FAANG engineer mentoring students in Dynamic Programming, Graph Theory, Trees, and technical coding interview strategies.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    expertiseTags: ['Algorithms', 'Data Structures', 'Dynamic Programming', 'Graph Theory', 'Python', 'C++'],
    rating: 4.89,
    reviewsCount: 176,
    resolvedCount: 36,
    responseSpeed: '< 4.5 mins',
    isAvailable: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    fullName: 'Alex Rivera',
    headline: 'Principal Backend & Distributed Systems Architect',
    bio: 'Expert in FastAPI, PostgreSQL, Supabase JWT auth pipelines, pgvector similarity search, and high-throughput REST APIs.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    expertiseTags: ['Backend', 'FastAPI', 'PostgreSQL', 'Supabase', 'System Design', 'JWT Auth'],
    rating: 4.95,
    reviewsCount: 115,
    resolvedCount: 42,
    responseSpeed: '< 3.8 mins',
    isAvailable: true,
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    fullName: 'Priya Sharma',
    headline: 'AI/ML Systems Researcher & Speech Tech Lead',
    bio: 'Building voice AI pipelines with Whisper, Groq Llama 3, pgvector similarity search, and high-velocity vector embeddings.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    expertiseTags: ['AI/ML', 'Whisper', 'Groq', 'pgvector', 'Python', 'Vector Search'],
    rating: 4.99,
    reviewsCount: 160,
    resolvedCount: 54,
    responseSpeed: '< 2.9 mins',
    isAvailable: true,
  },
];

export const MentorDiscovery: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedMentorForQuestion, setSelectedMentorForQuestion] = useState<DirectoryMentor | null>(null);

  // Targeted Question Form State
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionDescription, setQuestionDescription] = useState('');
  const [questionCategory, setQuestionCategory] = useState('Frontend');
  const [isSubmittingTargeted, setIsSubmittingTargeted] = useState(false);
  const [targetedSuccessToast, setTargetedSuccessToast] = useState<string | null>(null);

  const tags = ['All', 'React', 'FastAPI', 'Algorithms', 'AI/ML', 'Frontend', 'Backend', 'pgvector', 'TypeScript'];

  const filteredMentors = DIRECTORY_MENTORS.filter((mentor) => {
    const matchesTag = selectedTag === 'All' || mentor.expertiseTags.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      mentor.fullName.toLowerCase().includes(query) ||
      mentor.headline.toLowerCase().includes(query) ||
      mentor.bio.toLowerCase().includes(query) ||
      mentor.expertiseTags.some((t) => t.toLowerCase().includes(query));

    return matchesTag && matchesSearch;
  });

  const handleOpenTargetedModal = (mentor: DirectoryMentor) => {
    setSelectedMentorForQuestion(mentor);
    setQuestionTitle('');
    setQuestionDescription('');
    setQuestionCategory(
      mentor.expertiseTags.includes('Algorithms') ? 'Algorithms' :
      mentor.expertiseTags.includes('Backend') ? 'Backend' :
      mentor.expertiseTags.includes('AI/ML') ? 'AI/ML' : 'Frontend'
    );
  };

  const handleSendTargetedQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorForQuestion || !questionTitle.trim() || !questionDescription.trim()) return;

    setIsSubmittingTargeted(true);

    const newDoubt: Doubt = {
      id: `targeted-${Date.now()}`,
      title: `[Direct Guidance] ${questionTitle.trim()}`,
      description: questionDescription.trim(),
      transcript: questionDescription.trim(),
      category: questionCategory,
      tags: ['targeted-guidance', ...selectedMentorForQuestion.expertiseTags.slice(0, 2)],
      urgency: 'Standard',
      status: 'pending',
      studentId: user?.id || '00000000-0000-0000-0000-000000000001',
      studentName: user?.fullName || user?.name || 'Alex Chen',
      matchedMentors: [selectedMentorForQuestion.id],
      createdAt: new Date().toISOString(),
    };

    // 1. Supabase Insert
    try {
      await supabase.from('doubts').insert([{
        student_id: user?.id || '00000000-0000-0000-0000-000000000001',
        title: newDoubt.title,
        description: newDoubt.description,
        transcript: newDoubt.transcript,
        category: newDoubt.category,
        tags: newDoubt.tags,
        status: 'pending',
        urgency: 'Standard',
        assigned_mentor_id: selectedMentorForQuestion.id,
      }]);
    } catch (e) {
      console.warn('Direct targeted insert notice, saved locally:', e);
    }

    // 2. Local Cache Update
    const currentCached = getLocalCachedDoubts();
    saveLocalCachedDoubts([newDoubt, ...currentCached]);

    setTargetedSuccessToast(`Question directly routed to ${selectedMentorForQuestion.fullName}!`);
    setSelectedMentorForQuestion(null);
    setIsSubmittingTargeted(false);
    setTimeout(() => setTargetedSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 border border-teal-200">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Volunteer Mentor Directory</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Discover Mentors & Request Targeted Guidance
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse vetted volunteer engineers from industry. Send questions directly to specialists in your domain.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{DIRECTORY_MENTORS.length} Active Domain Mentors</span>
        </div>
      </div>

      {/* Success Notification */}
      {targetedSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{targetedSuccessToast}</span>
          </div>
          <button onClick={() => setTargetedSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Category Filter Strip */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by mentor name, expertise, or background..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-slate-900 placeholder-slate-400 text-xs transition outline-hidden shadow-2xs"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Mentor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition duration-200 p-6 flex flex-col justify-between space-y-4 group"
          >
            <div>
              {/* Header: Avatar, Name, Rating */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-teal-700 transition">
                        {mentor.fullName}
                      </h3>
                      <ShieldCheck className="w-4 h-4 text-teal-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{mentor.headline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg text-amber-800 text-xs font-bold shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{mentor.rating.toFixed(2)}</span>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-600 mt-3.5 line-clamp-3 leading-relaxed">
                {mentor.bio}
              </p>

              {/* Expertise Tags */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {mentor.expertiseTags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Stats & Targeted Request Action */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{mentor.resolvedCount} Questions Solved</span>
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{mentor.responseSpeed}</span>
                </span>
              </div>

              <button
                type="button"
                id={`btn-ask-mentor-${mentor.id}`}
                onClick={() => handleOpenTargetedModal(mentor)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition hover:scale-[1.01] active:scale-99"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Targeted Question</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Targeted Question Modal */}
      {selectedMentorForQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMentorForQuestion.avatarUrl}
                  alt={selectedMentorForQuestion.fullName}
                  className="w-10 h-10 rounded-xl object-cover border"
                />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Ask {selectedMentorForQuestion.fullName}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedMentorForQuestion.headline}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMentorForQuestion(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTargetedQuestion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Question Title</label>
                <input
                  type="text"
                  required
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  placeholder="e.g. Architecture review for React Web Audio state manager"
                  className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Problem Details / Context</label>
                <textarea
                  required
                  rows={4}
                  value={questionDescription}
                  onChange={(e) => setQuestionDescription(e.target.value)}
                  placeholder="Explain what roadblock you are facing and what specific guidance you are seeking from this mentor..."
                  className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMentorForQuestion(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTargeted || !questionTitle.trim() || !questionDescription.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-2 transition hover:scale-[1.02] active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingTargeted ? 'Routing...' : 'Send to Mentor Queue'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorDiscovery;
