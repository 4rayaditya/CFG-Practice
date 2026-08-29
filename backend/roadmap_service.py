import os
import json
import time
import math
from typing import List, Optional, Union, Dict, Any
from pydantic import BaseModel, Field
from groq import Groq, GroqError
from dotenv import load_dotenv

load_dotenv()


class ResourceItem(BaseModel):
    """Recommended learning or open-source documentation resource."""
    name: str = Field(..., description="Name of the documentation, repository, or tool")
    url: str = Field(default="https://docs.python.org", description="Link or documentation reference")
    type: str = Field(default="docs", description="Type: docs, github, tutorial, or course")


class ProjectCheckpoint(BaseModel):
    """Practical hands-on milestone project to demonstrate mastery."""
    title: str = Field(default="Milestone Checkpoint Project", description="Title of the milestone project")
    deliverable: str = Field(default="Working repository deliverable and test suite", description="Expected tangible deliverable")


class Milestone(BaseModel):
    """Sequential milestone in the Career Track roadmap."""
    id: int = Field(..., description="Step index (1, 2, 3...)")
    title: str = Field(..., description="Milestone title, e.g. Phase 1: Modern React Architecture")
    description: str = Field(..., description="Summary of core concepts and goals for this phase")
    week_number: Optional[int] = Field(default=1, description="Sequential week number in timeline")
    key_topics: List[str] = Field(default_factory=list, description="Target technical concepts and key topics")
    project_checkpoint: Union[ProjectCheckpoint, str] = Field(
        default_factory=lambda: ProjectCheckpoint(title="Capstone Checkpoint", deliverable="Functional codebase"),
        description="Practical hands-on project deliverable"
    )
    checkpoint_project: Optional[str] = Field(
        default="Capstone Checkpoint Deliverable",
        description="String summary of project checkpoint"
    )
    estimated_hours: int = Field(default=25, description="Estimated hours to complete this phase")
    subtasks: List[str] = Field(default_factory=list, description="Actionable checklist items")
    resources: List[ResourceItem] = Field(default_factory=list, description="Curated open-source resources")
    key_skills: List[str] = Field(default_factory=list, description="Target competencies acquired")


class GenerateRoadmapRequest(BaseModel):
    """Payload for POST /api/generate-roadmap."""
    student_goal: str = Field(
        ...,
        min_length=2,
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
    title: str = Field(..., description="Descriptive Career Pathway Title")
    track_title: Optional[str] = Field(default=None, description="Alias matching title")
    summary: str = Field(..., description="Executive curriculum overview")
    estimated_weeks: int = Field(default=12, description="Calculated duration in weeks")
    total_estimated_hours: int = Field(default=120, description="Total learning commitment in hours")
    skill_level: str = Field(default="Beginner", description="Target proficiency baseline")
    target_timeline: str = Field(default="3 months", description="Student target timeline")
    milestones: List[Milestone] = Field(default_factory=list, description="Ordered curriculum milestones")


class GenerateRoadmapResponse(BaseModel):
    """Standard API response for roadmap generation."""
    success: bool = True
    student_goal: str
    roadmap: StructuredRoadmap
    processing_time_ms: float


def parse_timeline_to_weeks(timeline_str: str) -> int:
    """Parses natural language timelines (e.g. '3 months', '6 weeks', '1 year') to weeks."""
    s = (timeline_str or "").lower().strip()
    try:
        nums = [int(token) for token in s.split() if token.isdigit()]
        val = nums[0] if nums else 3
        if "month" in s:
            return max(1, val * 4)
        if "week" in s:
            return max(1, val)
        if "year" in s:
            return max(1, val * 52)
        if "day" in s:
            return max(1, math.ceil(val / 7))
    except Exception:
        pass
    return 12  # Default to 12 weeks (~3 months)


def construct_dynamic_fallback(request: GenerateRoadmapRequest, estimated_weeks: int) -> StructuredRoadmap:
    """
    Constructs a dynamically computed roadmap structure based strictly on the student's
    specific input goal and parameters without any static canned mock data.
    """
    goal = request.student_goal.strip()
    skill = request.current_skill_level or "Beginner"
    timeline = request.target_timeline or "3 months"
    focus = request.focus_areas or ["Core Architecture", "Production Implementation", "Testing & Deployment"]

    num_milestones = min(max(3, math.ceil(estimated_weeks / 2)), 6)
    weeks_per_phase = max(1, estimated_weeks // num_milestones)

    milestones = []
    for i in range(1, num_milestones + 1):
        focus_topic = focus[(i - 1) % len(focus)] if focus else f"Core Area {i}"
        week_start = (i - 1) * weeks_per_phase + 1
        week_end = min(estimated_weeks, i * weeks_per_phase)
        
        milestones.append(Milestone(
            id=i,
            title=f"Phase {i}: Mastering {focus_topic} for {goal}",
            description=f"In-depth mastery of {focus_topic} tailored for {skill} level, covering core paradigms and real-world system design.",
            week_number=i,
            key_topics=[focus_topic, f"{goal} Patterns", "Clean Code & Testing", "Performance Optimization"],
            project_checkpoint=ProjectCheckpoint(
                title=f"{focus_topic} Capstone Implementation",
                deliverable=f"Production-grade {focus_topic} module with automated tests and architecture documentation"
            ),
            estimated_hours=weeks_per_phase * 10,
            subtasks=[
                f"Study foundational principles and documentation for {focus_topic}",
                f"Implement hands-on laboratory exercises and architectural patterns",
                f"Write unit and integration tests verifying system behavior",
                f"Complete {focus_topic} checkpoint review and code audit"
            ],
            resources=[
                ResourceItem(name=f"{focus_topic} Official Guide", url="https://docs.python.org", type="docs"),
                ResourceItem(name=f"{goal} Reference Repository", url="https://github.com", type="github")
            ],
            key_skills=[focus_topic, "System Design", "Problem Solving", "Architecture"]
        ))

    title_str = f"{goal} Mastery Pathway ({timeline})"
    return StructuredRoadmap(
        title=title_str,
        track_title=title_str,
        summary=f"A personalized, dynamic {timeline} pathway for a {skill} learner striving to master {goal}.",
        estimated_weeks=estimated_weeks,
        total_estimated_hours=sum(m.estimated_hours for m in milestones),
        skill_level=skill,
        target_timeline=timeline,
        milestones=milestones
    )


def generate_career_roadmap(request: GenerateRoadmapRequest) -> StructuredRoadmap:
    """
    Generates a personalized Career Track roadmap using Groq LLaMA (llama-3.3-70b-versatile)
    with strict JSON mode, dynamically translating student_goal, skill_level, and timeline.
    """
    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    estimated_weeks = parse_timeline_to_weeks(request.target_timeline or "3 months")

    if groq_api_key and not groq_api_key.startswith("gsk_your"):
        try:
            client = Groq(api_key=groq_api_key)

            system_prompt = (
                "You are a world-class Principal Technical Mentor and Curriculum Architect at MentorMatch AI.\n"
                "Your job is to generate a comprehensive, highly technical, and actionable Career Track roadmap "
                "tailored precisely to the student's goal, starting skill level, and target timeline.\n\n"
                "You MUST return a valid JSON object matching this exact schema:\n"
                "{\n"
                '  "title": "Concise Pathway Title (string)",\n'
                '  "summary": "Executive overview of the learning journey (string)",\n'
                '  "estimated_weeks": 12 (integer),\n'
                '  "total_estimated_hours": 120 (integer),\n'
                '  "milestones": [\n'
                "    {\n"
                '      "id": 1 (integer),\n'
                '      "title": "Phase title (string)",\n'
                '      "description": "Comprehensive explanation of goals and key concepts (string)",\n'
                '      "week_number": 1 (integer),\n'
                '      "key_topics": ["Topic 1", "Topic 2", "Topic 3"],\n'
                '      "project_checkpoint": {\n'
                '        "title": "Project checkpoint name (string)",\n'
                '        "deliverable": "Tangible repository and architecture deliverable (string)"\n'
                "      },\n"
                '      "estimated_hours": 30 (integer),\n'
                '      "subtasks": ["Actionable subtask 1", "Actionable subtask 2", "Actionable subtask 3"],\n'
                '      "resources": [\n'
                '        {"name": "Resource Name", "url": "https://documentation.url", "type": "docs"}\n'
                "      ],\n"
                '      "key_skills": ["Skill 1", "Skill 2"]\n'
                "    }\n"
                "  ]\n"
                "}\n"
                "Do NOT wrap in markdown backticks or include any text outside the raw JSON object."
            )

            user_prompt = (
                f"Student Goal: {request.student_goal}\n"
                f"Current Skill Level: {request.current_skill_level or 'Beginner'}\n"
                f"Target Timeline: {request.target_timeline or '3 months'} (~{estimated_weeks} weeks)\n"
                f"Focus Areas: {', '.join(request.focus_areas) if request.focus_areas else 'Industry standard best practices'}\n"
                "Please generate a complete, rigorous, sequential roadmap with 3 to 6 practical milestone phases."
            )

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=3000,
            )

            content = response.choices[0].message.content
            parsed = json.loads(content)

            # Extract milestones safely
            milestone_objs: List[Milestone] = []
            for idx, raw_m in enumerate(parsed.get("milestones", []), start=1):
                if not isinstance(raw_m, dict):
                    continue

                raw_checkpoint = raw_m.get("project_checkpoint")
                if isinstance(raw_checkpoint, dict):
                    checkpoint = ProjectCheckpoint(
                        title=str(raw_checkpoint.get("title", f"Milestone {idx} Checkpoint Project")),
                        deliverable=str(raw_checkpoint.get("deliverable", "Working codebase with documentation"))
                    )
                elif isinstance(raw_checkpoint, str):
                    checkpoint = ProjectCheckpoint(
                        title=f"Milestone {idx} Project",
                        deliverable=raw_checkpoint
                    )
                else:
                    checkpoint = ProjectCheckpoint(
                        title=f"Milestone {idx} Checkpoint Project",
                        deliverable="Production-grade implementation deliverable"
                    )

                resources = [
                    ResourceItem(
                        name=r.get("name", "Documentation Resource"),
                        url=r.get("url", "https://docs.python.org"),
                        type=r.get("type", "docs")
                    )
                    for r in raw_m.get("resources", [])
                    if isinstance(r, dict)
                ]

                key_topics = [str(k) for k in raw_m.get("key_topics", [])]
                key_skills = [str(s) for s in raw_m.get("key_skills", [])] or key_topics

                checkpoint_desc = (
                    f"{checkpoint.title}: {checkpoint.deliverable}" 
                    if isinstance(checkpoint, ProjectCheckpoint) 
                    else str(checkpoint)
                )

                milestone_objs.append(Milestone(
                    id=int(raw_m.get("id", idx)),
                    title=str(raw_m.get("title", f"Phase {idx}")),
                    description=str(raw_m.get("description", "")),
                    week_number=int(raw_m.get("week_number", idx)),
                    key_topics=key_topics,
                    project_checkpoint=checkpoint,
                    checkpoint_project=checkpoint_desc,
                    estimated_hours=int(raw_m.get("estimated_hours", 25)),
                    subtasks=[str(t) for t in raw_m.get("subtasks", [])],
                    resources=resources,
                    key_skills=key_skills
                ))

            # If model returned no milestones, fall back to dynamic generation
            if not milestone_objs:
                return construct_dynamic_fallback(request, estimated_weeks)

            title_val = str(parsed.get("title") or parsed.get("track_title") or f"{request.student_goal} Career Pathway")
            summary_val = str(parsed.get("summary") or f"Curated curriculum for mastering {request.student_goal}.")
            total_hours = int(parsed.get("total_estimated_hours") or sum(m.estimated_hours for m in milestone_objs))
            weeks_val = int(parsed.get("estimated_weeks") or estimated_weeks)

            return StructuredRoadmap(
                title=title_val,
                track_title=title_val,
                summary=summary_val,
                estimated_weeks=weeks_val,
                total_estimated_hours=total_hours,
                skill_level=str(request.current_skill_level or "Beginner"),
                target_timeline=str(request.target_timeline or "3 months"),
                milestones=milestone_objs
            )

        except (GroqError, json.JSONDecodeError, Exception) as exc:
            print(f"[WARN] Groq LLM roadmap generation encountered error: {exc}. Generating dynamic computed roadmap.")
            return construct_dynamic_fallback(request, estimated_weeks)

    # Dynamic generation based on student inputs
    return construct_dynamic_fallback(request, estimated_weeks)
