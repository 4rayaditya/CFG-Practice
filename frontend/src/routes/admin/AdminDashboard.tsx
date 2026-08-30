import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  Clock, 
  Home, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Search, 
  Filter, 
  FileText, 
  Mic, 
  Award, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar, 
  Tag, 
  ExternalLink,
  ChevronRight,
  UserX,
  Radio,
  Zap,
  Activity
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import { 
  getPersistedStudents, 
  getPersistedMentors, 
  getPersistedHomeVisits 
} from '../../data/mockData';
import { evaluateStudentPriority, sortStudentsByPriority } from '../../utils/studentPriorityEngine';
import { StudentDossierModal } from '../../components/student/StudentDossierModal';
import type { StudentDossier, MentorProfile, OfflineHomeVisit } from '../../types';

const CATEGORY_COLORS = ['#0284c7', '#059669', '#7c3aed', '#d97706', '#ec4899'];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'mentors-sla' | 'visits-feed'>('overview');

  // Data State
  const [students, setStudents] = useState<StudentDossier[]>([]);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [homeVisits, setHomeVisits] = useState<OfflineHomeVisit[]>([]);
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<StudentDossier | null>(null);

  // Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'NORMAL'>('All');
  const [mentorFilter, setMentorFilter] = useState<string>('All');
  const [mentorSlaFilter, setMentorSlaFilter] = useState<'All' | 'Breached' | 'Inactive10d' | 'NoDoubt5d' | 'NoVisit30d'>('All');

  const loadData = () => {
    setStudents(getPersistedStudents());
    setMentors(getPersistedMentors());
    setHomeVisits(getPersistedHomeVisits());
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
  }, []);

  // Compute Aggregations
  const totalStudents = students.length;
  const criticalStudents = students.filter(
    (s) => (s.priorityEvaluation || evaluateStudentPriority(s)).tier === 'CRITICAL'
  );
  const highRiskStudents = students.filter(
    (s) => (s.priorityEvaluation || evaluateStudentPriority(s)).tier === 'HIGH'
  );
  const overdueVisitsStudents = students.filter(
    (s) => (s.priorityEvaluation || evaluateStudentPriority(s)).requiresUrgentVisit
  );

  // SLA Mentor Breaches
  const mentorsInactive10d = mentors.filter((m) => m.slaStatus.isInactiveOver10Days);
  const mentorsNoDoubt5d = mentors.filter((m) => m.slaStatus.noDoubtSolvedIn5Days);
  const mentorsNoVisit30d = mentors.filter((m) => m.slaStatus.noOfflineVisitIn30Days);
  const totalSlaBreaches = mentors.filter((m) => m.slaStatus.hasAnySlaBreach).length;

  // Chart Data: Cradle-to-College Stages Breakdown
  const stageDistribution = [
    { name: 'Middle School (Gr 8-9)', count: students.filter((s) => s.cradleStage.includes('Grade 8') || s.cradleStage.includes('Grade 9')).length, color: '#0284c7' },
    { name: 'Secondary Boards (Gr 10)', count: students.filter((s) => s.cradleStage.includes('Grade 10')).length, color: '#059669' },
    { name: 'Sr. Secondary (Gr 11)', count: students.filter((s) => s.cradleStage.includes('Grade 11')).length, color: '#7c3aed' },
    { name: 'College Prep (Gr 12)', count: students.filter((s) => s.cradleStage.includes('Grade 12')).length, color: '#d97706' },
    { name: 'College Freshmen & UG', count: students.filter((s) => s.cradleStage.includes('College')).length, color: '#ec4899' },
  ];

  // Chart Data: 7-Day Resolution & Field Visit Activity
  const activity7Days = [
    { day: 'Mon', doubtsResolved: 8, visitsLogged: 2 },
    { day: 'Tue', doubtsResolved: 12, visitsLogged: 3 },
    { day: 'Wed', doubtsResolved: 15, visitsLogged: 1 },
    { day: 'Thu', doubtsResolved: 9, visitsLogged: 4 },
    { day: 'Fri', doubtsResolved: 14, visitsLogged: 2 },
    { day: 'Sat', doubtsResolved: 6, visitsLogged: 5 },
    { day: 'Sun', doubtsResolved: 4, visitsLogged: 1 },
  ];

  // Filtered Students List
  const filteredStudents = sortStudentsByPriority(
    students.filter((student) => {
      const priority = student.priorityEvaluation || evaluateStudentPriority(student);
      const matchesPriority = priorityFilter === 'All' || priority.tier === priorityFilter;
      const matchesMentor = mentorFilter === 'All' || student.assignedMentorId === mentorFilter;
      const query = studentSearch.toLowerCase();
      const matchesSearch =
        !studentSearch ||
        student.name.toLowerCase().includes(query) ||
        student.cradleStage.toLowerCase().includes(query) ||
        student.dreamCareer.toLowerCase().includes(query) ||
        student.assignedMentorName.toLowerCase().includes(query);

      return matchesPriority && matchesMentor && matchesSearch;
    })
  );

  // Filtered Mentors List
  const filteredMentors = mentors.filter((mentor) => {
    if (mentorSlaFilter === 'Breached') return mentor.slaStatus.hasAnySlaBreach;
    if (mentorSlaFilter === 'Inactive10d') return mentor.slaStatus.isInactiveOver10Days;
    if (mentorSlaFilter === 'NoDoubt5d') return mentor.slaStatus.noDoubtSolvedIn5Days;
    if (mentorSlaFilter === 'NoVisit30d') return mentor.slaStatus.noOfflineVisitIn30Days;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Admin Executive Governance • Shifting Orbits</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Director Telemetry & Field Operations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete governance for all 15 underprivileged students, 5 volunteer mentors, SLA inactivity flagging, and field home visit intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Sync Data</span>
          </button>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live NGO Network Active</span>
          </div>
        </div>
      </div>

      {/* SLA Alert Banners (Highlighted Warning for Breached Mentors) */}
      {totalSlaBreaches > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                Mentor SLA Alerts & Inactivity Notice ({totalSlaBreaches} Mentors Flagged)
              </span>
            </div>
            <button
              onClick={() => setActiveTab('mentors-sla')}
              className="text-xs font-bold text-amber-800 hover:text-amber-950 underline"
            >
              Review Mentor SLA Dashboard →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
            {mentorsInactive10d.length > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-100/70 border border-rose-200 text-rose-900 font-medium">
                🔴 <strong>{mentorsInactive10d.map((m) => m.fullName).join(', ')}</strong>: Inactive &gt; 10 days ({mentorsInactive10d[0].slaStatus.daysSinceLastActive}d)
              </div>
            )}
            {mentorsNoDoubt5d.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-100/70 border border-amber-200 text-amber-900 font-medium">
                🟡 <strong>{mentorsNoDoubt5d.map((m) => m.fullName).join(', ')}</strong>: No doubt solved in 5+ days ({mentorsNoDoubt5d[0].slaStatus.daysSinceLastDoubtResolved}d)
              </div>
            )}
            {mentorsNoVisit30d.length > 0 && (
              <div className="p-2.5 rounded-xl bg-orange-100/70 border border-orange-200 text-orange-900 font-medium">
                🟠 <strong>{mentorsNoVisit30d.map((m) => m.fullName).join(', ')}</strong>: No offline home visit in 30+ days ({mentorsNoVisit30d[0].slaStatus.daysSinceLastOfflineVisit}d)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          id="tab-admin-overview"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Executive Overview & Telemetry</span>
        </button>

        <button
          type="button"
          id="tab-admin-students"
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'students'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Directory & Dossiers ({students.length})</span>
          {criticalStudents.length > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-black animate-pulse">
              {criticalStudents.length} Critical
            </span>
          )}
        </button>

        <button
          type="button"
          id="tab-admin-mentors-sla"
          onClick={() => setActiveTab('mentors-sla')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'mentors-sla'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Mentor Governance & SLA Inactivity ({mentors.length})</span>
          {totalSlaBreaches > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-black">
              {totalSlaBreaches} Breaches
            </span>
          )}
        </button>

        <button
          type="button"
          id="tab-admin-visits-feed"
          onClick={() => setActiveTab('visits-feed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'visits-feed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Field Home Visit Summaries ({homeVisits.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: EXECUTIVE OVERVIEW & TELEMETRY */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top 4 Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Total Active Learners</span>
                <Users className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-3xl font-black text-slate-900">{totalStudents}</div>
              <span className="text-[11px] text-sky-700 font-semibold block">100% assigned to 5 volunteer mentors</span>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Critical Priority Students</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-black text-rose-600">{criticalStudents.length}</div>
              <span className="text-[11px] text-rose-700 font-semibold block">Immediate field intervention needed</span>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Mentor SLA Breaches</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-700">{totalSlaBreaches}</div>
              <span className="text-[11px] text-amber-800 font-semibold block">&gt;10d inactive / &gt;5d doubts / &gt;30d visits</span>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
                <span>Field Home Visits Logged</span>
                <Home className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-700">{homeVisits.length}</div>
              <span className="text-[11px] text-emerald-800 font-semibold block">Speech-to-text field records</span>
            </div>
          </div>

          {/* Visual Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Cradle-to-College Stages */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Cradle-to-College Cohort Breakdown</h3>
                <p className="text-xs text-slate-500">Distribution of underprivileged students across educational stages</p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stageDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {stageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', borderColor: '#e2e8f0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                {stageDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 truncate">{item.name}:</span>
                    <strong className="text-slate-900 ml-auto">{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Weekly Resolution & Visit Activity */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Weekly Turnaround & Field Visits</h3>
                <p className="text-xs text-slate-500">Doubts resolved vs offline home visits conducted</p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activity7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', borderColor: '#e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="doubtsResolved" name="Doubts Resolved" fill="#0284c7" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="visitsLogged" name="Home Visits" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-sky-600" />
                  <span className="text-slate-600 font-medium">Doubts Resolved (Avg 4.2m)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-600" />
                  <span className="text-slate-600 font-medium">Home Visits Conducted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STUDENT DIRECTORY & DETAILED DOSSIERS (ALL 15 STUDENTS) */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search by student name, stage, career, mentor..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-sky-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All Tiers ({students.length})</option>
                  <option value="CRITICAL">🔴 CRITICAL ({criticalStudents.length})</option>
                  <option value="HIGH">🟠 HIGH ({highRiskStudents.length})</option>
                  <option value="MEDIUM">🟡 MEDIUM</option>
                  <option value="NORMAL">🟢 NORMAL</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Mentor:</span>
                <select
                  value={mentorFilter}
                  onChange={(e) => setMentorFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-semibold focus:outline-none"
                >
                  <option value="All">All 5 Mentors</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Student Dossiers Directory Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Showing {filteredStudents.length} of {students.length} Underprivileged Students</span>
              <span className="text-slate-500">Click any student row to inspect their full confidential dossier</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold bg-slate-50/50">
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Cradle-to-College Stage</th>
                    <th className="py-3.5 px-4">Priority Engine Tier</th>
                    <th className="py-3.5 px-4">Attendance</th>
                    <th className="py-3.5 px-4">Assigned Mentor</th>
                    <th className="py-3.5 px-4">Last Home Visit</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const priority = student.priorityEvaluation || evaluateStudentPriority(student);
                    return (
                      <tr
                        key={student.id}
                        onClick={() => setSelectedStudentForDossier(student)}
                        className="hover:bg-sky-50/40 transition cursor-pointer group"
                      >
                        {/* Student Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatarUrl}
                              alt={student.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block group-hover:text-sky-700 transition">
                                {student.name}
                              </span>
                              <span className="text-[11px] text-slate-500">{student.dreamCareer}</span>
                            </div>
                          </div>
                        </td>

                        {/* Cradle Stage */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {student.cradleStage}
                          </span>
                        </td>

                        {/* Priority Tier */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 border ${priority.badgeBg} ${priority.badgeText} ${priority.badgeBorder}`}>
                            <AlertTriangle className="w-3 h-3" />
                            <span>{priority.tier} ({priority.score} pts)</span>
                          </span>
                        </td>

                        {/* Attendance */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <span className={`font-extrabold ${student.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-800'}`}>
                              {student.attendanceRate}%
                            </span>
                            <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${student.attendanceRate < 75 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${student.attendanceRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Assigned Mentor */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {student.assignedMentorName}
                        </td>

                        {/* Last Home Visit */}
                        <td className="py-3.5 px-4">
                          <span className={priority.daysSinceLastVisit > 30 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {student.lastHomeVisitDate ? `${priority.daysSinceLastVisit} days ago` : 'Never'}
                          </span>
                        </td>

                        {/* Action Button */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudentForDossier(student);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-700 text-xs font-bold transition shadow-2xs inline-flex items-center gap-1"
                          >
                            <span>Dossier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MENTOR GOVERNANCE & SLA INACTIVITY TRACKER (5 MENTORS) */}
      {/* ========================================================================= */}
      {activeTab === 'mentors-sla' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* SLA Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Volunteer Mentor SLA Tracker</h3>
              <p className="text-xs text-slate-500">Flags mentors inactive &gt;10d, no doubts solved in 5d, or no offline visit in 30d.</p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {(['All', 'Breached', 'Inactive10d', 'NoDoubt5d', 'NoVisit30d'] as const).map((filterVal) => (
                <button
                  key={filterVal}
                  type="button"
                  onClick={() => setMentorSlaFilter(filterVal)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    mentorSlaFilter === filterVal
                      ? 'bg-purple-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {filterVal === 'All' ? 'All 5 Mentors' :
                   filterVal === 'Breached' ? `All Breaches (${totalSlaBreaches})` :
                   filterVal === 'Inactive10d' ? `Inactive >10d (${mentorsInactive10d.length})` :
                   filterVal === 'NoDoubt5d' ? `No Doubt 5d (${mentorsNoDoubt5d.length})` :
                   `No Visit 30d (${mentorsNoVisit30d.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Mentors Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                {/* Top SLA Status Pill Header */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  mentor.slaStatus.hasAnySlaBreach ? 'bg-amber-50/70 border-amber-200' : 'bg-emerald-50/50 border-emerald-200'
                }`}>
                  <span className={`text-xs font-extrabold flex items-center gap-1.5 ${
                    mentor.slaStatus.hasAnySlaBreach ? 'text-amber-800' : 'text-emerald-800'
                  }`}>
                    {mentor.slaStatus.hasAnySlaBreach ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>⚠️ SLA Breach Detected</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Active &amp; Compliant</span>
                      </>
                    )}
                  </span>

                  <span className="text-[11px] font-bold text-slate-500">
                    Rating: {mentor.rating}★
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Mentor Header */}
                  <div className="flex items-center gap-3">
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                    />
                    <div className="space-y-0.5 overflow-hidden">
                      <h4 className="font-extrabold text-slate-900 text-base truncate">{mentor.fullName}</h4>
                      <p className="text-xs text-slate-500 truncate">{mentor.headline}</p>
                      <span className="text-[11px] text-purple-700 font-semibold">{mentor.email}</span>
                    </div>
                  </div>

                  {/* 3 Strict SLA Indicators */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    {/* SLA 1: Activity Latency */}
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      mentor.slaStatus.isInactiveOver10Days
                        ? 'bg-rose-50 border-rose-300 text-rose-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <span>Last Platform Active:</span>
                      <span>
                        {mentor.slaStatus.isInactiveOver10Days ? `🚨 ${mentor.slaStatus.daysSinceLastActive} days (Inactive >10d)` : `${mentor.slaStatus.daysSinceLastActive}d ago`}
                      </span>
                    </div>

                    {/* SLA 2: Doubt Resolution Latency */}
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      mentor.slaStatus.noDoubtSolvedIn5Days
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <span>Last Doubt Solved:</span>
                      <span>
                        {mentor.slaStatus.noDoubtSolvedIn5Days ? `⚠️ ${mentor.slaStatus.daysSinceLastDoubtResolved} days (No Doubt >5d)` : `${mentor.slaStatus.daysSinceLastDoubtResolved}d ago`}
                      </span>
                    </div>

                    {/* SLA 3: Offline Home Visit Latency */}
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      mentor.slaStatus.noOfflineVisitIn30Days
                        ? 'bg-orange-50 border-orange-300 text-orange-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <span>Last Offline Visit:</span>
                      <span>
                        {mentor.slaStatus.noOfflineVisitIn30Days ? `🚨 ${mentor.slaStatus.daysSinceLastOfflineVisit} days (No Visit >30d)` : `${mentor.slaStatus.daysSinceLastOfflineVisit}d ago`}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Students (3 under this mentor) */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Assigned Students (3):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(mentor.assignedStudents || []).map((stu) => (
                        <button
                          key={stu.id}
                          type="button"
                          onClick={() => setSelectedStudentForDossier(stu)}
                          className="px-2 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold hover:bg-sky-100 transition"
                        >
                          {stu.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Resolved: <strong className="text-slate-800">{mentor.resolvedCount}</strong> doubts</span>
                  <span className="text-purple-700 font-bold">{mentor.expertiseTags[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FIELD HOME VISIT INTELLIGENCE FEED */}
      {/* ========================================================================= */}
      {activeTab === 'visits-feed' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Executive Field Home Visit Summaries</h2>
            <p className="text-xs text-slate-500">Live consolidated stream of speech-to-text home visits logged by volunteer mentors.</p>
          </div>

          <div className="space-y-4">
            {homeVisits.map((visit) => (
              <div
                key={visit.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-sm">Student Visited: {visit.studentName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">Logged by Mentor: <strong>{visit.mentorName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{new Date(visit.visitDate).toLocaleDateString()}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      visit.riskLevel === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                      visit.riskLevel === 'High' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {visit.riskLevel} Risk Environment
                    </span>
                  </div>
                </div>

                {/* Executive Summary Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-800">
                  <div className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-500">
                    Executive Summary:
                  </div>
                  <p className="leading-relaxed text-slate-700 font-medium">{visit.summary}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <div>
                      <strong className="text-slate-900">Living &amp; Study Environment:</strong> {visit.livingEnvironment}
                    </div>
                    <div>
                      <strong className="text-slate-900">Academic Readiness:</strong> {visit.academicObservations}
                    </div>
                  </div>
                </div>

                {/* Raw Speech-to-Text Transcript */}
                {visit.rawSpeechTranscript && (
                  <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100 text-xs text-sky-900 flex items-start gap-2">
                    <Mic className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[10px] uppercase tracking-wider text-sky-700 font-bold">Speech-to-Text Transcript:</strong>
                      <span>"{visit.rawSpeechTranscript}"</span>
                    </div>
                  </div>
                )}

                {/* Action Items */}
                {visit.actionItems && visit.actionItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Action Items:</span>
                    {visit.actionItems.map((item, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Confidential Dossier Modal */}
      <StudentDossierModal
        student={selectedStudentForDossier}
        isOpen={Boolean(selectedStudentForDossier)}
        onClose={() => setSelectedStudentForDossier(null)}
        isMentorView={false}
      />
    </div>
  );
};

export default AdminDashboard;
