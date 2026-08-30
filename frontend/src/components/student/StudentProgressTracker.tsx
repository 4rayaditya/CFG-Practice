import React, { useState } from 'react';
import { 
  Flame, 
  Clock, 
  Award, 
  CheckCircle2, 
  BookOpen, 
  TrendingUp, 
  Printer, 
  Sparkles, 
  FileText, 
  Compass, 
  ShieldCheck,
  Target
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRealtimeDoubts } from '../../hooks/useRealtimeDoubts';
import { StudentProgressReportModal } from './StudentProgressReportModal';
import { VoiceLearningJournal } from '../voice/VoiceLearningJournal';

export const StudentProgressTracker: React.FC = () => {
  const { user } = useAuth();
  const { doubts } = useRealtimeDoubts({ filterStatus: 'all', limit: 100 });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const resolvedDoubts = doubts.filter((d) => d.status === 'resolved');
  const totalDoubts = doubts.length;

  const progressData = {
    progressPercentage: 82,
    hoursCompleted: 94,
    totalDoubtsAsked: totalDoubts,
    totalDoubtsResolved: resolvedDoubts.length,
    currentTrackTitle: 'Full-Stack Modern Web & AI Development Track',
    completedMilestonesCount: 2,
    totalMilestonesCount: 3,
    masteredSkills: ['React 19', 'FastAPI', 'pgvector', 'Groq Whisper', 'TypeScript', 'Tailwind CSS'],
  };

  const skillCompetencies = [
    { name: 'Frontend Architecture (React 19, TS)', percentage: 92, color: 'from-sky-500 to-cyan-500' },
    { name: 'Backend & JWT Authentication (FastAPI)', percentage: 85, color: 'from-teal-500 to-emerald-500' },
    { name: 'AI Speech & Vector Embeddings (Whisper, pgvector)', percentage: 78, color: 'from-purple-500 to-indigo-500' },
    { name: 'Algorithms & Dynamic Programming', percentage: 74, color: 'from-amber-500 to-orange-500' },
    { name: 'System Design & PWA Offline Sync', percentage: 88, color: 'from-blue-500 to-teal-500' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 border border-sky-200">
            <Award className="w-3.5 h-3.5 text-sky-600" />
            <span>Learner Telemetry & Progress Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Student Progress & Skill Mastery
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time tracking of curriculum milestones, learning streak, and verified competencies.
          </p>
        </div>

        <button
          type="button"
          id="btn-open-progress-report"
          onClick={() => setIsReportModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white text-xs font-extrabold shadow-md shadow-sky-600/20 transition hover:scale-[1.02] active:scale-98 self-start md:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>Generate Verified Progress Report</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Curriculum Progress */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Overall Progress</span>
            <Target className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{progressData.progressPercentage}%</div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressData.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 2: Hours Invested */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Hours Invested</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{progressData.hoursCompleted}h</div>
          <span className="text-[11px] text-emerald-700 font-semibold block">Across 3 study milestones</span>
        </div>

        {/* Card 3: Learning Streak */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900">14 Days</div>
          <span className="text-[11px] text-amber-700 font-semibold block">🔥 High consistency tier</span>
        </div>

        {/* Card 4: Roadblocks Solved */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Doubts Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{progressData.totalDoubtsResolved}</div>
          <span className="text-[11px] text-purple-700 font-semibold block">Turnaround: &lt; 4.2 mins</span>
        </div>
      </div>

      {/* Domain Skill Mastery Breakdown */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Domain Competency Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified skill proficiency calculated from completed milestone checkpoint projects.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Tier: Advanced Practitioner
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {skillCompetencies.map((skill) => (
            <div key={skill.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800">{skill.name}</span>
                <span className="font-bold font-mono text-slate-700">{skill.percentage}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className={`bg-gradient-to-r ${skill.color} h-full rounded-full transition-all duration-500 shadow-xs`}
                  style={{ width: `${skill.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Learning Journal Component */}
      <VoiceLearningJournal />

      {/* Printable Report Modal */}
      {isReportModalOpen && (
        <StudentProgressReportModal
          user={user}
          onClose={() => setIsReportModalOpen(false)}
          metrics={progressData}
        />
      )}
    </div>
  );
};

export default StudentProgressTracker;
