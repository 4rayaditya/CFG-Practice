import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  Search, 
  Filter, 
  AlertTriangle, 
  Home, 
  Mic, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  BookOpen, 
  Award, 
  Send, 
  Radio, 
  RefreshCw, 
  MessageSquare, 
  Heart, 
  FileText, 
  Tag, 
  ChevronRight, 
  X,
  PhoneCall
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRealtimeDoubts } from '../../hooks/useRealtimeDoubts';
import { useVoiceToText } from '../../hooks/useVoiceToText';
import { 
  getPersistedStudents, 
  getPersistedMentors, 
  getPersistedMentorshipRequests,
  updateMentorshipRequestStatus 
} from '../../data/mockData';
import { evaluateStudentPriority, sortStudentsByPriority } from '../../utils/studentPriorityEngine';
import { StudentDossierModal } from '../student/StudentDossierModal';
import { OfflineVisitLogger } from './OfflineVisitLogger';
import type { StudentDossier, Doubt, MentorshipRequest, OfflineHomeVisit } from '../../types';

export const MentorBoard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'assigned-students' | 'visit-logger' | 'doubts' | 'requests'>('assigned-students');
  
  // Data State
  const [students, setStudents] = useState<StudentDossier[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<StudentDossier | null>(null);
  const [selectedStudentForVisitLogger, setSelectedStudentForVisitLogger] = useState<StudentDossier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL'>('All');

  // Real-time Doubts for answering
  const { doubts, loading: doubtsLoading, refetch: refetchDoubts, updateOptimisticDoubt } = useRealtimeDoubts({
    filterStatus: 'all',
    limit: 50,
  });

  // Doubt Answering State
  const [activeAnsweringDoubt, setActiveAnsweringDoubt] = useState<Doubt | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Voice-to-Text for answering doubts
  const {
    isListening: isVoiceAnswering,
    transcript: voiceAnswerTranscript,
    startListening: startVoiceAnswering,
    stopListening: stopVoiceAnswering,
    resetTranscript: resetVoiceAnswering,
  } = useVoiceToText();

  const loadData = () => {
    const allStudents = getPersistedStudents();
    const mentors = getPersistedMentors();

    // Identify current mentor profile
    const currentMentorProfile = mentors.find(
      (m) => m.email.toLowerCase() === user?.email?.toLowerCase() || m.id === user?.id
    ) || mentors[0]; // fallback to Dr. Sarah Jenkins

    // Filter STRICTLY to students assigned under this mentor (the 3 students)
    const assigned = allStudents.filter((s) => 
      currentMentorProfile.assignedStudentIds.includes(s.id) || s.assignedMentorId === currentMentorProfile.id
    );

    setStudents(assigned.length > 0 ? assigned : allStudents.slice(0, 3));

    // Load mentorship requests for this mentor
    const allRequests = getPersistedMentorshipRequests();
    const assignedRequests = allRequests.filter(
      (r) => r.mentorId === currentMentorProfile.id || r.mentorName.toLowerCase().includes(currentMentorProfile.fullName.toLowerCase())
    );
    setMentorshipRequests(assignedRequests.length > 0 ? assignedRequests : allRequests.slice(0, 2));
  };

  useEffect(() => {
    loadData();

    const handleDataUpdated = () => {
      loadData();
    };

    window.addEventListener('shifting_orbits_data_updated', handleDataUpdated);
    return () => {
      window.removeEventListener('shifting_orbits_data_updated', handleDataUpdated);
    };
  }, [user]);

  // Voice transcription sync for doubt answering
  useEffect(() => {
    if (voiceAnswerTranscript) {
      setAnswerText((prev) => (prev ? `${prev} ${voiceAnswerTranscript}` : voiceAnswerTranscript));
      resetVoiceAnswering();
    }
  }, [voiceAnswerTranscript, resetVoiceAnswering]);

  const handleOpenAnswerModal = (doubt: Doubt) => {
    setActiveAnsweringDoubt(doubt);
    setAnswerText(doubt.answer || '');
    setActionSuccessMsg(null);
    resetVoiceAnswering();
  };

  const handleSubmitAnswer = async () => {
    if (!activeAnsweringDoubt || !answerText.trim()) return;

    setIsSubmittingAnswer(true);
    try {
      updateOptimisticDoubt(activeAnsweringDoubt.id, {
        answer: answerText.trim(),
        status: 'resolved',
        answered_by_name: user?.fullName || user?.name || 'Volunteer Mentor',
        answered_at: new Date().toISOString(),
      });

      setActionSuccessMsg('Answer submitted successfully and marked resolved!');
      setTimeout(() => {
        setActiveAnsweringDoubt(null);
        setIsSubmittingAnswer(false);
      }, 800);
    } catch (err) {
      setIsSubmittingAnswer(false);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    updateMentorshipRequestStatus(requestId, 'accepted');
    loadData();
  };

  const handleCompleteRequest = (requestId: string) => {
    updateMentorshipRequestStatus(requestId, 'completed');
    loadData();
  };

  // Filter assigned students
  const filteredStudents = sortStudentsByPriority(
    students.filter((student) => {
      const priority = student.priorityEvaluation || evaluateStudentPriority(student);
      const matchesPriority = priorityFilter === 'All' || priority.tier === priorityFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        student.name.toLowerCase().includes(query) ||
        student.cradleStage.toLowerCase().includes(query) ||
        student.dreamCareer.toLowerCase().includes(query);

      return matchesPriority && matchesSearch;
    })
  );

  const criticalCount = students.filter(
    (s) => (s.priorityEvaluation || evaluateStudentPriority(s)).tier === 'CRITICAL'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 border border-emerald-200">
            <Heart className="w-3.5 h-3.5 text-emerald-600" />
            <span>Volunteer Mentor Board • Shifting Orbits</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Assigned Students & Field Portal
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Holistic cradle-to-college tracking for the 3 students assigned under you. Log home visits, resolve doubts, and guide career milestones.
          </p>
        </div>

        {/* Action Button: Log Offline Home Visit */}
        <button
          type="button"
          id="btn-open-visit-logger-tab"
          onClick={() => setActiveTab('visit-logger')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition hover:scale-[1.02] active:scale-98 self-start md:self-auto"
        >
          <Mic className="w-4 h-4" />
          <span>Speech-to-Text Home Visit Logger</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          id="tab-assigned-students"
          onClick={() => setActiveTab('assigned-students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'assigned-students'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>My Assigned Students ({students.length})</span>
          {criticalCount > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-black animate-pulse">
              {criticalCount} Critical
            </span>
          )}
        </button>

        <button
          type="button"
          id="tab-visit-logger"
          onClick={() => setActiveTab('visit-logger')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'visit-logger'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Offline Field Visit Voice Logger</span>
        </button>

        <button
          type="button"
          id="tab-doubts"
          onClick={() => setActiveTab('doubts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'doubts'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Student Doubts Queue</span>
        </button>

        <button
          type="button"
          id="tab-requests"
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'requests'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>1-on-1 Guidance Requests ({mentorshipRequests.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MY ASSIGNED STUDENTS (3 Students) */}
      {/* ========================================================================= */}
      {activeTab === 'assigned-students' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search assigned students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Filter Priority:</span>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                {(['All', 'CRITICAL', 'HIGH', 'MEDIUM', 'NORMAL'] as const).map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setPriorityFilter(tier)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      priorityFilter === tier
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cards Grid for the 3 Students */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredStudents.map((student) => {
              const priority = student.priorityEvaluation || evaluateStudentPriority(student);
              return (
                <div
                  key={student.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
                >
                  {/* Top Priority Banner */}
                  <div className={`p-3.5 border-b ${priority.badgeBg} ${priority.badgeBorder} flex items-center justify-between`}>
                    <span className={`text-xs font-black uppercase tracking-wider ${priority.badgeText} flex items-center gap-1.5`}>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{priority.badgeLabel}</span>
                    </span>
                    <span className="text-xs font-extrabold text-slate-700">
                      Score {priority.score}/100
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* Student Info Header */}
                    <div className="flex items-center gap-3">
                      <img
                        src={student.avatarUrl}
                        alt={student.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                      />
                      <div className="space-y-0.5 overflow-hidden">
                        <h3 className="font-extrabold text-slate-900 text-base truncate">{student.name}</h3>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                          {student.cradleStage}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate">{student.schoolOrCollege}</p>
                      </div>
                    </div>

                    {/* Dream Career & Track */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Dream Career:</div>
                      <div className="font-extrabold text-sky-800">{student.dreamCareer}</div>
                      <div className="text-[11px] text-slate-600 truncate">{student.trackTitle}</div>
                    </div>

                    {/* Telemetry Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Attendance</span>
                        <span className={`font-black text-sm ${student.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {student.attendanceRate}%
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Academic</span>
                        <span className={`font-black text-sm ${student.academicScore < 65 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {student.academicScore}%
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Doubts</span>
                        <span className="font-black text-sm text-slate-800">
                          {student.unresolvedDoubtsCount} open
                        </span>
                      </div>
                    </div>

                    {/* Triggered Risk Rules Summary */}
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Risk Assessment:</span>
                      <div className="space-y-1">
                        {priority.triggeredRules.slice(0, 2).map((rule, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 bg-rose-50/60 p-1.5 rounded-lg border border-rose-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span className="truncate">{rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Last Offline Visit Status */}
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                      <span>Last Home Visit:</span>
                      <strong className={priority.daysSinceLastVisit > 30 ? 'text-rose-600 font-bold' : 'text-slate-700 font-semibold'}>
                        {student.lastHomeVisitDate ? `${priority.daysSinceLastVisit} days ago` : 'Never visited'}
                      </strong>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForDossier(student)}
                      className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span>Full Record</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentForVisitLogger(student);
                        setActiveTab('visit-logger');
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-2xs flex items-center justify-center gap-1.5"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Log Visit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: OFFLINE FIELD VISIT VOICE LOGGER */}
      {/* ========================================================================= */}
      {activeTab === 'visit-logger' && (
        <div className="max-w-4xl mx-auto animate-in fade-in duration-150">
          <OfflineVisitLogger
            assignedStudents={students}
            preSelectedStudent={selectedStudentForVisitLogger}
            currentUser={user}
            onVisitLogged={(newVisit) => {
              loadData();
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STUDENT DOUBTS RESOLUTION HUB */}
      {/* ========================================================================= */}
      {activeTab === 'doubts' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assigned Student Roadblocks & Doubts</h2>
              <p className="text-xs text-slate-500">Provide direct answers with code or voice dictation to keep students moving.</p>
            </div>
            <button
              onClick={() => refetchDoubts()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-3">
            {doubts.map((doubt) => (
              <div
                key={doubt.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{doubt.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      doubt.urgency === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {doubt.urgency || 'Standard'}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    doubt.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {doubt.status === 'resolved' ? 'Resolved' : 'Pending Answer'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">{doubt.description}</p>

                {doubt.answer && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1 text-xs text-slate-800">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Answered by {doubt.answered_by_name || 'Mentor'}:</span>
                    </div>
                    <p className="leading-relaxed">{doubt.answer}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium">Category: {doubt.category}</span>
                  <button
                    type="button"
                    onClick={() => handleOpenAnswerModal(doubt)}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{doubt.answer ? 'Edit Answer' : 'Answer Question'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 1-ON-1 MENTORSHIP REQUESTS */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Direct Mentorship & Guidance Requests</h2>
            <p className="text-xs text-slate-500">Incoming guidance requests from students assigned under your care.</p>
          </div>

          <div className="space-y-3">
            {mentorshipRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={req.studentAvatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                      alt={req.studentName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{req.studentName}</h4>
                      <span className="text-[11px] text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    req.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                    req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {req.status === 'accepted' ? 'Accepted / Scheduled' : req.status === 'completed' ? 'Completed' : 'Pending Request'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs text-slate-800">
                  <div className="font-bold text-slate-900">{req.topic}</div>
                  <p className="leading-relaxed text-slate-600">{req.description}</p>
                  <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-3">
                    <span>Mode: <strong className="text-slate-800">{req.preferredMode}</strong></span>
                    <span>•</span>
                    <span>Urgency: <strong className={req.urgency === 'Urgent' ? 'text-rose-600' : 'text-slate-800'}>{req.urgency}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  {req.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(req.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept & Schedule</span>
                    </button>
                  )}
                  {req.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => handleCompleteRequest(req.id)}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition shadow-xs"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answer Modal for Answering Doubts */}
      {activeAnsweringDoubt && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Answer Student Doubt</h3>
              <button onClick={() => setActiveAnsweringDoubt(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-900">{activeAnsweringDoubt.title}</span>
              <p className="text-slate-600">{activeAnsweringDoubt.description}</p>
            </div>

            {actionSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                {actionSuccessMsg}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Mentor Solution & Explanation
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (isVoiceAnswering) {
                      stopVoiceAnswering();
                    } else {
                      startVoiceAnswering();
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                    isVoiceAnswering ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isVoiceAnswering ? 'Listening...' : 'Dictate Answer'}</span>
                </button>
              </div>

              <textarea
                rows={5}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write your explanation or guidance here..."
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveAnsweringDoubt(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isSubmittingAnswer || !answerText.trim()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {isSubmittingAnswer ? 'Submitting...' : 'Submit & Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Detailed Dossier Modal */}
      <StudentDossierModal
        student={selectedStudentForDossier}
        isOpen={Boolean(selectedStudentForDossier)}
        onClose={() => setSelectedStudentForDossier(null)}
        onOpenHomeVisitLogger={(stu) => {
          setSelectedStudentForVisitLogger(stu);
          setActiveTab('visit-logger');
        }}
        isMentorView={true}
      />
    </div>
  );
};

export default MentorBoard;
