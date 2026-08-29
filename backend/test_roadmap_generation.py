import time
import jwt
from fastapi.testclient import TestClient

from main import app
from auth import SUPABASE_JWT_SECRET
from roadmap_service import GenerateRoadmapRequest, generate_career_roadmap

client = TestClient(app)


def generate_test_jwt(role: str = "student", user_id: str = "00000000-0000-0000-0000-000000000001") -> str:
    payload = {
        "sub": user_id,
        "email": f"test.{role}@mentormatch.org",
        "aud": "authenticated",
        "role": "authenticated",
        "app_metadata": {"role": role},
        "user_metadata": {"full_name": "Student Tester"},
        "exp": int(time.time()) + 3600,
        "iat": int(time.time()),
    }
    return jwt.encode(payload, SUPABASE_JWT_SECRET, algorithm="HS256")


def run_tests():
    print("=== Testing POST /api/generate-roadmap Endpoint ===")

    student_token = generate_test_jwt(role="student")
    auth_headers = {"Authorization": f"Bearer {student_token}"}

    # -------------------------------------------------------------------------
    # Test 1: Unauthenticated request rejection (401)
    # -------------------------------------------------------------------------
    response = client.post(
        "/api/generate-roadmap",
        json={"student_goal": "Full-Stack AI Engineer"}
    )
    assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
    print("[PASS] Unauthenticated request correctly rejected with 401 Unauthorized")

    # -------------------------------------------------------------------------
    # Test 2: Empty student_goal validation (400/422)
    # -------------------------------------------------------------------------
    response = client.post(
        "/api/generate-roadmap",
        json={"student_goal": ""},
        headers=auth_headers
    )
    assert response.status_code in [400, 422], f"Expected 400 or 422, got {response.status_code}: {response.text}"
    print("[PASS] Empty student_goal correctly rejected by validation schema")

    # -------------------------------------------------------------------------
    # Test 3: AI & Machine Learning Track Generation
    # -------------------------------------------------------------------------
    ai_payload = {
        "student_goal": "AI & Machine Learning Engineer",
        "current_skill_level": "Intermediate",
        "target_timeline": "3 months",
        "focus_areas": ["Whisper", "Vector Search", "LLMs"]
    }
    response = client.post("/api/generate-roadmap", json=ai_payload, headers=auth_headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] is True
    assert "AI" in data["roadmap"]["track_title"] or "Machine Learning" in data["roadmap"]["track_title"]
    assert len(data["roadmap"]["milestones"]) >= 3
    assert data["roadmap"]["total_estimated_hours"] > 0
    assert data["processing_time_ms"] >= 0.0

    first_m = data["roadmap"]["milestones"][0]
    assert len(first_m["subtasks"]) >= 2
    assert len(first_m["resources"]) >= 1
    assert len(first_m["checkpoint_project"]) > 0
    assert len(first_m["key_skills"]) >= 2
    print(f"[PASS] AI/ML Roadmap generated: '{data['roadmap']['track_title']}' ({data['roadmap']['total_estimated_hours']} hrs, {len(data['roadmap']['milestones'])} phases)")

    # -------------------------------------------------------------------------
    # Test 4: Algorithms & FAANG Interview Prep Track
    # -------------------------------------------------------------------------
    algo_payload = {
        "student_goal": "Pass FAANG Coding Interviews & LeetCode DP",
        "current_skill_level": "Beginner",
        "target_timeline": "6 weeks"
    }
    response = client.post("/api/generate-roadmap", json=algo_payload, headers=auth_headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert len(data["roadmap"]["milestones"]) >= 3
    print(f"[PASS] Algorithms Roadmap generated: '{data['roadmap']['track_title']}' ({len(data['roadmap']['milestones'])} phases)")

    # -------------------------------------------------------------------------
    # Test 5: Full-Stack Web & AI Development Track
    # -------------------------------------------------------------------------
    fs_payload = {
        "student_goal": "Full-Stack Web & AI Developer",
        "current_skill_level": "Intermediate",
        "target_timeline": "12 weeks",
        "focus_areas": ["React 19", "FastAPI", "Supabase"]
    }
    response = client.post("/api/generate-roadmap", json=fs_payload, headers=auth_headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["roadmap"]["target_timeline"] == "12 weeks"
    print(f"[PASS] Full-Stack Roadmap generated: '{data['roadmap']['track_title']}' (Timeline: {data['roadmap']['target_timeline']})")

    # -------------------------------------------------------------------------
    # Test 6: Alias Endpoint /api/roadmap verification
    # -------------------------------------------------------------------------
    alias_res = client.post("/api/roadmap", json=fs_payload, headers=auth_headers)
    assert alias_res.status_code == 200, f"Expected 200 on /api/roadmap, got {alias_res.status_code}: {alias_res.text}"
    alias_data = alias_res.json()
    assert alias_data["success"] is True
    print("[PASS] Alias endpoint /api/roadmap verified successfully")

    print("\n[SUCCESS] All 6 career roadmap generation test suites passed with 100% success!")


if __name__ == "__main__":
    run_tests()
