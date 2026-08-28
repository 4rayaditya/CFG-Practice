import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  Heart, 
  CheckCircle2, 
  TrendingDown,
  Sparkles,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const responseSpeedData = [
  { time: '09:00', avgMinutes: 14, doubts: 12 },
  { time: '11:00', avgMinutes: 8, doubts: 28 },
  { time: '13:00', avgMinutes: 5, doubts: 42 },
  { time: '15:00', avgMinutes: 4.2, doubts: 56 },
  { time: '17:00', avgMinutes: 6.5, doubts: 38 },
  { time: '19:00', avgMinutes: 3.8, doubts: 24 },
  { time: '21:00', avgMinutes: 2.9, doubts: 19 },
];

const categoryDistribution = [
  { name: 'Computer Science', value: 38, color: '#0284c7' },
  { name: 'Career & Resumes', value: 30, color: '#059669' },
  { name: 'Web & Mobile Dev', value: 18, color: '#7c3aed' },
  { name: 'Foundations & Math', value: 14, color: '#d97706' },
];

const topVolunteerMentors = [
  { name: 'Dr. Sarah Jenkins', answered: 48, avgSpeed: '3.2m', rating: '5.0★', role: 'Senior Software Engineer' },
  { name: 'Alex Rivera', answered: 36, avgSpeed: '4.5m', rating: '4.9★', role: 'Volunteer Instructor' },
  { name: 'Elena Rostova', answered: 29, avgSpeed: '5.1m', rating: '5.0★', role: 'Data Scientist & Mentor' },
  { name: 'Marcus Chen', answered: 25, avgSpeed: '6.0m', rating: '4.8★', role: 'Fullstack Educator' },
];

export const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
            <span>Program Director Portal • Community Impact</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Community Impact & Engagement</h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitoring student learning progress, mentor response times, and program accessibility.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs text-xs font-medium">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg transition ${
              timeRange === 'today' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-lg transition ${
              timeRange === 'week' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg transition ${
              timeRange === 'month' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="light-panel p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Avg Mentor Response Time</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-sans">4.2 min</div>
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Fastest resolution for student questions</span>
          </div>
        </div>

        <div className="light-panel p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Questions Answered</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-sans">1,248</div>
          <div className="text-xs text-slate-500">
            99.2% positive student feedback rating
          </div>
        </div>

        <div className="light-panel p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Volunteer Mentors</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-sans">84 Mentors</div>
          <div className="text-xs text-slate-500">Volunteering across 12 disciplines</div>
        </div>

        <div className="light-panel p-5 rounded-2xl border border-slate-200 space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Offline-Enabled Syncs</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-sans">312 Questions</div>
          <div className="text-xs text-emerald-700 font-medium">Synced without data loss</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resolution Speed Area Chart */}
        <div className="lg:col-span-8 light-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Mentor Support Speed (Minutes)</h3>
              <p className="text-xs text-slate-500">Average minutes from student voice recording to mentor response</p>
            </div>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
              Goal: &lt; 10 min
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={responseSpeedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="speedGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="avgMinutes"
                  name="Response Time (min)"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#speedGradLight)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="lg:col-span-4 light-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Learning Topics Requested</h3>
            <p className="text-xs text-slate-500">Distribution of student questions</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {categoryDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700 truncate">{item.name}</span>
                <span className="font-semibold text-slate-900 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Volunteer Mentors Leaderboard */}
      <div className="light-panel p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Featured Volunteer Mentors</h3>
            <p className="text-xs text-slate-500">Celebrating mentors dedicating their time to guide students</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Community Honor Roll</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3">Volunteer</th>
                <th className="pb-3">Specialization</th>
                <th className="pb-3">Questions Guided</th>
                <th className="pb-3">Average Speed</th>
                <th className="pb-3 text-right">Student Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topVolunteerMentors.map((m) => (
                <tr key={m.name} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-semibold text-slate-900">{m.name}</td>
                  <td className="py-3 text-slate-600">{m.role}</td>
                  <td className="py-3 font-semibold text-sky-700">{m.answered}</td>
                  <td className="py-3 font-medium text-slate-700">{m.avgSpeed}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold text-[11px]">
                      {m.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
