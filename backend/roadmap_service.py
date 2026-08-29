import os
import json
import time
from typing import List, Optional
from pydantic import BaseModel, Field
from groq import Groq, GroqError
from dotenv import load_dotenv

load_dotenv()


class ResourceItem(BaseModel):
    """Recommended learning or open-source documentation resource."""
    name: str = Field(..., description="Name of the documentation, repository, or tool")
    url: str = Field(..., description="Link or documentation reference")
    type: str = Field(default="docs", description="Type: docs, github, tutorial, or course")


class Milestone(BaseModel):
    """Sequential milestone in the Career Track roadmap."""
    id: int = Field(..., description="Step index (1, 2, 3...)")
    title: str = Field(..., description="Milestone title, e.g. Phase 1: Modern React Architecture")
    description: str = Field(..., description="Summary of core concepts and goals for this phase")
    estimated_hours: int = Field(..., description="Estimated hours to complete this phase")
    subtasks: List[str] = Field(default_factory=list, description="Actionable checklist items")
    resources: List[ResourceItem] = Field(default_factory=list, description="Curated open-source resources")
    checkpoint_project: str = Field(..., description="Practical hands-on project to demonstrate mastery")
    key_skills: List[str] = Field(default_factory=list, description="Target competencies acquired")


class GenerateRoadmapRequest(BaseModel):
    """Payload for POST /api/generate-roadmap."""
    student_goal: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Career or skill goal (e.g., Full-Stack AI Engineer, Frontend Architect, FAANG Interview Prep)",
        examples=["Full-Stack AI Application Engineer"]
    )
    current_skill_level: Optional[str] = Field(
        default="Beginner",
        description="Current proficiency: Beginner, Intermediate, or Advanced"
    )
    target_timeline: Optional[str] = Field(
        default="3 months",
        description="Target duration (e.g. 6 weeks, 3 months, 6 months)"
    )
    focus_areas: Optional[List[str]] = Field(
        default_factory=list,
        description="Specific topics to emphasize (e.g. ['React', 'FastAPI', 'pgvector'])"
    )


class StructuredRoadmap(BaseModel):
    """Complete structured Career Track roadmap."""
    track_title: str
    summary: str
    total_estimated_hours: int
    skill_level: str
    target_timeline: str
    milestones: List[Milestone]


class GenerateRoadmapResponse(BaseModel):
    """Standard API response for roadmap generation."""
    success: bool = True
    student_goal: str
    roadmap: StructuredRoadmap
    processing_time_ms: float


def generate_fallback_roadmap(goal: str, skill_level: str, timeline: str, focus_areas: Optional[List[str]] = None) -> StructuredRoadmap:
    """
    Resilient offline domain template generator when Groq API is unconfigured or offline.
    """
    goal_lower = goal.lower()
    focus_tags = focus_areas or []

    if any(k in goal_lower for k in ["ai", "ml", "machine learning", "whisper", "vector", "llm"]):
        track_title = f"AI & Machine Learning Engineering Track ({timeline})"
        summary = f"Comprehensive {timeline} journey from Python data foundations to local vector embeddings, Whisper speech models, and production RAG pipelines."
        milestones = [
            Milestone(
                id=1,
                title="Phase 1: Python Deep Dive & Data Pipeline Fundamentals",
                description="Master asynchronous Python, NumPy vector operations, and data ingestion architectures.",
                estimated_hours=30,
                subtasks=[
                    "Build asynchronous data scrapers and clean text datasets",
                    "Vectorize array operations using NumPy and Pandas",
                    "Implement basic linear algebra and cosine similarity from scratch"
                ],
                resources=[
                    ResourceItem(name="Python Official AsyncIO Docs", url="https://docs.python.org/3/library/asyncio.html", type="docs"),
                    ResourceItem(name="NumPy Quickstart Guide", url="https://numpy.org/doc/stable/user/quickstart.html", type="docs")
                ],
                checkpoint_project="Async data ingestion pipeline processing multimodal dataset chunks.",
                key_skills=["Python", "NumPy", "AsyncIO", "Data Cleaning"]
            ),
            Milestone(
                id=2,
                title="Phase 2: Speech-to-Text & Transformer Model Pipelines",
                description="Integrate Groq Whisper (whisper-large-v3) and local sentence-transformers for real-time speech and semantic embeddings.",
                estimated_hours=40,
                subtasks=[
                    "Implement multipart audio upload streaming in FastAPI",
                    "Process speech with Whisper API and benchmark transcription latency",
                    "Generate 384-dimensional dense vector embeddings with all-MiniLM-L6-v2"
                ],
                resources=[
                    ResourceItem(name="Groq Cloud Documentation", url="https://console.groq.com/docs", type="docs"),
                    ResourceItem(name="Hugging Face Transformers", url="https://huggingface.co/docs/transformers", type="docs")
                ],
                checkpoint_project="Real-time voice doubt intake API with Whisper transcription and structured metadata extraction.",
                key_skills=["Groq API", "Whisper", "Transformers", "Audio Processing"]
            ),
            Milestone(
                id=3,
                title="Phase 3: Vector Databases & Semantic Mentor Matching",
                description="Deploy PostgreSQL pgvector with HNSW cosine distance indexes for sub-millisecond semantic similarity search.",
                estimated_hours=40,
                subtasks=[
                    "Write SQL migration scripts for 384-dimensional vector columns",
                    "Configure HNSW cosine indexes with m=16, ef_construction=64",
                    "Implement match_mentors RPC function with domain taxonomy filtering"
                ],
                resources=[
                    ResourceItem(name="pgvector GitHub Repository", url="https://github.com/pgvector/pgvector", type="github"),
                    ResourceItem(name="Supabase Vector Search Guide", url="https://supabase.com/docs/guides/ai", type="docs")
                ],
                checkpoint_project="Production-ready semantic mentor matching engine with ranked cosine similarity percentages.",
                key_skills=["PostgreSQL", "pgvector", "HNSW Indexes", "SQL RPCs", "FastAPI"]
            )
        ]
    elif any(k in goal_lower for k in ["algo", "faang", "interview", "leetcode", "data structure"]):
        track_title = f"Competitive Programming & FAANG Interview Mastery ({timeline})"
        summary = f"Structured {timeline} roadmap mastering algorithmic problem solving, graph theory, and dynamic programming."
        milestones = [
            Milestone(
                id=1,
                title="Phase 1: Core Linear & Non-Linear Data Structures",
                description="Master time/space complexity analysis, two pointers, sliding window, and binary trees.",
                estimated_hours=35,
                subtasks=[
                    "Implement custom Stack, Queue, Heap, and Trie data structures",
                    "Solve 30 LeetCode Medium sliding window and two pointer problems",
                    "Master Tree traversals (BFS, DFS, Lowest Common Ancestor)"
                ],
                resources=[
                    ResourceItem(name="NeetCode Roadmap", url="https://neetcode.io/roadmap", type="tutorial"),
                    ResourceItem(name="Visualgo Algorithm Visualizer", url="https://visualgo.net", type="docs")
                ],
                checkpoint_project="Build an interactive visualizer for tree and graph traversal algorithms.",
                key_skills=["Data Structures", "Trees", "Sliding Window", "Big-O Analysis"]
            ),
            Milestone(
                id=2,
                title="Phase 2: Dynamic Programming & State Transitions",
                description="Conquer 1D and 2D dynamic programming, memoization, and optimal substructure formulation.",
                estimated_hours=45,
                subtasks=[
                    "Transition from recursive top-down to bottom-up tabular DP",
                    "Solve Grid Traversal, Knapsack, and Longest Common Subsequence problems",
                    "Practice bitmask and state compression techniques"
                ],
                resources=[
                    ResourceItem(name="Dynamic Programming by Erik Demaine (MIT)", url="https://ocw.mit.edu", type="course")
                ],
                checkpoint_project="Solve and document comprehensive solutions for 25 top DP interview challenges.",
                key_skills=["Dynamic Programming", "Memoization", "Recurrence Relations"]
            ),
            Milestone(
                id=3,
                title="Phase 3: Graph Algorithms & Mock Technical Interviews",
                description="Master Dijkstra, Bellman-Ford, Topological Sort, Disjoint Set Union, and mock interview drills.",
                estimated_hours=35,
                subtasks=[
                    "Implement shortest path and minimum spanning tree algorithms",
                    "Participate in timed weekly contest simulations",
                    "Practice communicating time/space complexity tradeoffs out loud"
                ],
                resources=[
                    ResourceItem(name="USACO Guide", url="https://usaco.guide", type="tutorial")
                ],
                checkpoint_project="Pass 3 live mock technical interviews under 45-minute time constraints.",
                key_skills=["Graph Theory", "Dijkstra", "Topological Sort", "Interview Communication"]
            )
        ]
    else:
        # Default: Full-Stack Web & AI Engineering Track
        track_title = f"Full-Stack Modern Web & AI Development ({timeline})"
        summary = f"Comprehensive {timeline} pathway from modern React 19 architecture to FastAPI, Supabase JWT auth, and AI integrations."
        milestones = [
            Milestone(
                id=1,
                title="Phase 1: React 19, TypeScript & Audio UI Components",
                description="Master typed React architecture, Tailwind CSS design systems, and HTML5 Web Audio API.",
                estimated_hours=35,
                subtasks=[
                    "Create accessible glassmorphic UI cards with micro-animations",
                    "Implement MediaRecorder audio stream capture and canvas waveform spectrum",
                    "Enforce role-based layout redirects and 403 authorization boundaries"
                ],
                resources=[
                    ResourceItem(name="React Official Documentation", url="https://react.dev", type="docs"),
                    ResourceItem(name="Tailwind CSS Documentation", url="https://tailwindcss.com/docs", type="docs")
                ],
                checkpoint_project="Voice Intake Audio Recorder component with live animated spectrum canvas.",
                key_skills=["React 19", "TypeScript", "Tailwind CSS", "Web Audio API"]
            ),
            Milestone(
                id=2,
                title="Phase 2: FastAPI Backend & Local JWT Verification",
                description="Build asynchronous REST API services with local HS256 JWT signature verification and role guards.",
                estimated_hours=35,
                subtasks=[
                    "Set up FastAPI application with CORS and Pydantic validation",
                    "Implement zero-roundtrip Supabase JWT authentication middleware",
                    "Integrate Groq Whisper API for speech-to-text transcription"
                ],
                resources=[
                    ResourceItem(name="FastAPI Tutorial", url="https://fastapi.tiangolo.com/tutorial/", type="docs"),
                    ResourceItem(name="PyJWT Documentation", url="https://pyjwt.readthedocs.io", type="docs")
                ],
                checkpoint_project="Secure FastAPI backend service with role guards and audio transcription endpoint.",
                key_skills=["FastAPI", "JWT Auth", "Pydantic", "Python"]
            ),
            Milestone(
                id=3,
                title="Phase 3: Vector Embeddings, Mentor Matching & PWA Offline Sync",
                description="Connect pgvector similarity search, Groq Llama 3 classification, and service worker background sync.",
                estimated_hours=40,
                subtasks=[
                    "Implement 384-dimensional query embedding generation",
                    "Create Supabase match_mentors RPC function for Cosine similarity",
                    "Configure PWA manifest and offline IndexedDB voice query caching"
                ],
                resources=[
                    ResourceItem(name="Supabase pgvector Docs", url="https://supabase.com/docs/guides/ai", type="docs"),
                    ResourceItem(name="Vite PWA Plugin Guide", url="https://vite-pwa-org.netlify.app", type="docs")
                ],
                checkpoint_project="Full-Stack MentorMatch AI platform with offline audio sync and live mentor matching.",
                key_skills=["pgvector", "LLMs", "PWA", "IndexedDB", "Supabase"]
            )
        ]

    total_hours = sum(m.estimated_hours for m in milestones)

    return StructuredRoadmap(
        track_title=track_title,
        summary=summary,
        total_estimated_hours=total_hours,
        skill_level=skill_level,
        target_timeline=timeline,
        milestones=milestones
    )


def generate_career_roadmap(request: GenerateRoadmapRequest) -> StructuredRoadmap:
    """
    Main roadmap generation function:
    Invokes Groq Llama 3 (llama-3.3-70b-versatile) with strict JSON mode,
    falling back to curated domain templates if API key is not configured.
    """
    groq_key = os.getenv("GROQ_API_KEY", "").strip()

    if groq_key and not groq_key.startswith("gsk_your"):
        try:
            client = Groq(api_key=groq_key)
            
            system_prompt = (
                "You are an expert technical career coach and curriculum architect for MentorMatch AI. "
                "Your task is to generate a comprehensive, actionable Career Track roadmap tailored to the student's goal, "
                "skill level, and timeline.\n\n"
                "You MUST return ONLY a valid JSON object matching this schema exactly:\n"
                "{\n"
                '  "track_title": "Descriptive Career Track Title",\n'
                '  "summary": "1-2 sentence overview of the journey and outcomes",\n'
                '  "total_estimated_hours": 120,\n'
                '  "skill_level": "Beginner | Intermediate | Advanced",\n'
                '  "target_timeline": "3 months",\n'
                '  "milestones": [\n'
                "    {\n"
                '      "id": 1,\n'
                '      "title": "Phase 1: Phase Title",\n'
                '      "description": "Clear explanation of core concepts",\n'
                '      "estimated_hours": 35,\n'
                '      "subtasks": ["Actionable subtask 1", "Actionable subtask 2", "Actionable subtask 3"],\n'
                '      "resources": [\n'
                '        {"name": "Official Resource Name", "url": "https://example.com/docs", "type": "docs"}\n'
                "      ],\n"
                '      "checkpoint_project": "Hands-on project to validate mastery",\n'
                '      "key_skills": ["Skill1", "Skill2", "Skill3"]\n'
                "    }\n"
                "  ]\n"
                "}\n"
                "Create between 3 and 5 progressive milestones with concrete projects and open-source resources."
            )

            user_prompt = (
                f"Student Goal: {request.student_goal}\n"
                f"Current Skill Level: {request.current_skill_level or 'Beginner'}\n"
                f"Target Timeline: {request.target_timeline or '3 months'}\n"
                f"Focus Areas: {', '.join(request.focus_areas) if request.focus_areas else 'Core modern standards'}\n"
            )

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=2000,
            )

            content = response.choices[0].message.content
            parsed = json.loads(content)

            # Validate milestones through Pydantic
            milestone_objs = []
            for idx, raw_m in enumerate(parsed.get("milestones", []), start=1):
                resources = [
                    ResourceItem(
                        name=r.get("name", "Resource Docs"),
                        url=r.get("url", "https://docs.python.org"),
                        type=r.get("type", "docs")
                    )
                    for r in raw_m.get("resources", [])
                    if isinstance(r, dict)
                ]
                milestone_objs.append(Milestone(
                    id=raw_m.get("id", idx),
                    title=str(raw_m.get("title", f"Phase {idx}")),
                    description=str(raw_m.get("description", "")),
                    estimated_hours=int(raw_m.get("estimated_hours", 30)),
                    subtasks=[str(t) for t in raw_m.get("subtasks", [])],
                    resources=resources,
                    checkpoint_project=str(raw_m.get("checkpoint_project", "Project checkpoint")),
                    key_skills=[str(k) for k in raw_m.get("key_skills", [])]
                ))

            total_hours = parsed.get("total_estimated_hours") or sum(m.estimated_hours for m in milestone_objs)

            return StructuredRoadmap(
                track_title=str(parsed.get("track_title", f"{request.student_goal} Track")),
                summary=str(parsed.get("summary", "Personalized career roadmap.")),
                total_estimated_hours=int(total_hours),
                skill_level=str(request.current_skill_level or "Beginner"),
                target_timeline=str(request.target_timeline or "3 months"),
                milestones=milestone_objs
            )

        except Exception as exc:
            print(f"[WARN] Groq LLM roadmap generation fallback engaged: {exc}")
            return generate_fallback_roadmap(
                request.student_goal,
                request.current_skill_level or "Beginner",
                request.target_timeline or "3 months",
                request.focus_areas
            )
    else:
        return generate_fallback_roadmap(
            request.student_goal,
            request.current_skill_level or "Beginner",
            request.target_timeline or "3 months",
            request.focus_areas
        )
