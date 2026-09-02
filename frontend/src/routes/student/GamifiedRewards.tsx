import React from 'react';
import { 
  Trophy, 
  Award, 
  Star, 
  Flame, 
  Zap, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert,
  ArrowRight,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const GamifiedRewards: React.FC = () => {
  const earnedBadges = [
    {
      id: 'b-01',
      name: '7-Day Learning Streak',
      category: 'Consistency',
      description: 'Logged in and engaged with coursework for 7 consecutive days.',
      icon: Flame,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50 text-amber-900 border-amber-200',
      earnedDate: 'Earned yesterday',
    },
    {
      id: 'b-02',
      name: 'Math Master',
      category: 'Academic Excellence',
      description: 'Scored 90%+ in 3 consecutive Mathematics and Algebra assessments.',
      icon: Trophy,
      color: 'from-sky-500 to-indigo-600',
      bgColor: 'bg-sky-50 text-sky-900 border-sky-200',
      earnedDate: 'Earned 3 days ago',
    },
    {
      id: 'b-03',
      name: 'Curious Mind',
      category: 'Engagement',
      description: 'Asked and engaged with 5 technical doubts on the Doubt Board.',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50 text-purple-900 border-purple-200',
      earnedDate: 'Earned last week',
    },
    {
      id: 'b-04',
      name: 'Peer Supporter',
      category: 'Community',
      description: 'Completed 3 peer review challenge tasks with your assigned buddy.',
      icon: Award,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      earnedDate: 'Earned 2 weeks ago',
    },
  ];

  const lockedBadges = [
    {
      id: 'b-05',
      name: '30-Day Unstoppable',
      description: 'Maintain attendance and coursework across 30 days without interruption.',
      progress: 23,
      total: 30,
      icon: Zap,
    },
    {
      id: 'b-06',
      name: 'Physics Prodigy',
      description: 'Complete all 5 Kinematics & Dynamics mock tests with Grade A.',
      progress: 3,
      total: 5,
      icon: Target,
    },
    {
      id: 'b-07',
      name: 'Village STEM Ambassador',
      description: 'Nominated by your field mentor for community leadership.',
      progress: 1,
      total: 2,
      icon: Star,
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-yellow-200" />
            <span>Gamification & Trophies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Student Badge & Reward Showcase
          </h1>
          <p className="text-sm text-amber-50 leading-relaxed">
            Every quiz completed, doubt clarified, and attendance streak earns points toward awards, mentor nominations, and regional NGO prizes.
          </p>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Streak</span>
            <p className="text-2xl font-black text-slate-900">7 Days</p>
            <p className="text-[11px] text-amber-600 font-semibold">Keep it going today!</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Earned Badges</span>
            <p className="text-2xl font-black text-slate-900">4 Unlocked</p>
            <p className="text-[11px] text-sky-600 font-semibold">3 more available</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Points</span>
            <p className="text-2xl font-black text-slate-900">1,450 XP</p>
            <p className="text-[11px] text-emerald-600 font-semibold">Level 3 Scholar</p>
          </div>
        </div>
      </div>

      {/* Earned Badges Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-600" />
          <span>Earned Trophies</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {earnedBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className={`rounded-3xl border p-6 flex flex-col justify-between space-y-4 shadow-xs hover:scale-[1.02] transition-transform duration-200 bg-white border-slate-200`}
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${badge.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {badge.category}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                      {badge.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unlocked</span>
                  </span>
                  <span>{badge.earnedDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Locked Badges In Progress */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Lock className="w-5 h-5 text-slate-400" />
          <span>In Progress & Next Goals</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {lockedBadges.map((badge) => {
            const Icon = badge.icon;
            const percentage = Math.round((badge.progress / badge.total) * 100);
            return (
              <div
                key={badge.id}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {badge.progress} / {badge.total}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">{badge.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Progress</span>
                    <span>{percentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GamifiedRewards;
