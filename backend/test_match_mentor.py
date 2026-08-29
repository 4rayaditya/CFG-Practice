import math
import time
import jwt
from fastapi.testclient import TestClient

from main import app
from auth import SUPABASE_JWT_SECRET
from embedding_service import compute_query_embedding, SEED_MENTORS

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
    print("=== Testing POST /api/match-mentor Semantic Search Pipeline ===")

    student_token = generate_test_jwt(role="student")
    auth_headers = {"Authorization": f"Bearer {student_token}"}

    # -------------------------------------------------------------------------
    # Test 1: Unauthenticated request rejection (401)
    # -------------------------------------------------------------------------
    response = client.post(
        "/api/match-mentor",
        json={"title": "How to optimize React hooks?"}
    )
    assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
    print("[PASS] Unauthenticated request correctly rejected with 401 Unauthorized")

    # -------------------------------------------------------------------------
    # Test 2: 384-dimensional embedding validation
    # -------------------------------------------------------------------------
    vec = compute_query_embedding("React state management and useEffect cleanup patterns")
    assert len(vec) == 384, f"Expected 384 dimensions, got {len(vec)}"
    norm = math.sqrt(sum(v * v for v in vec))
    assert abs(norm - 1.0) < 0.01, f"Expected unit norm ~1.0, got {norm}"
    print(f"[PASS] 384-dimensional normalized embedding vector generated successfully (Dimensions: {len(vec)}, Norm: {round(norm, 4)})")

    # -------------------------------------------------------------------------
    # Test 3: Frontend semantic mentor matching
    # -------------------------------------------------------------------------
    fe_payload = {
        "title": "React State Management and useEffect Cleanup",
        "description": "Student is struggling with state synchronization, component re-renders, and cleanup in React.",
        "category": "Frontend",
        "match_count": 3
    }
    response = client.post("/api/match-mentor", json=fe_payload, headers=auth_headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] is True
    assert data["embedding_dimensions"] == 384
    assert len(data["matches"]) > 0
    top_match = data["matches"][0]
    assert "%" in top_match["match_percentage"]
    assert top_match["rating"] > 0
    assert any("react" in tag.lower() or "frontend" in tag.lower() for tag in top_match["expertise_tags"])
    print(f"[PASS] Frontend query matched: Top Mentor='{top_match['full_name']}' ({top_match['match_percentage']}) - Tags: {top_match['expertise_tags']}")

    # -------------------------------------------------------------------------
    # Test 4: Algorithms semantic mentor matching
    # -------------------------------------------------------------------------
    algo_payload = {
        "title": "Dynamic Programming Memoization on Grid Traversal",
        "description": "Getting Time Limit Exceeded on 2D grid pathfinding and struggling with state transitions and recurrence relations.",
        "category": "Algorithms",
        "match_count": 3
    }
    response = client.post("/api/match-mentor", json=algo_payload, headers=auth_headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    top_match = data["matches"][0]
    assert "Marcus Vance" in top_match["full_name"] or any("algorithm" in t.lower() for t in top_match["expertise_tags"])
    print(f"[PASS] Algorithms query matched: Top Mentor='{top_match['full_name']}' ({top_match['match_percentage']})")

    # -------------------------------------------------------------------------
    # Test 5: Backend & PostgreSQL semantic mentor matching
    # -------------------------------------------------------------------------
    be_payload = {
        "title": "FastAPI REST API with Supabase JWT and Database Migrations",
        "description": "How do I secure FastAPI endpoints with local Supabase JWT verification and PostgreSQL connection pools?",
        "category": "Backend",
        "match_count": 3
    }
    response = client.post("/api/match-mentor", json=be_payload, headers=auth_headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    top_match = data["matches"][0]
    assert "Alex Chen" in top_match["full_name"] or any("backend" in t.lower() or "fastapi" in t.lower() for t in top_match["expertise_tags"])
    print(f"[PASS] Backend query matched: Top Mentor='{top_match['full_name']}' ({top_match['match_percentage']})")

    # -------------------------------------------------------------------------
    # Test 6: AI/ML Speech AI semantic mentor matching
    # -------------------------------------------------------------------------
    ai_payload = {
        "title": "Whisper Voice Processing and Groq LLaMA Embeddings",
        "description": "How to run Whisper audio transcription and pgvector cosine similarity search efficiently?",
        "category": "AI/ML",
        "match_count": 2
    }
    response = client.post("/api/match-mentor", json=ai_payload, headers=auth_headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert len(data["matches"]) == 2
    top_match = data["matches"][0]
    assert "Priya Sharma" in top_match["full_name"] or any("ai" in t.lower() or "whisper" in t.lower() for t in top_match["expertise_tags"])
    print(f"[PASS] AI/ML query matched: Top Mentor='{top_match['full_name']}' ({top_match['match_percentage']})")

    print("\n[SUCCESS] All 6 semantic mentor matching test suites passed with 100% success!")


if __name__ == "__main__":
    run_tests()
