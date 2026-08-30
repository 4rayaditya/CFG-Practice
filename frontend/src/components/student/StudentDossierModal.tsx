import React from 'react';
import { 
  X, 
  User, 
  GraduationCap, 
  Clock, 
  Calendar, 
  Heart, 
  AlertTriangle, 
  CheckCircle2, 
  Home, 
  FileText, 
  Mic, 
  Award, 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  Target, 
  ShieldCheck, 
  ArrowRight,
  Send,
  MessageSquare
} from 'lucide-react';
import type { StudentDossier } from '../../types';
import { evaluateStudentPriority } from '../../utils/studentPriorityEngine';

interface StudentDossierModalProps {
  student: StudentDossier | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenHomeVisitLogger?: (student: StudentDossier) => void;
  isMentorView?: boolean;
}

export const StudentDossierModal: React.FC<StudentDossierModalProps> = ({
  student,
  isOpen,
  onClose,
  onOpenHomeVisitLogger,
  isMentorView = false,
}) => {
  if (!isOpen || !student) return null;

  const priority = student.priorityEvaluation || evaluateStudentPriority(student);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-extrabold tracking-tight">{student.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  {student.cradleStage}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {student.financialAidStatus}
                </span>
              </div>
              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
                <span>{student.schoolOrCollege}</span>
                <span>•</span>
                <span>Age: {student.age} yrs</span>
                <span>•</span>
                <span>Assigned Mentor: <strong className="text-sky-300 font-semibold">{student.assignedMentorName}</strong></span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* Section 1: Rule-Based Priority Engine Assessment Card */}
          <div className={`p-5 rounded-2xl border ${priority.badgeBg} ${priority.badgeBorder} space-y-3`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${priority.tier === 'CRITICAL' ? 'text-rose-600 animate-pulse' : priority.tier === 'HIGH' ? 'text-amber-600' : 'text-sky-600'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Priority Engine Risk Score:
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${priority.badgeBg} ${priority.badgeText} border ${priority.badgeBorder}`}>
                  {priority.badgeLabel} • Score {priority.score}/100
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Last Home Visit: {student.lastHomeVisitDate ? `${priority.daysSinceLastVisit} days ago` : 'Never visited'}
              </span>
            </div>

            {/* Triggered Rules List */}
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-700 block">Triggered Rule Assessment:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {priority.triggeredRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-white/80 px-2.5 py-1.5 rounded-lg border border-slate-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended NGO Field Action */}
            <div className="pt-2 border-t border-slate-200/60 text-xs font-semibold text-slate-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-bold">Recommended Field Action:</span>
                <span>{priority.recommendedAction}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Key Academic & Telemetry Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Attendance</span>
                <Clock className="w-4 h-4 text-sky-600" />
              </div>
              <div className={`text-2xl font-black ${student.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-900'}`}>
                {student.attendanceRate}%
              </div>
              <span className="text-[11px] text-slate-500">{student.attendanceRate < 75 ? '⚠️ Below NGO baseline' : 'Consistent record'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Academic Score</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
              <div className={`text-2xl font-black ${student.academicScore < 65 ? 'text-rose-600' : 'text-slate-900'}`}>
                {student.academicScore}%
              </div>
              <span className="text-[11px] text-slate-500">Core subject tests</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Open Doubts</span>
                <MessageSquare className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {student.unresolvedDoubtsCount} <span className="text-xs font-normal text-slate-400">/ {student.doubtsCount}</span>
              </div>
              <span className="text-[11px] text-slate-500">{student.unresolvedDoubtsCount > 0 ? 'Pending mentor answer' : 'All doubts resolved'}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Home Visits</span>
                <Home className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {student.homeVisits?.length || 0}
              </div>
              <span className="text-[11px] text-slate-500">
                {priority.daysSinceLastVisit > 30 ? '⚠️ Visit Overdue' : `${priority.daysSinceLastVisit}d since visit`}
              </span>
            </div>
          </div>

          {/* Section 3: Career Track & Skills */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-slate-900">Cradle-to-College Pathway</h3>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                Dream: <strong className="text-sky-700 font-bold">{student.dreamCareer}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Active Curriculum Track: <strong className="text-slate-800">{student.trackTitle}</strong>
            </p>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase text-slate-500">Mastered Competencies & Interests:</span>
              <div className="flex flex-wrap gap-1.5">
                {student.skillsMastered.map((s) => (
                  <span key={s} className="px-2.5 py-1 rounded-lg text-xs bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    ✓ {s}
                  </span>
                ))}
                {student.learningInterests.map((interest) => (
                  <span key={interest} className="px-2.5 py-1 rounded-lg text-xs bg-sky-100 text-sky-800 font-medium border border-sky-200">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Offline Home Visit Logs & Speech-to-Text Transcripts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Offline Field Home Visits ({student.homeVisits?.length || 0})</h3>
              </div>
              {onOpenHomeVisitLogger && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenHomeVisitLogger(student);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Log New Home Visit</span>
                </button>
              )}
            </div>

            {student.homeVisits && student.homeVisits.length > 0 ? (
              <div className="space-y-3">
                {student.homeVisits.map((visit) => (
                  <div key={visit.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Field Counselor: {visit.mentorName}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{new Date(visit.visitDate).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${
                        visit.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        visit.riskLevel === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {visit.riskLevel} Risk Environment
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-700">
                      <div className="font-semibold text-slate-900">Summary & Living Observations:</div>
                      <p className="leading-relaxed">{visit.summary}</p>
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <strong>Environment:</strong> {visit.livingEnvironment}
                      </div>
                    </div>

                    {visit.rawSpeechTranscript && (
                      <div className="p-2.5 rounded-lg bg-sky-50/50 border border-sky-100 text-[11px] text-sky-900 flex items-start gap-2">
                        <Mic className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Voice Transcript:</strong> "{visit.rawSpeechTranscript}"
                        </div>
                      </div>
                    )}

                    {visit.actionItems && visit.actionItems.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Action Items:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {visit.actionItems.map((action, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                              • {action}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                <AlertTriangle className="w-6 h-6 text-amber-600 mx-auto" />
                <p className="text-xs font-semibold text-amber-900">No offline home visits logged for this student yet.</p>
                <p className="text-[11px] text-amber-700">Field counselors must conduct an in-person intake visit to evaluate study conditions and family support.</p>
              </div>
            )}
          </div>

          {/* Section 5: Recent Doubt Roadblocks */}
          {student.recentDoubts && student.recentDoubts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900">Recent Doubts & Roadblocks</h3>
              </div>
              <div className="space-y-2">
                {student.recentDoubts.map((d) => (
                  <div key={d.id} className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{d.title}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.urgency === 'Urgent' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                        {d.urgency || 'Standard'}
                      </span>
                    </div>
                    <p className="text-slate-600">{d.description}</p>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                      <span>Category: {d.category}</span>
                      <span>•</span>
                      <span>Status: <strong className={d.status === 'resolved' ? 'text-emerald-600' : 'text-amber-600'}>{d.status}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Student ID: <span className="font-mono font-semibold text-slate-700">{student.id}</span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenHomeVisitLogger && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHomeVisitLogger(student);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Log Home Visit</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
