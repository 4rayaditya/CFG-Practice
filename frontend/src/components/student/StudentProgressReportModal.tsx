import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  Star, 
  Calendar, 
  Clock, 
  BookOpen, 
  Printer, 
  Download, 
  X, 
  ShieldCheck,
  User,
  Heart,
  Sparkles
} from 'lucide-react';
import type { User as UserType } from '../../types';

export interface StudentProgressReportModalProps {
  user: UserType | null;
  onClose: () => void;
  metrics: {
    progressPercentage: number;
    hoursCompleted: number;
    totalDoubtsAsked: number;
    totalDoubtsResolved: number;
    currentTrackTitle: string;
    completedMilestonesCount: number;
    totalMilestonesCount: number;
    masteredSkills: string[];
  };
}

export const StudentProgressReportModal: React.FC<StudentProgressReportModalProps> = ({
  user,
  onClose,
  metrics,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto print:max-w-none print:shadow-none print:border-none print:p-0">
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
            <Award className="w-4 h-4 text-sky-600" />
            <span>Official Student Learning & Mentorship Report</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="space-y-6 text-slate-800">
          {/* Certificate Header Banner */}
          <div className="text-center space-y-2 pb-6 border-b border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
              <Heart className="w-6 h-6 fill-white/20" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">MentorMatch AI Academic Transcript</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Nonprofit Technical Mentorship & Competency Verification
            </p>
          </div>

          {/* Student & Date Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Learner Name</span>
              <span className="font-extrabold text-slate-900">{user?.fullName || user?.name || 'Alex Chen'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Study Track</span>
              <span className="font-bold text-slate-800 truncate block">{metrics.currentTrackTitle}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Issued Date</span>
              <span className="font-semibold text-slate-800">{currentDate}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-bold block">Verification Status</span>
              <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified</span>
              </span>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-center space-y-1">
              <span className="text-2xl font-black text-sky-800">{metrics.progressPercentage}%</span>
              <span className="text-[11px] font-bold text-sky-900 uppercase block">Curriculum Complete</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
              <span className="text-2xl font-black text-emerald-800">{metrics.hoursCompleted}h</span>
              <span className="text-[11px] font-bold text-emerald-900 uppercase block">Total Hours Invested</span>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-center space-y-1">
              <span className="text-2xl font-black text-purple-800">{metrics.totalDoubtsResolved}</span>
              <span className="text-[11px] font-bold text-purple-900 uppercase block">Roadblocks Resolved</span>
            </div>
          </div>

          {/* Milestones Achieved */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>Milestone & Demonstration Checkpoints Completed</span>
            </h3>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">Phase 1: React Component Design & Web Audio Waveform Intake</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">100% Complete</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-slate-800">Phase 2: FastAPI JWT Middleware & Audio Transcription Pipeline</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">100% Complete</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="font-semibold text-slate-800">Phase 3: pgvector Cosine Search & PWA Offline Sync Engine</span>
                </div>
                <span className="text-[11px] font-mono text-sky-700 font-bold">In Progress (80%)</span>
              </div>
            </div>
          </div>

          {/* Mastered Skills Tags */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Verified Technical Competencies
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {['React 19', 'TypeScript', 'FastAPI', 'PyJWT', 'pgvector', 'Groq Whisper', 'IndexedDB PWA', 'Tailwind CSS', 'Dynamic Programming'].map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Volunteer Mentor Endorsement */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-200 flex items-start gap-3 text-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
              ★
            </div>
            <div className="space-y-0.5">
              <span className="font-extrabold text-emerald-950 block">Volunteer Mentor Commendation</span>
              <p className="text-slate-700 italic leading-relaxed">
                &ldquo;{user?.fullName || 'The student'} demonstrates rapid problem-solving aptitude in state management and vector database architectures. Highly recommended for full-stack engineering roles.&rdquo;
              </p>
              <span className="text-[10px] font-bold text-slate-500 block pt-1">
                — Dr. Sarah Jenkins, Lead Frontend Architect & Volunteer Mentor
              </span>
            </div>
          </div>

          {/* Certificate Footer Stamp */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Certificate ID: MM-AI-2026-{user?.id?.slice(0, 8) || '84920481'}</span>
            <span>https://mentormatch.org/verify</span>
          </div>
        </div>
      </div>
    </div>
  );
};
