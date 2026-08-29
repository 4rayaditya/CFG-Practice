import io
import time
import jwt
from fastapi.testclient import TestClient

from main import app
from auth import SUPABASE_JWT_SECRET
from classifier import VALID_CATEGORIES, classify_transcript

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
    print("=== Testing POST /api/classify-doubt Pipeline ===")

    student_token = generate_test_jwt(role="student")
    auth_headers = {"Authorization": f"Bearer {student_token}"}

    # -------------------------------------------------------------------------
    # Test 1: Unauthenticated request rejection (401)
    # -------------------------------------------------------------------------
    response = client.post(
        "/api/classify-doubt",
        json={"transcript": "How do I write React hooks?"}
    )
    assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
    print("[PASS] Unauthenticated request correctly rejected with 401 Unauthorized")

    # -------------------------------------------------------------------------
    # Test 2: Empty transcript validation (422/400)
    # -------------------------------------------------------------------------
    response = client.post(
        "/api/classify-doubt",
        json={"transcript": ""},
        headers=auth_headers
    )
    assert response.status_code in [400, 422], f"Expected 400 or 422, got {response.status_code}: {response.text}"
    print("[PASS] Empty transcript correctly rejected by validation schema")

    # -------------------------------------------------------------------------
    # Test 3: Frontend doubt classification
    # -------------------------------------------------------------------------
    fe_query = "I am building a responsive React dashboard with TypeScript and need advice on architecting role-based routing and audio streaming."
    response = client.post(
        "/api/classify-doubt",
        json={"transcript": fe_query},
        headers=auth_headers
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] is True
    doubt = data["structured_doubt"]
    assert doubt["category"] in VALID_CATEGORIES
    assert doubt["category"] == "Frontend"
    assert len(doubt["title"]) > 0
    assert len(doubt["tags"]) > 0
    assert doubt["urgency"] in ["Standard", "Urgent"]
    assert data["processing_time_ms"] >= 0.0
    print(f"[PASS] Frontend query classified: Category={doubt['category']}, Title='{doubt['title']}', Tags={doubt['tags']}")

    # -------------------------------------------------------------------------
    # Test 4: Algorithms doubt classification
    # -------------------------------------------------------------------------
    algo_query = "I am practicing algorithmic problem solving and getting confused with dynamic programming memoization in grid traversal."
    response = client.post(
        "/api/classify-doubt",
        json={"transcript": algo_query},
        headers=auth_headers
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    doubt = data["structured_doubt"]
    assert doubt["category"] == "Algorithms"
    print(f"[PASS] Algorithms query classified: Category={doubt['category']}, Tags={doubt['tags']}")

    # -------------------------------------------------------------------------
    # Test 5: Urgent emergency classification
    # -------------------------------------------------------------------------
    urgent_query = "Our production server is crashing with database connection timeouts and this is an urgent emergency blocking our launch!"
    response = client.post(
        "/api/classify-doubt",
        json={"transcript": urgent_query},
        headers=auth_headers
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    doubt = data["structured_doubt"]
    assert doubt["urgency"] == "Urgent"
    assert doubt["category"] == "Backend"
    print(f"[PASS] Urgent query classified: Urgency={doubt['urgency']}, Category={doubt['category']}")

    # -------------------------------------------------------------------------
    # Test 6: AI/ML classification
    # -------------------------------------------------------------------------
    ai_query = "How do I calculate cosine similarity over pgvector embeddings for semantic mentor matching?"
    doubt_direct = classify_transcript(ai_query)
    assert doubt_direct.category in ["AI/ML", "Backend"]
    print(f"[PASS] AI/ML vector search doubt classified: Category={doubt_direct.category}")

    # -------------------------------------------------------------------------
    # Test 7: Audio Intake + Auto-Classification End-to-End Pipeline
    # -------------------------------------------------------------------------
    valid_webm = io.BytesIO(b"\x1a\x45\xdf\xa3" + (b"\x00\x01\x02\x03" * 200))
    audio_res = client.post(
        "/api/process-audio",
        files={"file": ("voice_intake.webm", valid_webm, "audio/webm")},
        headers=auth_headers
    )
    assert audio_res.status_code == 200, f"Expected 200, got {audio_res.status_code}: {audio_res.text}"
    audio_data = audio_res.json()
    assert audio_data["success"] is True
    assert "structured_doubt" in audio_data and audio_data["structured_doubt"] is not None
    assert audio_data["structured_doubt"]["category"] in VALID_CATEGORIES
    print(f"[PASS] Audio intake automatically classified doubt: Title='{audio_data['structured_doubt']['title']}', Category={audio_data['structured_doubt']['category']}")

    print("\n[SUCCESS] All 7 doubt classification and pipeline test suites passed with 100% success!")


if __name__ == "__main__":
    run_tests()
