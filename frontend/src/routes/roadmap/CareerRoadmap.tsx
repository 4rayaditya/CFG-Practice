import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  BookOpen, 
  TrendingUp,
  Compass
} from 'lucide-react';
import type { RoadmapMilestone } from '../../types';

const defaultMilestones: RoadmapMilestone[] = [
  {
    id: 'ms_1',
    title: 'Core Foundations & Problem-Solving Thinking',
    description: 'Master algorithmic problem solving, structured data design, and logical decomposition.',
    category: 'Foundations',
    estimatedHours: 10,
    completed: true,
    resources: ['FreeCodeCamp Algorithms', 'CS50 Open Courseware'],
  },
  {
    id: 'ms_2',
    title: 'Building Inclusive & Accessible Web Interfaces',
    description: 'Learn modern semantic HTML, keyboard accessibility, screen reader friendliness, and responsive design.',
    category: 'Web & UI',
    estimatedHours: 12,
    completed: true,
    resources: ['MDN Web Accessibility', 'WebAIM Guide'],
  },
  {
    id: 'ms_3',
    title: 'Hands-On Community Project Development',
    description: 'Build and deploy a full-stack open-source web application that solves a real community or non-profit challenge.',
    category: 'Applied Projects',
    estimatedHours: 18,
    completed: false,
    resources: ['Open Source Guides', 'Social Impact Tech Projects'],
  },
  {
    id: 'ms_4',
    title: 'Technical Resume & Interview Confidence',
    description: 'Work 1-on-1 with volunteer industry mentors for mock interviews, code reviews, and career coaching.',
    category: 'Career Mentorship',
    estimatedHours: 8,
    completed: false,
    resources: ['Tech Interview Handbook', 'MentorMatch Peer Reviews'],
  }
];

export const CareerRoadmap: React.FC = () => {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(defaultMilestones);
  const careerGoal = 'Junior Software Engineer & Social Impact Builder';

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  const toggleMilestone = (id: string) => {
    setMilestones(
      milestones.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
            <span>Student Learning Pathways</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Your Mentorship Pathway</h1>
          <p className="text-sm text-slate-600 mt-1">
            Structured step-by-step milestones curated by educators and mentors to help you master new skills.
          </p>
        </div>

        {/* Goal badge */}
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
          <Compass className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-semibold text-slate-800">{careerGoal}</span>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="light-panel p-6 rounded-3xl border border-slate-200 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-900">Milestone Completion</span>
          <span className="text-sky-700 font-bold">{progressPercent}% Completed</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500 pt-1">
          <span>{completedCount} of {milestones.length} learning modules completed</span>
          <span>{milestones.reduce((acc, m) => acc + (m.completed ? m.estimatedHours : 0), 0)} / {milestones.reduce((acc, m) => acc + m.estimatedHours, 0)} hours completed</span>
        </div>
      </div>

      {/* Checklist of Milestones */}
      <div className="space-y-4">
        {milestones.map((milestone, idx) => (
          <div
            key={milestone.id}
            onClick={() => toggleMilestone(milestone.id)}
            className={`p-5 rounded-2xl cursor-pointer transition-all border flex items-start gap-4 ${
              milestone.completed
                ? 'bg-slate-50 border-slate-200 opacity-90'
                : 'light-panel border-slate-200 hover:border-sky-300 shadow-xs'
            }`}
          >
            <button
              aria-label={`Toggle ${milestone.title}`}
              className="mt-0.5 text-sky-600 hover:scale-110 transition shrink-0"
            >
              {milestone.completed ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
              ) : (
                <Circle className="w-6 h-6 text-slate-400 hover:text-sky-600" />
              )}
            </button>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400">Step {idx + 1}</span>
                  <h3 className={`text-base font-bold ${milestone.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {milestone.title}
                  </h3>
                </div>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {milestone.category}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{milestone.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>~{milestone.estimatedHours} Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                  <span>Open Resources:</span>
                  {milestone.resources.map((r) => (
                    <span key={r} className="text-sky-700 hover:underline">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
