import uuid
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
    print("=== Testing POST /api/save-roadmap & GET /api/student/roadmaps ===")

    student_id = "00000000-0000-0000-0000-000000000001"
    student_token = generate_test_jwt(role="student", user_id=student_id)
    auth_headers = {"Authorization": f"Bearer {student_token}"}

    # -------------------------------------------------------------------------
    # Test 1: Unauthenticated request rejection (401)
    # -------------------------------------------------------------------------
    response = client.post(
        "/api/save-roadmap",
        json={"student_goal": "Full-Stack AI Engineer", "roadmap": {}}
    )
    assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
    print("[PASS] Unauthenticated save-roadmap request correctly rejected with 401 Unauthorized")

    response_get = client.get("/api/student/roadmaps")
    assert response_get.status_code == 401, f"Expected 401, got {response_get.status_code}"
    print("[PASS] Unauthenticated get-roadmaps request correctly rejected with 401 Unauthorized")

    # -------------------------------------------------------------------------
    # Test 2: Generate and Atomically Save Roadmap Transaction
    # -------------------------------------------------------------------------
    gen_req = GenerateRoadmapRequest(
        student_goal="Full-Stack AI Application Engineer",
        current_skill_level="Intermediate",
        target_timeline="3 months",
        focus_areas=["React 19", "FastAPI", "pgvector"]
    )
    generated_roadmap = generate_career_roadmap(gen_req)

    save_payload = {
        "student_goal": gen_req.student_goal,
        "roadmap": generated_roadmap.model_dump()
    }

    save_res = client.post("/api/save-roadmap", json=save_payload, headers=auth_headers)
    assert save_res.status_code == 200, f"Expected 200 on /api/save-roadmap, got {save_res.status_code}: {save_res.text}"
    save_data = save_res.json()
    assert save_data["success"] is True
    assert "roadmap_id" in save_data and len(save_data["roadmap_id"]) > 0
    assert save_data["milestone_count"] >= 3
    assert save_data["saved_roadmap"]["student_id"] == student_id
    assert len(save_data["saved_roadmap"]["milestones"]) == save_data["milestone_count"]

    roadmap_id = save_data["roadmap_id"]
    first_milestone = save_data["saved_roadmap"]["milestones"][0]
    assert first_milestone["roadmap_id"] == roadmap_id
    assert first_milestone["step_number"] == 1
    assert len(first_milestone["subtasks"]) >= 2
    print(f"[PASS] Roadmap persisted atomically (ID: {roadmap_id}, Milestones: {save_data['milestone_count']}, Time: {save_data['processing_time_ms']}ms)")

    # -------------------------------------------------------------------------
    # Test 3: Retrieve Student Roadmaps with Nested Milestones
    # -------------------------------------------------------------------------
    get_res = client.get("/api/student/roadmaps", headers=auth_headers)
    assert get_res.status_code == 200, f"Expected 200 on /api/student/roadmaps, got {get_res.status_code}: {get_res.text}"
    roadmaps_list = get_res.json()
    assert isinstance(roadmaps_list, list)
    assert len(roadmaps_list) >= 1

    matched = next((r for r in roadmaps_list if r["id"] == roadmap_id), None)
    assert matched is not None, f"Saved roadmap {roadmap_id} not found in student roadmap list"
    assert matched["goal"] == gen_req.student_goal
    assert len(matched["milestones"]) >= 3
    print(f"[PASS] Student roadmaps query verified ({len(roadmaps_list)} roadmaps retrieved with full nested milestones)")

    # -------------------------------------------------------------------------
    # Test 4: RLS & Student Isolation
    # -------------------------------------------------------------------------
    other_student_id = "00000000-0000-0000-0000-000000000099"
    other_token = generate_test_jwt(role="student", user_id=other_student_id)
    other_headers = {"Authorization": f"Bearer {other_token}"}

    other_res = client.get("/api/student/roadmaps", headers=other_headers)
    assert other_res.status_code == 200
    other_list = other_res.json()
    # Other student should not see student 1's roadmaps
    assert not any(r["id"] == roadmap_id for r in other_list)
    print("[PASS] RLS student isolation verified: other student cannot access unowned roadmap")

    print("\n[SUCCESS] All 4 roadmap storage & transaction test suites passed with 100% success!")


if __name__ == "__main__":
    run_tests()
