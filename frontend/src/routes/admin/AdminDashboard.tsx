import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  CheckCircle2, 
  TrendingDown,
  Sparkles,
  Award,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Zap,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAdminMetrics } from '../../hooks/useAdminMetrics';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const topVolunteerMentors = [
  { name: 'Dr. Sarah Jenkins', answered: 48, avgSpeed: '3.2m', rating: '5.0★', role: 'Senior Software Engineer' },
  { name: 'Alex Rivera', answered: 36, avgSpeed: '4.5m', rating: '4.9★', role: 'Volunteer Instructor' },
  { name: 'Elena Rostova', answered: 29, avgSpeed: '5.1m', rating: '5.0★', role: 'Data Scientist & Mentor' },
  { name: 'Marcus Chen', answered: 25, avgSpeed: '6.0m', rating: '4.8★', role: 'Fullstack Educator' },
];

export const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: metrics, loading, error, refetch } = useAdminMetrics();
  const [activeChartMetric, setActiveChartMetric] = useState<'speed' | 'volume'>('speed');

  // RBAC: Verify user has 'admin' role
  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 text-slate-400">
        <Sparkles className="w-8 h-8 text-sky-500 animate-spin" />
        <p className="text-sm font-medium">Verifying Administrative Privileges...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'admin') {
    return <Navigate to="/403" state={{ allowedRoles: ['admin'], attemptedPath: '/admin/analytics' }} replace />;
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 border border-sky-200">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Admin Executive Dashboard • Community Impact</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Program Analytics & Governance
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time telemetry on student intake, volunteer response velocity, and subject matter breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Metrics'}</span>
          </button>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Supabase Sync Active</span>
          </div>
        </div>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold">Live metric sync error:</span> {error.message}. Displaying cached baseline figures.
          </div>
        </div>
      )}

      {/* PROMPT 31: Top Row of Three KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Active Students */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Active Students</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.activeStudents.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-3 font-medium">
            <span className="text-sky-600 font-semibold">Registered learners</span> across all study tracks
          </div>
          <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-sky-400 to-sky-600" />
        </div>

        {/* Card 2: Total Doubts Resolved */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Doubts Resolved</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.totalDoubtsResolved.toLocaleString()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-3 font-medium">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {metrics.totalDoubts > 0 
                ? `${Math.round((metrics.totalDoubtsResolved / metrics.totalDoubts) * 100)}% overall completion rate`
                : '100% resolution efficiency'}
            </span>
          </div>
          <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
        </div>

        {/* Card 3: Avg. Resolution Time */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Avg. Resolution Time</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {metrics.avgResolutionTimeMin} <span className="text-xl font-normal text-slate-500">min</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 mt-3 font-medium">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>Target benchmark: &lt; 10 minutes</span>
          </div>
          <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-purple-400 to-purple-600" />
        </div>
      </div>

      {/* PROMPT 33: Recharts Visual Analytics Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Widget 1: BarChart - Resolution Speed / Velocity Over Last 7 Days */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">Resolution Speed Over Last 7 Days</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily turnaround time (minutes) and volume of student questions resolved
              </p>
            </div>

            {/* Toggle Metric View */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium self-start">
              <button
                onClick={() => setActiveChartMetric('speed')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeChartMetric === 'speed'
                    ? 'bg-white text-sky-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Speed (Min)
              </button>
              <button
                onClick={() => setActiveChartMetric('volume')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeChartMetric === 'volume'
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Resolved Volume
              </button>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.resolutionSpeed7Days}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  unit={activeChartMetric === 'speed' ? 'm' : ''}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: any) => [
                    activeChartMetric === 'speed' ? `${value} mins` : `${value} doubts`,
                    activeChartMetric === 'speed' ? 'Average Speed' : 'Resolved Count'
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${item.day} (${item.date})` : label;
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    color: '#0f172a',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                    fontSize: '12px'
                  }}
                />
                <Bar
                  dataKey={activeChartMetric === 'speed' ? 'avgMinutes' : 'resolvedCount'}
                  fill={activeChartMetric === 'speed' ? '#0284c7' : '#059669'}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Widget 2: PieChart - Topic Distribution Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-base">Topic Distribution of Doubts</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Subject area breakdown across all student questions
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                >
                  {metrics.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} doubts (${item.payload.value}%)`,
                    name
                  ]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    color: '#0f172a',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Legend & Percentage Table */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
            {metrics.categoryDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-700 truncate">{item.name}</span>
                <span className="font-bold text-slate-900 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Volunteer Mentors Leaderboard */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Volunteer Mentors Hall of Fame</h3>
            <p className="text-xs text-slate-500">Mentors delivering the fastest turnarounds and highest student ratings</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 font-semibold">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Community Honor Roll</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3">Volunteer Mentor</th>
                <th className="pb-3">Specialization</th>
                <th className="pb-3">Doubts Resolved</th>
                <th className="pb-3">Avg. Turnaround</th>
                <th className="pb-3 text-right">Student Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topVolunteerMentors.map((m) => (
                <tr key={m.name} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-semibold text-slate-900">{m.name}</td>
                  <td className="py-3 text-slate-600">{m.role}</td>
                  <td className="py-3 font-bold text-sky-700">{m.answered}</td>
                  <td className="py-3 font-medium text-slate-700">{m.avgSpeed}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 font-bold text-[11px]">
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

export default AdminDashboard;
