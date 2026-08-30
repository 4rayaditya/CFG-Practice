import React, { useState, useEffect } from 'react';
import { RoadmapTree, RoadmapData } from '../../components/roadmap/RoadmapTree';
import { api } from '../../services/api';
import { Compass, Sparkles, Layers, CheckCircle2 } from 'lucide-react';

export const PRESET_CAREER_TRACKS: Record<string, RoadmapData> = {
  'physics-mastery': {
    track_title: 'AP Physics & Kinematics Mastery Track',
    summary: 'Master High School Physics, Kinematics equations, Newton\'s laws of motion, Work-Energy theorem, and lab experiment analysis.',
    total_estimated_hours: 90,
    skill_level: 'Grade 10-12',
    target_timeline: '3 months',
    milestones: [
      {
        id: 1,
        title: 'Phase 1: Kinematics & Motion Vectors',
        description: 'Understand displacement, velocity, acceleration, and 2D projectile motion decomposition.',
        estimated_hours: 25,
        subtasks: [
          'Master 1D uniform acceleration equations (v = u + at, s = ut + 0.5at^2)',
          'Decompose 2D projectile vectors into horizontal and vertical components',
          'Calculate total kinetic and potential energy at peak trajectory',
        ],
        resources: [
          { name: 'Physics OpenStax Textbook', url: 'https://openstax.org', type: 'docs' },
          { name: 'PhET Motion Interactive Labs', url: 'https://phet.colorado.edu', type: 'tutorial' },
        ],
        checkpoint_project: 'Complete Projectile Motion Problem Set and Lab Report.',
        key_skills: ['Kinematics', 'Vectors', 'Projectile Motion', 'Energy Balances'],
      },
      {
        id: 2,
        title: 'Phase 2: Newton\'s Laws & Dynamics',
        description: 'Explore free-body diagrams, friction forces, centripetal acceleration, and momentum conservation.',
        estimated_hours: 30,
        subtasks: [
          'Draw accurate free-body force diagrams for inclined planes',
          'Apply F = ma to multi-body pulley systems',
          'Calculate impulse and momentum conservation in elastic collisions',
        ],
        resources: [
          { name: 'Khan Academy Physics', url: 'https://khanacademy.org', type: 'tutorial' },
        ],
        checkpoint_project: 'Newtonian Mechanics Problem Solving Portfolio.',
        key_skills: ['Newton\'s Laws', 'Free-Body Diagrams', 'Momentum', 'Friction'],
      },
      {
        id: 3,
        title: 'Phase 3: Work, Energy & AP Physics Board Prep',
        description: 'Master work-energy theorem, conservation of mechanical energy, and comprehensive board exam review.',
        estimated_hours: 35,
        subtasks: [
          'Derive work done by constant and variable forces',
          'Solve mechanical energy conservation for simple harmonic motion',
          'Complete 3 full-length timed physics practice board exams',
        ],
        resources: [
          { name: 'AP Physics Practice Portal', url: 'https://apcentral.collegeboard.org', type: 'docs' },
        ],
        checkpoint_project: 'Final AP Physics Board Exam Review Mastery.',
        key_skills: ['Work-Energy Theorem', 'Simple Harmonic Motion', 'Board Exam Review'],
      },
    ],
  },
  'calculus-foundations': {
    track_title: 'Algebra & Calculus Foundations Track',
    summary: 'Master algebraic functions, trigonometric identities, limits, derivatives, chain rule, and integral calculus.',
    total_estimated_hours: 100,
    skill_level: 'Grade 11-12',
    target_timeline: '3 months',
    milestones: [
      {
        id: 1,
        title: 'Phase 1: Advanced Algebra & Trigonometry',
        description: 'Master quadratic equations, polynomial factoring, and trigonometric identities.',
        estimated_hours: 30,
        subtasks: [
          'Solve quadratic equations by factoring, completing square, and formula',
          'Derive fundamental trigonometric identities (sin^2 + cos^2 = 1)',
          'Plot polynomial and rational functions with vertical/horizontal asymptotes',
        ],
        resources: [
          { name: 'Paul\'s Online Math Notes', url: 'https://tutorial.math.lamar.edu', type: 'docs' },
        ],
        checkpoint_project: 'Trigonometry & Polynomial Algebra Workbook.',
        key_skills: ['Algebra', 'Trigonometry', 'Polynomials', 'Asymptotes'],
      },
      {
        id: 2,
        title: 'Phase 2: Differential Calculus & Chain Rule',
        description: 'Master limits, derivative definition, product rule, quotient rule, and chain rule for composite functions.',
        estimated_hours: 35,
        subtasks: [
          'Understand limit definition of derivative f\'(x)',
          'Apply Chain Rule to composite functions like sin(3x^2 + 5)',
          'Find local maxima, minima, and points of inflection using 1st and 2nd derivatives',
        ],
        resources: [
          { name: 'MIT OpenCourseWare Calculus', url: 'https://ocw.mit.edu', type: 'docs' },
        ],
        checkpoint_project: 'Calculus Derivatives & Curve Sketching Project.',
        key_skills: ['Limits', 'Derivatives', 'Chain Rule', 'Optimization'],
      },
      {
        id: 3,
        title: 'Phase 3: Integral Calculus & Applications',
        description: 'Understand indefinite and definite integrals, substitution method, and area under curves.',
        estimated_hours: 35,
        subtasks: [
          'Evaluate antiderivatives and u-substitution techniques',
          'Calculate definite integrals using Fundamental Theorem of Calculus',
          'Determine area between two intersecting curves',
        ],
        resources: [
          { name: 'Khan Academy Calculus', url: 'https://khanacademy.org', type: 'tutorial' },
        ],
        checkpoint_project: 'Integration & Area Applications Problem Set.',
        key_skills: ['Integrals', 'U-Substitution', 'Definite Integrals', 'Area Calculation'],
      },
    ],
  },
  'chemistry-biology': {
    track_title: 'Chemistry & Biology Lab Sciences Track',
    summary: 'Master atomic structure, chemical stoichiometry, redox equations, cellular energetics, and genetics.',
    total_estimated_hours: 95,
    skill_level: 'Grade 10-12',
    target_timeline: '3 months',
    milestones: [
      {
        id: 1,
        title: 'Phase 1: Atomic Structure & Chemical Bonding',
        description: 'Understand electron configurations, periodic trends, ionic and covalent bonding.',
        estimated_hours: 30,
        subtasks: [
          'Write s, p, d electron configurations for periodic elements',
          'Draw Lewis dot structures and predict VSEPR molecular geometry',
          'Calculate molar mass and perform stoichiometric mole conversions',
        ],
        resources: [
          { name: 'ChemLibreTexts', url: 'https://chem.libretexts.org', type: 'docs' },
        ],
        checkpoint_project: 'Chemical Bonding & Stoichiometry Lab Workbook.',
        key_skills: ['Atomic Structure', 'Lewis Structures', 'Stoichiometry', 'Molar Mass'],
      },
      {
        id: 2,
        title: 'Phase 2: Redox Reactions & Electrochemistry',
        description: 'Balance oxidation-reduction half-reactions in acidic and basic solutions.',
        estimated_hours: 30,
        subtasks: [
          'Assign oxidation states to atoms in complex molecules',
          'Balance half-reactions using H+ and H2O balancing steps',
          'Calculate standard cell potential for galvanic cells',
        ],
        resources: [
          { name: 'CrashCourse Chemistry', url: 'https://youtube.com', type: 'tutorial' },
        ],
        checkpoint_project: 'Redox Equation Balancing & Electrochemistry Portfolio.',
        key_skills: ['Redox', 'Oxidation Numbers', 'Half-Reactions', 'Galvanic Cells'],
      },
      {
        id: 3,
        title: 'Phase 3: Cellular Energetics & Genetics',
        description: 'Explore photosynthesis, cellular respiration, DNA replication, and Mendelian inheritance.',
        estimated_hours: 35,
        subtasks: [
          'Compare reactants and products of photosynthesis vs cellular respiration',
          'Trace ATP generation through glycolysis, Krebs cycle, and electron transport',
          'Solve Punnett square genetics problems for mono and dihybrid crosses',
        ],
        resources: [
          { name: 'Bozeman Science Biology', url: 'https://bozemanscience.com', type: 'tutorial' },
        ],
        checkpoint_project: 'Cellular Biology & Genetics Synthesis Presentation.',
        key_skills: ['Cellular Respiration', 'Photosynthesis', 'Genetics', 'DNA Replication'],
      },
    ],
  },
};

export const CareerRoadmap: React.FC = () => {
  const [selectedTrackKey, setSelectedTrackKey] = useState<string>('physics-mastery');
  const [currentRoadmap, setCurrentRoadmap] = useState<RoadmapData>(PRESET_CAREER_TRACKS['physics-mastery']);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load existing student roadmaps from backend on mount
  useEffect(() => {
    const fetchExistingRoadmaps = async () => {
      try {
        const savedList = await api.getStudentRoadmaps();
        if (savedList && savedList.length > 0) {
          const latest: any = savedList[0];
          const mapped: RoadmapData = {
            track_title: latest.track_title || 'Personalized Career Pathway',
            summary: latest.summary || 'Custom career track curriculum.',
            total_estimated_hours: latest.total_estimated_hours || 120,
            skill_level: latest.skill_level || 'Intermediate',
            target_timeline: latest.target_timeline || '3 months',
            milestones: (latest.milestones || []).map((m: any, idx: number) => ({
              id: m.step_number || (idx + 1),
              title: m.title,
              description: m.description,
              estimated_hours: m.estimated_hours,
              subtasks: m.subtasks || [],
              resources: m.resources || [],
              checkpoint_project: m.checkpoint_project || 'Milestone project checkpoint',
              key_skills: m.key_skills || [],
            })),
          };
          setCurrentRoadmap(mapped);
        }
      } catch (err) {
        console.warn('Backend roadmaps notice, using interactive presets:', err);
      }
    };

    fetchExistingRoadmaps();
  }, []);

  const handleSelectPresetTrack = (trackKey: string) => {
    setSelectedTrackKey(trackKey);
    if (PRESET_CAREER_TRACKS[trackKey]) {
      setCurrentRoadmap(PRESET_CAREER_TRACKS[trackKey]);
    }
  };

  const handleGenerateNewRoadmap = async (goal: string, skillLevel: string, timeline: string) => {
    setIsGenerating(true);
    try {
      const res = await api.generateRoadmap({
        student_goal: goal,
        current_skill_level: skillLevel,
        target_timeline: timeline,
      });

      if (res.success && res.roadmap) {
        setCurrentRoadmap(res.roadmap);
        setSelectedTrackKey('custom');

        // Auto-save to Supabase
        try {
          await api.saveRoadmap({
            student_goal: goal,
            roadmap: res.roadmap,
          });
        } catch (saveErr) {
          console.warn('Auto-save notice:', saveErr);
        }
      }
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-6">
      {/* Preset Tracks Switcher Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Curated Specialization Pathways
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Click to switch track</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleSelectPresetTrack('fullstack-ai')}
            className={`p-3 rounded-2xl border text-left transition ${
              selectedTrackKey === 'fullstack-ai'
                ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold ring-2 ring-sky-500/10 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <span className="text-xs block">Full-Stack Modern AI Web</span>
            <span className="text-[10px] text-slate-500 font-normal">React 19, FastAPI, pgvector</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPresetTrack('backend-systems')}
            className={`p-3 rounded-2xl border text-left transition ${
              selectedTrackKey === 'backend-systems'
                ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold ring-2 ring-teal-500/10 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <span className="text-xs block">Backend & Systems Architect</span>
            <span className="text-[10px] text-slate-500 font-normal">FastAPI, PostgreSQL, Redis</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPresetTrack('algorithms-dsa')}
            className={`p-3 rounded-2xl border text-left transition ${
              selectedTrackKey === 'algorithms-dsa'
                ? 'bg-purple-50 border-purple-500 text-purple-900 font-bold ring-2 ring-purple-500/10 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <span className="text-xs block">Algorithms & DSA Prep</span>
            <span className="text-[10px] text-slate-500 font-normal">DP, Graphs, LeetCode</span>
          </button>
        </div>
      </div>

      <RoadmapTree
        initialRoadmap={currentRoadmap}
        onGenerateNewRoadmap={handleGenerateNewRoadmap}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default CareerRoadmap;
