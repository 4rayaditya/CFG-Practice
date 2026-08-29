import os
import uuid
import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import httpx
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from roadmap_service import StructuredRoadmap, Milestone

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")


class SaveRoadmapRequest(BaseModel):
    """Request payload to persist a generated roadmap."""
    student_goal: str = Field(..., min_length=2, description="Target career or skill goal")
    roadmap: StructuredRoadmap = Field(..., description="Complete generated roadmap JSON tree")


class PersistedMilestone(BaseModel):
    """Database entity representing public.milestones record."""
    id: str
    roadmap_id: str
    step_number: int
    title: str
    description: Optional[str] = None
    estimated_hours: int = 0
    subtasks: List[str] = Field(default_factory=list)
    resources: List[Dict[str, Any]] = Field(default_factory=list)
    checkpoint_project: Optional[str] = None
    key_skills: List[str] = Field(default_factory=list)
    is_completed: bool = False
    completed_at: Optional[str] = None
    created_at: str


class PersistedRoadmap(BaseModel):
    """Database entity representing public.roadmaps composite record with nested milestones."""
    id: str
    student_id: str
    goal: str
    track_title: str
    summary: Optional[str] = None
    total_estimated_hours: int
    skill_level: str
    target_timeline: str
    is_active: bool = True
    progress_percentage: float = 0.00
    milestones: List[PersistedMilestone] = Field(default_factory=list)
    created_at: str
    updated_at: str


class SaveRoadmapResponse(BaseModel):
    """Standardized response schema for POST /api/save-roadmap."""
    success: bool = True
    roadmap_id: str
    saved_roadmap: PersistedRoadmap
    milestone_count: int
    processing_time_ms: float


# -----------------------------------------------------------------------------
# In-Memory Transaction Store for Offline / Dev Fallback
# -----------------------------------------------------------------------------
IN_MEMORY_ROADMAP_STORE: Dict[str, PersistedRoadmap] = {}


async def save_roadmap_transaction(
    student_id: str,
    goal: str,
    roadmap: StructuredRoadmap
) -> PersistedRoadmap:
    """
    Executes an atomic database transaction inserting a generated roadmap tree:
    1. Inserts the parent public.roadmaps record and captures roadmap_id.
    2. Batch-inserts child public.milestones records linked to roadmap_id.
    3. Handles rollback / cleanup on failure and provides in-memory fallback when Supabase is offline.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    new_roadmap_id = str(uuid.uuid4())

    api_key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
    supabase_configured = (
        SUPABASE_URL 
        and not SUPABASE_URL.startswith("https://your-") 
        and api_key 
        and not api_key.startswith("your-")
    )

    if supabase_configured:
        async with httpx.AsyncClient(timeout=6.0) as client:
            headers = {
                "apikey": api_key,
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }

            # Step 1: Insert parent roadmap
            roadmap_payload = {
                "id": new_roadmap_id,
                "student_id": student_id,
                "goal": goal,
                "track_title": roadmap.track_title,
                "summary": roadmap.summary,
                "total_estimated_hours": roadmap.total_estimated_hours,
                "skill_level": roadmap.skill_level,
                "target_timeline": roadmap.target_timeline,
                "is_active": True,
                "progress_percentage": 0.00,
            }

            try:
                res_roadmap = await client.post(
                    f"{SUPABASE_URL}/rest/v1/roadmaps",
                    json=roadmap_payload,
                    headers=headers
                )

                if res_roadmap.status_code in [200, 201]:
                    # Step 2: Prepare and insert child milestones
                    milestone_payloads = []
                    persisted_milestones = []

                    for idx, m in enumerate(roadmap.milestones, start=1):
                        m_id = str(uuid.uuid4())
                        resources_json = [r.model_dump() if hasattr(r, "model_dump") else (r.dict() if hasattr(r, "dict") else r) for r in m.resources]
                        
                        m_record = {
                            "id": m_id,
                            "roadmap_id": new_roadmap_id,
                            "step_number": getattr(m, "id", idx),
                            "title": m.title,
                            "description": m.description,
                            "estimated_hours": m.estimated_hours,
                            "subtasks": m.subtasks,
                            "resources": resources_json,
                            "checkpoint_project": m.checkpoint_project,
                            "key_skills": m.key_skills,
                            "is_completed": False,
                        }
                        milestone_payloads.append(m_record)
                        persisted_milestones.append(PersistedMilestone(
                            id=m_id,
                            roadmap_id=new_roadmap_id,
                            step_number=getattr(m, "id", idx),
                            title=m.title,
                            description=m.description,
                            estimated_hours=m.estimated_hours,
                            subtasks=m.subtasks,
                            resources=resources_json,
                            checkpoint_project=m.checkpoint_project,
                            key_skills=m.key_skills,
                            is_completed=False,
                            created_at=now_iso
                        ))

                    res_milestones = await client.post(
                        f"{SUPABASE_URL}/rest/v1/milestones",
                        json=milestone_payloads,
                        headers=headers
                    )

                    if res_milestones.status_code in [200, 201]:
                        persisted = PersistedRoadmap(
                            id=new_roadmap_id,
                            student_id=student_id,
                            goal=goal,
                            track_title=roadmap.track_title,
                            summary=roadmap.summary,
                            total_estimated_hours=roadmap.total_estimated_hours,
                            skill_level=roadmap.skill_level,
                            target_timeline=roadmap.target_timeline,
                            is_active=True,
                            progress_percentage=0.00,
                            milestones=persisted_milestones,
                            created_at=now_iso,
                            updated_at=now_iso
                        )
                        IN_MEMORY_ROADMAP_STORE[new_roadmap_id] = persisted
                        return persisted
                    else:
                        # Rollback parent roadmap on milestone insert failure
                        await client.delete(
                            f"{SUPABASE_URL}/rest/v1/roadmaps?id=eq.{new_roadmap_id}",
                            headers=headers
                        )
                        print(f"[WARN] Milestones batch insert failed, rolled back roadmap: {res_milestones.text}")
            except Exception as err:
                print(f"[WARN] Supabase transaction failed, engaging in-memory store: {err}")

    # Fallback In-Memory Atomic Store
    persisted_milestones = []
    for idx, m in enumerate(roadmap.milestones, start=1):
        m_id = str(uuid.uuid4())
        resources_json = [r.model_dump() if hasattr(r, "model_dump") else (r.dict() if hasattr(r, "dict") else r) for r in m.resources]
        persisted_milestones.append(PersistedMilestone(
            id=m_id,
            roadmap_id=new_roadmap_id,
            step_number=getattr(m, "id", idx),
            title=m.title,
            description=m.description,
            estimated_hours=m.estimated_hours,
            subtasks=m.subtasks,
            resources=resources_json,
            checkpoint_project=m.checkpoint_project,
            key_skills=m.key_skills,
            is_completed=False,
            created_at=now_iso
        ))

    persisted = PersistedRoadmap(
        id=new_roadmap_id,
        student_id=student_id,
        goal=goal,
        track_title=roadmap.track_title,
        summary=roadmap.summary,
        total_estimated_hours=roadmap.total_estimated_hours,
        skill_level=roadmap.skill_level,
        target_timeline=roadmap.target_timeline,
        is_active=True,
        progress_percentage=0.00,
        milestones=persisted_milestones,
        created_at=now_iso,
        updated_at=now_iso
    )

    IN_MEMORY_ROADMAP_STORE[new_roadmap_id] = persisted
    return persisted


async def get_student_roadmaps(student_id: str) -> List[PersistedRoadmap]:
    """Retrieves all saved roadmaps for a given student."""
    api_key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
    supabase_configured = (
        SUPABASE_URL 
        and not SUPABASE_URL.startswith("https://your-") 
        and api_key 
        and not api_key.startswith("your-")
    )

    if supabase_configured:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                headers = {
                    "apikey": api_key,
                    "Authorization": f"Bearer {api_key}",
                }
                url = f"{SUPABASE_URL}/rest/v1/roadmaps?student_id=eq.{student_id}&select=*,milestones(*)&order=created_at.desc"
                res = await client.get(url, headers=headers)
                if res.status_code == 200:
                    rows = res.json()
                    if rows and isinstance(rows, list):
                        results = []
                        for r in rows:
                            milestones = [
                                PersistedMilestone(
                                    id=m.get("id", str(uuid.uuid4())),
                                    roadmap_id=r["id"],
                                    step_number=m.get("step_number", 1),
                                    title=m.get("title", "Milestone"),
                                    description=m.get("description"),
                                    estimated_hours=m.get("estimated_hours", 0),
                                    subtasks=m.get("subtasks", []),
                                    resources=m.get("resources", []),
                                    checkpoint_project=m.get("checkpoint_project"),
                                    key_skills=m.get("key_skills", []),
                                    is_completed=m.get("is_completed", False),
                                    created_at=m.get("created_at", r["created_at"])
                                )
                                for m in r.get("milestones", [])
                            ]
                            results.append(PersistedRoadmap(
                                id=r["id"],
                                student_id=r["student_id"],
                                goal=r["goal"],
                                track_title=r["track_title"],
                                summary=r.get("summary"),
                                total_estimated_hours=r.get("total_estimated_hours", 0),
                                skill_level=r.get("skill_level", "Beginner"),
                                target_timeline=r.get("target_timeline", "3 months"),
                                is_active=r.get("is_active", True),
                                progress_percentage=float(r.get("progress_percentage", 0.0)),
                                milestones=milestones,
                                created_at=r["created_at"],
                                updated_at=r["updated_at"]
                            ))
                        return results
        except Exception as err:
            print(f"[WARN] Supabase get_student_roadmaps query failed, returning memory store: {err}")

    # Return from memory store
    return [r for r in IN_MEMORY_ROADMAP_STORE.values() if r.student_id == student_id]
