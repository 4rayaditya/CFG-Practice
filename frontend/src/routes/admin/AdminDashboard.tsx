import React, { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  Users, 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const resolutionSpeedData = [
  { time: '09:00', avgMinutes: 14, doubts: 12 },
  { time: '11:00', avgMinutes: 8, doubts: 28 },
  { time: '13:00', avgMinutes: 5, doubts: 42 },
  { time: '15:00', avgMinutes: 4.2, doubts: 56 },
  { time: '17:00', avgMinutes: 6.5, doubts: 38 },
  { time: '19:00', avgMinutes: 3.8, doubts: 24 },
  { time: '21:00', avgMinutes: 2.9, doubts: 19 },
];

const categoryDistribution = [
  { name: 'FastAPI / Node', value: 38, color: '#6366f1' },
  { name: 'pgvector & DB', value: 30, color: '#06b6d4' },
  { name: 'PWA & Offline', value: 18, color: '#a855f7' },
  { name: 'AI & Whisper', value: 14, color: '#10b981' },
];

const mentorActiveData = [
  { name: 'Dr. Sarah Jenkins', answered: 24, avgSpeed: '3.2m', rating: '4.9★' },
  { name: 'Alex Rivera', answered: 19, avgSpeed: '4.5m', rating: '4.8★' },
  { name: 'Elena Rostova', answered: 15, avgSpeed: '5.1m', rating: '5.0★' },
  { name: 'Marcus Chen', answered: 12, avgSpeed: '6.0m', rating: '4.7★' },
];

export const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <span>Person 3 Core Deliverable • Admin Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Platform Health & Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry on AI matching efficiency, query resolution speeds, and active participants.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex items-center gap-1.5 glass-card p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg transition ${
              timeRange === 'today' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-lg transition ${
              timeRange === 'week' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg transition ${
              timeRange === 'month' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Resolution Speed</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">4.2 min</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-38% vs traditional forum wait time</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Doubts Resolved</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">219</div>
          <div className="flex items-center gap-1 text-xs text-indigo-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>98.4% resolution success rate</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Mentors Online</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">42 Mentors</div>
          <div className="text-xs text-slate-400">pgvector cosine match threshold 0.80+</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Offline Sync Queue</span>
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">0 Pending</div>
          <div className="text-xs text-emerald-400">All IndexedDB background syncs healthy</div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resolution Speed Area Chart */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Query Resolution Velocity (Minutes)</h3>
              <p className="text-xs text-slate-400">Average minutes from voice intake to mentor answer</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/60">
              Target: &lt; 5 mins
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={resolutionSpeedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} unit="m" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area
                  type="monotone"
                  dataKey="avgMinutes"
                  name="Avg Resolution (min)"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#speedGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div>
            <h3 className="font-bold text-white text-base">Doubt Domain Distribution</h3>
            <p className="text-xs text-slate-400">Categorized by GPT-4o-mini</p>
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
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            {categoryDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 truncate">{item.name}</span>
                <span className="font-mono text-slate-400 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Mentors Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Top Domain Mentors</h3>
            <p className="text-xs text-slate-400">Active mentors ranked by response efficiency and resolution ratings</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono">
                <th className="pb-3 font-medium">Mentor</th>
                <th className="pb-3 font-medium">Doubts Answered</th>
                <th className="pb-3 font-medium">Avg Speed</th>
                <th className="pb-3 font-medium">Student Rating</th>
                <th className="pb-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {mentorActiveData.map((m) => (
                <tr key={m.name} className="hover:bg-slate-900/40 transition">
                  <td className="py-3 font-semibold text-slate-200">{m.name}</td>
                  <td className="py-3 font-mono text-slate-300">{m.answered}</td>
                  <td className="py-3 font-mono text-cyan-400">{m.avgSpeed}</td>
                  <td className="py-3 font-mono text-amber-400">{m.rating}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 font-mono text-[11px]">
                      ● Active
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
