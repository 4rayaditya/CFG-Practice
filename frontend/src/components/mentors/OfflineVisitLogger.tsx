import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Home, 
  User, 
  Calendar, 
  FileText, 
  Activity, 
  ShieldAlert, 
  RefreshCw,
  X,
  Radio
} from 'lucide-react';
import type { StudentDossier, OfflineHomeVisit, User as UserType } from '../../types';
import { useVoiceToText } from '../../hooks/useVoiceToText';
import { recordOfflineHomeVisit } from '../../data/mockData';

interface OfflineVisitLoggerProps {
  assignedStudents: StudentDossier[];
  preSelectedStudent?: StudentDossier | null;
  currentUser: UserType | null;
  onVisitLogged?: (visit: OfflineHomeVisit) => void;
  onClose?: () => void;
}

export const OfflineVisitLogger: React.FC<OfflineVisitLoggerProps> = ({
  assignedStudents,
  preSelectedStudent,
  currentUser,
  onVisitLogged,
  onClose,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preSelectedStudent?.id || (assignedStudents.length > 0 ? assignedStudents[0].id : '')
  );

  const [visitDate, setVisitDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Field Observations State
  const [speechNotes, setSpeechNotes] = useState('');
  const [livingEnvironment, setLivingEnvironment] = useState('');
  const [academicObservations, setAcademicObservations] = useState('');
  const [riskLevel, setRiskLevel] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('Medium');
  const [actionItemsText, setActionItemsText] = useState('');
  const [executiveSummary, setExecutiveSummary] = useState('');

  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Voice-to-Text hook
  const {
    isListening,
    transcript: voiceTranscript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceToText();

  const selectedStudent = assignedStudents.find((s) => s.id === selectedStudentId);

  // Synchronize ongoing speech into notes
  useEffect(() => {
    if (voiceTranscript) {
      setSpeechNotes((prev) => {
        if (!prev) return voiceTranscript;
        return `${prev.trim()} ${voiceTranscript.trim()}`;
      });
      resetTranscript();
    }
  }, [voiceTranscript, resetTranscript]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  /**
   * Structure and summarize the voice-logged field notes using AI / heuristics
   */
  const handleGenerateSummary = () => {
    if (!speechNotes.trim()) {
      setErrorMsg('Please record or type your field visit observations first.');
      return;
    }

    setErrorMsg(null);
    setIsProcessingAI(true);

    setTimeout(() => {
      const text = speechNotes.toLowerCase();

      // Heuristic risk detection
      let detectedRisk: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
      if (text.includes('broken') || text.includes('distress') || text.includes('urgent') || text.includes('failing') || text.includes('quit') || text.includes('dropout')) {
        detectedRisk = 'Critical';
      } else if (text.includes('struggling') || text.includes('noise') || text.includes('missed') || text.includes('illness') || text.includes('chores')) {
        detectedRisk = 'High';
      } else if (text.includes('exam') || text.includes('slow') || text.includes('help')) {
        detectedRisk = 'Medium';
      }

      setRiskLevel(detectedRisk);

      // Auto-populate structured fields
      if (!livingEnvironment) {
        setLivingEnvironment(
          text.includes('room') || text.includes('lighting') || text.includes('desk') || text.includes('noise')
            ? `Field observation: ${speechNotes.slice(0, 140)}...`
            : 'Modest home environment; shared household area with standard connectivity.'
        );
      }

      if (!academicObservations) {
        setAcademicObservations(
          `Student demonstrated engagement during check-in. Assessed current milestone progress and study readiness for ${selectedStudent?.cradleStage || 'coursework'}.`
        );
      }

      if (!actionItemsText) {
        setActionItemsText(
          detectedRisk === 'Critical'
            ? '1. Provide emergency study resource / device replacement\n2. Schedule follow-up counselor call in 48 hours\n3. Coordinate with parents on study schedule'
            : detectedRisk === 'High'
            ? '1. Monitor weekly attendance closely\n2. Provide 1-on-1 tutoring support for core subjects\n3. Review milestone deadlines'
            : '1. Continue standard cradle-to-college check-in cadence\n2. Encourage portfolio project milestone submission'
        );
      }

      setExecutiveSummary(
        `Field visit conducted for ${selectedStudent?.name || 'Student'} on ${visitDate}. ${speechNotes.slice(0, 220)}. Identified ${detectedRisk} risk factors requiring proactive NGO field follow-up.`
      );

      setIsProcessingAI(false);
    }, 600);
  };

  /**
   * Save the home visit record and broadcast to Admin
   */
  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setErrorMsg('Please select a student.');
      return;
    }

    if (!speechNotes.trim() && !executiveSummary.trim()) {
      setErrorMsg('Please enter visit notes or generate a summary before saving.');
      return;
    }

    const actionItems = actionItemsText
      .split('\n')
      .map((item) => item.replace(/^[0-9.-]+\s*/, '').trim())
      .filter(Boolean);

    const newVisit: OfflineHomeVisit = {
      id: `visit-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      mentorId: currentUser?.id || '00000000-0000-0000-0000-000000000001',
      mentorName: currentUser?.fullName || currentUser?.name || 'Mentor Counselor',
      visitDate: new Date(visitDate).toISOString(),
      rawSpeechTranscript: speechNotes.trim(),
      summary: executiveSummary.trim() || speechNotes.trim(),
      livingEnvironment: livingEnvironment.trim() || 'Home environment evaluated during offline field visit.',
      academicObservations: academicObservations.trim() || 'Observations recorded during in-person check-in.',
      riskLevel,
      actionItems: actionItems.length > 0 ? actionItems : ['Follow up during next monthly check-in'],
      tags: ['Offline Field Visit', `${riskLevel} Risk`, selectedStudent.cradleStage],
      createdAt: new Date().toISOString(),
    };

    recordOfflineHomeVisit(newVisit);
    setIsSaved(true);

    if (onVisitLogged) {
      onVisitLogged(newVisit);
    }

    setTimeout(() => {
      if (onClose) onClose();
    }, 1500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
            <Home className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-400/30">
                Offline Field Tool
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Mentor Home Visit & Voice Reporter
            </h2>
            <p className="text-xs text-slate-300">
              Speak or log your in-person observations. Generates summaries for the Admin Dashboard.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSaveVisit} className="p-6 space-y-6">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSaved && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold">Home visit logged successfully!</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                The student record has been updated and the executive summary has been sent to the Admin Dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Row 1: Student Selection & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Assigned Student Visited *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              required
            >
              {assignedStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.cradleStage})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Date of Field Visit *
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
              required
            />
          </div>
        </div>

        {/* Row 2: Speech-to-Text Voice Dictation Area */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/40 border border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Mic className={`w-4 h-4 ${isListening ? 'text-rose-600 animate-pulse' : 'text-emerald-600'}`} />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Voice Field Notes (Speech-to-Text)
              </span>
            </div>

            {/* Voice Dictation Button */}
            <button
              type="button"
              id="btn-voice-dictation"
              onClick={handleToggleListening}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {isListening ? (
                <>
                  <Radio className="w-3.5 h-3.5 animate-spin" />
                  <span>Listening... Tap to Stop</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>Start Voice Recording</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={4}
            value={speechNotes}
            onChange={(e) => setSpeechNotes(e.target.value)}
            placeholder="Dictate or type everything you saw during your visit to the student's home: family situation, study environment, lighting, books, emotional mood, academic roadblocks..."
            className="w-full p-3.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition leading-relaxed placeholder:text-slate-400"
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] text-slate-500 font-medium">
              💡 Tip: Speak naturally about the student's environment, study desk, family support, and challenges.
            </span>
            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={isProcessingAI || !speechNotes.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs transition disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-emerald-600 ${isProcessingAI ? 'animate-spin' : ''}`} />
              <span>{isProcessingAI ? 'Analyzing...' : 'Structure & Summarize Report'}</span>
            </button>
          </div>
        </div>

        {/* Row 3: Structured AI Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Living & Study Environment Observations
            </label>
            <textarea
              rows={3}
              value={livingEnvironment}
              onChange={(e) => setLivingEnvironment(e.target.value)}
              placeholder="e.g. Quiet study corner available, lighting conditions, device access..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Academic & Emotional Well-Being
            </label>
            <textarea
              rows={3}
              value={academicObservations}
              onChange={(e) => setAcademicObservations(e.target.value)}
              placeholder="e.g. High enthusiasm for math, struggling with physics, confident in college applications..."
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Row 4: Risk Level & Action Items */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Environmental Risk Level
            </label>
            <select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value as any)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition ${
                riskLevel === 'Critical' ? 'bg-rose-50 border-rose-300 text-rose-800' :
                riskLevel === 'High' ? 'bg-amber-50 border-amber-300 text-amber-800' :
                riskLevel === 'Medium' ? 'bg-sky-50 border-sky-300 text-sky-800' :
                'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}
            >
              <option value="Critical">🔴 Critical (Immediate field intervention required)</option>
              <option value="High">🟠 High (Frequent check-ins needed)</option>
              <option value="Medium">🟡 Medium (Monitor standard progress)</option>
              <option value="Low">🟢 Low / Stable (Healthy study conditions)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Recommended Action Items (1 per line)
            </label>
            <textarea
              rows={2}
              value={actionItemsText}
              onChange={(e) => setActionItemsText(e.target.value)}
              placeholder="1. Provide rechargeable study lamp&#10;2. Schedule math peer tutoring&#10;3. Follow-up call next Tuesday"
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Row 5: Executive Summary for Admin Dashboard */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
            Executive Summary (Rolls up to Admin Dashboard Live Feed) *
          </label>
          <textarea
            rows={2}
            value={executiveSummary}
            onChange={(e) => setExecutiveSummary(e.target.value)}
            placeholder="A concise, high-level summary that the Director and Program Admins will see on their executive telemetry feed..."
            className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-emerald-500 transition font-medium"
            required
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            id="btn-save-home-visit"
            disabled={isSaved}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-98 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Home Visit & Broadcast to Admin</span>
          </button>
        </div>
      </form>
    </div>
  );
};
