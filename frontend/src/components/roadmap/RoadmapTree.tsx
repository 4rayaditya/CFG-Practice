import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Trophy, 
  Target, 
  Layers, 
  Flame, 
  RefreshCw, 
  Plus, 
  Check, 
  Share2,
  Cloud,
  CloudOff,
  Radio,
  X,
  AlertTriangle
} from 'lucide-react';
import { useRoadmapProgress } from '../../hooks/useRoadmapProgress';

export interface ResourceItem {
  name: string;
  url: string;
  type?: string;
}

export interface MilestoneItem {
  id: number;
  title: string;
  description: string;
  estimated_hours: number;
  subtasks: string[];
  resources: ResourceItem[];
  checkpoint_project: string;
  key_skills: string[];
}

export interface RoadmapData {
  track_title: string;
  summary: string;
  total_estimated_hours: number;
  skill_level: string;
  target_timeline: string;
  milestones: MilestoneItem[];
}

export interface RoadmapTreeProps {
  initialRoadmap?: RoadmapData;
  onGenerateNewRoadmap?: (goal: string, skillLevel: string, timeline: string) => Promise<void> | void;
  isGenerating?: boolean;
  className?: string;
}

const DEFAULT_ROADMAP: RoadmapData = {
  track_title: 'Full-Stack Modern Web & AI Development Track',
  summary: 'Master full-stack React 19 architecture, local JWT auth, Groq Whisper voice intake, and pgvector semantic mentor matching.',
  total_estimated_hours: 115,
  skill_level: 'Intermediate',
  target_timeline: '3 months',
  milestones: [
    {
      id: 1,
      title: 'Phase 1: React 19, TypeScript & Web Audio Intake',
      description: 'Master typed React component design, Tailwind CSS styling tokens, and HTML5 Web Audio API waveform visualization.',
      estimated_hours: 35,
      subtasks: [
        'Create accessible glassmorphic UI cards with micro-animations',
        'Implement MediaRecorder audio stream capture and canvas waveform spectrum',
        'Enforce role-based layout redirects and 403 authorization boundaries'
      ],
      resources: [
        { name: 'React Official Documentation', url: 'https://react.dev', type: 'docs' },
        { name: 'MDN Web Audio API Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API', type: 'docs' },
        { name: 'Tailwind CSS Documentation', url: 'https://tailwindcss.com/docs', type: 'docs' }
      ],
      checkpoint_project: 'Voice Intake Audio Recorder component with live animated spectrum canvas.',
      key_skills: ['React 19', 'TypeScript', 'Tailwind CSS', 'Web Audio API']
    },
    {
      id: 2,
      title: 'Phase 2: FastAPI Backend & Local JWT Verification',
      description: 'Build asynchronous REST API services with local HS256 JWT signature verification and role guards.',
      estimated_hours: 35,
      subtasks: [
        'Set up FastAPI application with CORS and Pydantic validation',
        'Implement zero-roundtrip Supabase JWT authentication middleware',
        'Integrate Groq Whisper API (whisper-large-v3) for speech transcription'
      ],
      resources: [
        { name: 'FastAPI Tutorial', url: 'https://fastapi.tiangolo.com/tutorial/', type: 'docs' },
        { name: 'Groq Cloud Documentation', url: 'https://console.groq.com/docs', type: 'docs' },
        { name: 'PyJWT Documentation', url: 'https://pyjwt.readthedocs.io', type: 'docs' }
      ],
      checkpoint_project: 'Secure FastAPI backend service with role guards and audio transcription endpoint.',
      key_skills: ['FastAPI', 'JWT Auth', 'Groq Whisper', 'Pydantic', 'Python']
    },
    {
      id: 3,
      title: 'Phase 3: Vector Embeddings, Mentor Matching & PWA Offline Sync',
      description: 'Connect pgvector similarity search, Groq Llama 3 classification, and service worker background sync.',
      estimated_hours: 45,
      subtasks: [
        'Implement 384-dimensional query embedding generation with all-MiniLM-L6-v2',
        'Create Supabase match_mentors RPC function for Cosine similarity search',
        'Configure PWA manifest and offline IndexedDB voice query caching'
      ],
      resources: [
        { name: 'Supabase pgvector Docs', url: 'https://supabase.com/docs/guides/ai', type: 'docs' },
        { name: 'pgvector GitHub Repository', url: 'https://github.com/pgvector/pgvector', type: 'github' },
        { name: 'Vite PWA Plugin Guide', url: 'https://vite-pwa-org.netlify.app', type: 'docs' }
      ],
      checkpoint_project: 'Full-Stack MentorMatch AI platform with offline audio sync and live mentor matching.',
      key_skills: ['pgvector', 'HNSW Indexes', 'PWA', 'IndexedDB', 'Supabase']
    }
  ]
};

export const RoadmapTree: React.FC<RoadmapTreeProps> = ({
  initialRoadmap,
  onGenerateNewRoadmap,
  isGenerating = false,
  className = '',
}) => {
  // Use custom hook for optimistic state, background sync, and offline queueing
  const {
    roadmap: hookRoadmap,
    completedSubtasks,
    toggleSubtask,
    metrics,
    isOnline,
    syncStatus,
    syncToast,
    celebrationMilestone,
    setCelebrationMilestone,
    dismissToast,
  } = useRoadmapProgress(initialRoadmap || DEFAULT_ROADMAP);

  const roadmap = hookRoadmap || DEFAULT_ROADMAP;

  const [expandedMilestones, setExpandedMilestones] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
  });

  // New Roadmap Intake Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [customSkill, setCustomSkill] = useState('Intermediate');
  const [customTimeline, setCustomTimeline] = useState('3 months');

  const toggleAccordion = (id: number) => {
    setExpandedMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoal.trim()) return;
    if (onGenerateNewRoadmap) {
      await onGenerateNewRoadmap(customGoal, customSkill, customTimeline);
    }
    setIsModalOpen(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* --------------------------------------------------------------------- */}
      {/* OFFLINE & SYNC TOAST FEEDBACK */}
      {/* --------------------------------------------------------------------- */}
      {syncToast && (
        <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${
          syncToast.type === 'warning'
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : syncToast.type === 'success'
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-sky-50 text-sky-900 border-sky-200'
        }`}>
          <div className="flex items-center gap-2">
            {syncToast.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : syncToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Radio className="w-4 h-4 text-sky-600 shrink-0 animate-pulse" />
            )}
            <span>{syncToast.message}</span>
          </div>
          <button onClick={dismissToast} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* CELEBRATORY MILESTONE COMPLETION BANNER */}
      {/* --------------------------------------------------------------------- */}
      {celebrationMilestone && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-600 text-white shadow-xl shadow-emerald-500/20 flex items-center justify-between animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-amber-300 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-md">
                  Phase Achieved!
                </span>
                <span className="text-xs font-semibold">🎉 +{roadmap.milestones.find(m => m.id === celebrationMilestone.id)?.estimated_hours || 35} Hours Earned</span>
              </div>
              <h4 className="text-sm font-extrabold mt-0.5">
                Congratulations on finishing: {celebrationMilestone.title}
              </h4>
            </div>
          </div>
          <button
            onClick={() => setCelebrationMilestone(null)}
            className="p-1.5 rounded-xl hover:bg-white/20 transition text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* ROADMAP PROGRESS OVERVIEW HEADER CARD */}
      {/* --------------------------------------------------------------------- */}
      <div className="light-panel p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
                <CompassIcon className="w-3.5 h-3.5" />
                <span>Personalized Career Track</span>
              </div>

              {/* Sync Status Badge */}
              <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                syncStatus === 'synced'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : syncStatus === 'queued'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse'
              }`}>
                {syncStatus === 'synced' ? (
                  <>
                    <Cloud className="w-3 h-3 text-emerald-600" />
                    <span>Cloud Synced</span>
                  </>
                ) : syncStatus === 'queued' ? (
                  <>
                    <CloudOff className="w-3 h-3 text-amber-600" />
                    <span>Offline Queued</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" />
                    <span>Syncing...</span>
                  </>
                )}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {roadmap.track_title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {roadmap.summary}
            </p>
          </div>

          {/* Quick Action: Generate Custom Pathway */}
          <button
            type="button"
            id="btn-open-roadmap-modal"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition hover:scale-[1.02] active:scale-98 self-start md:self-auto shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Generate New AI Pathway</span>
          </button>
        </div>

        {/* Progress Bar & Badges */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Curriculum Progress</span>
              <span className="text-slate-400 font-normal">({metrics.completedCount} of {metrics.totalSubtasks} tasks completed)</span>
            </div>
            <span className="text-sm font-extrabold text-sky-700 font-mono">
              {metrics.progressPercentage}% Complete
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-200/80">
            <div
              className="bg-gradient-to-r from-sky-600 via-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${metrics.progressPercentage}%` }}
            />
          </div>

          {/* Track Metadata Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                🎯 Level: {roadmap.skill_level}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                ⏱ Target Timeline: {roadmap.target_timeline}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                📚 {roadmap.milestones.length} Milestone Phases
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{metrics.hoursCompleted} / {roadmap.total_estimated_hours} Hours Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* ACCORDION TIMELINE TREE */}
      {/* --------------------------------------------------------------------- */}
      <div className="space-y-5 relative">
        {/* Vertical Timeline Guide Line */}
        <div className="absolute left-6.5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-sky-300 via-emerald-300 to-slate-200 hidden sm:block -z-0" />

        {roadmap.milestones.map((milestone) => {
          const isExpanded = !!expandedMilestones[milestone.id];
          const mSubtasks = milestone.subtasks || [];
          const mCompleted = mSubtasks.filter((_, idx) => completedSubtasks[`${milestone.id}-${idx}`]).length;
          const isPhaseDone = mSubtasks.length > 0 && mCompleted === mSubtasks.length;

          return (
            <div
              key={milestone.id}
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs relative z-10 ${
                isPhaseDone
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200/90 hover:border-sky-300'
              }`}
            >
              {/* Milestone Accordion Header */}
              <div
                onClick={() => toggleAccordion(milestone.id)}
                className="p-5 sm:p-6 cursor-pointer flex items-center justify-between gap-4 select-none hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  {/* Step Badge */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                    isPhaseDone
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : mCompleted > 0
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {isPhaseDone ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <span>{milestone.id}</span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-700">
                        Phase {milestone.id}
                      </span>
                      {isPhaseDone && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          Complete
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base sm:text-lg font-bold ${isPhaseDone ? 'text-slate-800' : 'text-slate-900'}`}>
                      {milestone.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Hours & Task Counter Pill */}
                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>~{milestone.estimated_hours}h</span>
                    <span>•</span>
                    <span className={isPhaseDone ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                      {mCompleted}/{mSubtasks.length} tasks
                    </span>
                  </div>

                  <button
                    type="button"
                    aria-label={isExpanded ? 'Collapse milestone' : 'Expand milestone'}
                    className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Accordion Content Body */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 animate-in fade-in duration-150">
                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {milestone.description}
                  </p>

                  {/* Subtasks Checklist */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Milestone Action Items & Checkpoints:
                    </span>
                    <div className="space-y-2">
                      {mSubtasks.map((task, tIdx) => {
                        const key = `${milestone.id}-${tIdx}`;
                        const isDone = !!completedSubtasks[key];

                        return (
                          <div
                            key={tIdx}
                            onClick={() => toggleSubtask(milestone.id, tIdx, milestone.title)}
                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                              isDone
                                ? 'bg-emerald-50/60 border-emerald-200 text-slate-600'
                                : 'bg-slate-50/70 border-slate-200 hover:border-sky-300 text-slate-800'
                            }`}
                          >
                            <button
                              type="button"
                              aria-label={`Toggle task: ${task}`}
                              className="mt-0.5 shrink-0 transition-transform active:scale-90"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-400 hover:text-sky-600" />
                              )}
                            </button>
                            <span className={`text-xs font-medium leading-relaxed ${isDone ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                              {task}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hands-On Checkpoint Project */}
                  {milestone.checkpoint_project && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/80 to-emerald-50/60 border border-sky-100 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <Target className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-800 block">
                          Phase Demonstration Project
                        </span>
                        <p className="text-xs font-semibold text-slate-800">
                          {milestone.checkpoint_project}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Resources & Key Skills */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    {milestone.resources && milestone.resources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                          <span>Resources:</span>
                        </span>
                        {milestone.resources.map((res, rIdx) => (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-semibold transition"
                          >
                            <span>{res.name}</span>
                            <ExternalLink className="w-3 h-3 text-sky-600" />
                          </a>
                        ))}
                      </div>
                    )}

                    {milestone.key_skills && milestone.key_skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {milestone.key_skills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-mono"
                          >
                            #{skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* AI ROADMAP GENERATOR MODAL */}
      {/* --------------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Generate AI Learning Pathway</h3>
                  <p className="text-xs text-slate-500">Powered by Groq Llama 3 & MentorMatch AI</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  What is your primary career or technical goal?
                </label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. AI Systems Engineer, FAANG LeetCode DP, Full-Stack React"
                  required
                  className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Current Skill Level
                  </label>
                  <select
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-sky-500 transition"
                  >
                    <option value="Beginner">Beginner (Foundations)</option>
                    <option value="Intermediate">Intermediate (Practitioner)</option>
                    <option value="Advanced">Advanced (Specialist)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Target Timeline
                  </label>
                  <select
                    value={customTimeline}
                    onChange={(e) => setCustomTimeline(e.target.value)}
                    className="w-full text-xs text-slate-800 p-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-sky-500 transition"
                  >
                    <option value="6 weeks">6 Weeks (Intensive)</option>
                    <option value="3 months">3 Months (Standard)</option>
                    <option value="6 months">6 Months (Comprehensive)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !customGoal.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-2 transition hover:scale-[1.02] active:scale-98 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Pathway...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Generate Custom Roadmap</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CompassIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);
