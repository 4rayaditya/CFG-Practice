import React, { useState, useEffect } from 'react';
import { RoadmapTree, RoadmapData } from '../../components/roadmap/RoadmapTree';
import { api } from '../../services/api';
import { Compass, Sparkles, Layers, CheckCircle2 } from 'lucide-react';

export const PRESET_CAREER_TRACKS: Record<string, RoadmapData> = {
  'fullstack-ai': {
    track_title: 'Full-Stack Modern Web & AI Development Track',
    summary: 'Master full-stack React 19 architecture, local JWT authentication, Groq Whisper voice intake, and pgvector semantic mentor matching.',
    total_estimated_hours: 115,
    skill_level: 'Intermediate',
    target_timeline: '3 months',
    milestones: [
      {
        id: 1,
        title: 'Phase 1: React 19, TypeScript & Web Audio Intake',
        description: 'Master typed React component design, Tailwind CSS styling tokens, and HTML5 Web Audio API waveform visualization.',
        estimated_hours: 35,
        subtasks: [
          'Create accessible glassmorphic UI cards with micro-animations',
          'Implement MediaRecorder audio stream capture and canvas waveform spectrum',
          'Enforce role-based layout redirects and 403 authorization boundaries',
        ],
        resources: [
          { name: 'React Official Documentation', url: 'https://react.dev', type: 'docs' },
          { name: 'MDN Web Audio API Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API', type: 'docs' },
          { name: 'Tailwind CSS Documentation', url: 'https://tailwindcss.com/docs', type: 'docs' },
        ],
        checkpoint_project: 'Voice Intake Audio Recorder component with live animated spectrum canvas.',
        key_skills: ['React 19', 'TypeScript', 'Tailwind CSS', 'Web Audio API'],
      },
      {
        id: 2,
        title: 'Phase 2: FastAPI Backend & Local JWT Verification',
        description: 'Build asynchronous REST API services with local HS256 JWT signature verification and role guards.',
        estimated_hours: 35,
        subtasks: [
          'Set up FastAPI application with CORS and Pydantic validation',
          'Implement zero-roundtrip Supabase JWT authentication middleware',
          'Integrate Groq Whisper API (whisper-large-v3) for speech transcription',
        ],
        resources: [
          { name: 'FastAPI Tutorial', url: 'https://fastapi.tiangolo.com/tutorial/', type: 'docs' },
          { name: 'Groq Cloud Documentation', url: 'https://console.groq.com/docs', type: 'docs' },
          { name: 'PyJWT Documentation', url: 'https://pyjwt.readthedocs.io', type: 'docs' },
        ],
        checkpoint_project: 'Secure FastAPI backend service with role guards and audio transcription endpoint.',
        key_skills: ['FastAPI', 'JWT Auth', 'Groq Whisper', 'Pydantic', 'Python'],
      },
      {
        id: 3,
        title: 'Phase 3: Vector Embeddings, Mentor Matching & PWA Offline Sync',
        description: 'Connect pgvector similarity search, Groq Llama 3 classification, and service worker background sync.',
        estimated_hours: 45,
        subtasks: [
          'Implement 384-dimensional query embedding generation with all-MiniLM-L6-v2',
          'Create Supabase match_mentors RPC function for Cosine similarity search',
          'Configure PWA manifest and offline IndexedDB voice query caching',
        ],
        resources: [
          { name: 'Supabase pgvector Docs', url: 'https://supabase.com/docs/guides/ai', type: 'docs' },
          { name: 'pgvector GitHub Repository', url: 'https://github.com/pgvector/pgvector', type: 'github' },
          { name: 'Vite PWA Plugin Guide', url: 'https://vite-pwa-org.netlify.app', type: 'docs' },
        ],
        checkpoint_project: 'Full-Stack MentorMatch AI platform with offline audio sync and live mentor matching.',
        key_skills: ['pgvector', 'HNSW Indexes', 'PWA', 'IndexedDB', 'Supabase'],
      },
    ],
  },
  'backend-systems': {
    track_title: 'Backend & Distributed Systems Architect Track',
    summary: 'Master asynchronous Python, PostgreSQL database optimization, microservices, connection pooling, and high-throughput APIs.',
    total_estimated_hours: 130,
    skill_level: 'Advanced',
    target_timeline: '4 months',
    milestones: [
      {
        id: 1,
        title: 'Phase 1: Asynchronous FastAPI & Relational PostgreSQL',
        description: 'Architect RESTful APIs with SQLAlchemy async engine, Alembic migrations, and connection pooling.',
        estimated_hours: 40,
        subtasks: [
          'Design relational schemas with UUIDs, foreign keys, and cascading triggers',
          'Implement JWT authentication with role-based claim authorization',
          'Configure slowapi rate limiting with client IP proxy headers',
        ],
        resources: [
          { name: 'FastAPI SQL Databases', url: 'https://fastapi.tiangolo.com/tutorial/sql-databases/', type: 'docs' },
          { name: 'PostgreSQL Official Docs', url: 'https://www.postgresql.org/docs/', type: 'docs' },
        ],
        checkpoint_project: 'High-throughput REST API with ACID transactions and JWT verification.',
        key_skills: ['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'Alembic'],
      },
      {
        id: 2,
        title: 'Phase 2: Vector Search & High-Concurrency Caching',
        description: 'Implement pgvector HNSW indexing, Redis distributed caching, and WebSocket pub/sub broadcasting.',
        estimated_hours: 45,
        subtasks: [
          'Deploy pgvector extension with cosine distance indexes',
          'Implement Redis cache layers for expensive semantic searches',
          'Build real-time WebSocket channels for live event streaming',
        ],
        resources: [
          { name: 'Redis Documentation', url: 'https://redis.io/docs/', type: 'docs' },
          { name: 'pgvector Indexing Guide', url: 'https://github.com/pgvector/pgvector#indexing', type: 'github' },
        ],
        checkpoint_project: 'Real-time pub/sub notification engine with cached vector lookups.',
        key_skills: ['Redis', 'pgvector', 'WebSockets', 'Concurrency'],
      },
      {
        id: 3,
        title: 'Phase 3: Microservices & Cloud Observability',
        description: 'Docker containerization, Prometheus metrics, structured JSON logging, and deployment automation.',
        estimated_hours: 45,
        subtasks: [
          'Containerize services with multi-stage Docker builds',
          'Set up health check telemetry and Prometheus metrics endpoints',
          'Configure CI/CD pipelines with automated test suites',
        ],
        resources: [
          { name: 'Docker Documentation', url: 'https://docs.docker.com/', type: 'docs' },
          { name: 'Prometheus FastAPI Guide', url: 'https://prometheus.io/docs/', type: 'docs' },
        ],
        checkpoint_project: 'Containerized microservices cluster with telemetry dashboards.',
        key_skills: ['Docker', 'Prometheus', 'CI/CD', 'Telemetry'],
      },
    ],
  },
  'algorithms-dsa': {
    track_title: 'Algorithms & Competitive Problem Solving Track',
    summary: 'Master dynamic programming state transitions, graph traversal, trees, and algorithmic optimization techniques.',
    total_estimated_hours: 100,
    skill_level: 'Intermediate',
    target_timeline: '8 weeks',
    milestones: [
      {
        id: 1,
        title: 'Phase 1: Dynamic Programming Memoization & Tabulation',
        description: 'Master 1D and 2D dynamic programming, knapsack variants, grid paths, and recurrence relations.',
        estimated_hours: 35,
        subtasks: [
          'Implement top-down memoization vs bottom-up tabulation',
          'Solve minimum path sum and longest common subsequence',
          'Analyze asymptotic time and space complexity trade-offs',
        ],
        resources: [
          { name: 'LeetCode DP Study Plan', url: 'https://leetcode.com', type: 'tutorial' },
          { name: 'GeeksforGeeks DP Guide', url: 'https://geeksforgeeks.org', type: 'docs' },
        ],
        checkpoint_project: 'Comprehensive DP pattern cheatsheet and solutions repository.',
        key_skills: ['Dynamic Programming', 'Memoization', 'Complexity Analysis'],
      },
      {
        id: 2,
        title: 'Phase 2: Graph Algorithms & Tree Traversal',
        description: 'Master BFS, DFS, Dijkstra shortest path, union-find, and topological sorting.',
        estimated_hours: 35,
        subtasks: [
          'Implement graph adjacency lists and bipartite graph detection',
          'Build shortest path algorithms with priority queues (Dijkstra/A*)',
          'Solve lowest common ancestor and tree serialization',
        ],
        resources: [
          { name: 'CP-Algorithms Guide', url: 'https://cp-algorithms.com', type: 'docs' },
        ],
        checkpoint_project: 'Interactive Graph Traversal & Shortest Path Visualizer.',
        key_skills: ['Graphs', 'Trees', 'BFS/DFS', 'Dijkstra'],
      },
      {
        id: 3,
        title: 'Phase 3: Advanced Data Structures & Mock Interviews',
        description: 'Segment trees, Fenwick trees, tries, monotonic stacks, and live mock coding sessions.',
        estimated_hours: 30,
        subtasks: [
          'Implement Trie for autocomplete and prefix search',
          'Solve monotonic queue and sliding window maximum challenges',
          'Complete 3 full-length timed mock technical interviews',
        ],
        resources: [
          { name: 'NeetCode Roadmap', url: 'https://neetcode.io', type: 'tutorial' },
        ],
        checkpoint_project: 'FAANG Technical Interview Preparation Portfolio.',
        key_skills: ['Trie', 'Monotonic Stack', 'Systematic Problem Solving'],
      },
    ],
  },
};

export const CareerRoadmap: React.FC = () => {
  const [selectedTrackKey, setSelectedTrackKey] = useState<string>('fullstack-ai');
  const [currentRoadmap, setCurrentRoadmap] = useState<RoadmapData>(PRESET_CAREER_TRACKS['fullstack-ai']);
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
