import io
import time
import jwt
from fastapi.testclient import TestClient

from main import app
from auth import SUPABASE_JWT_SECRET

client = TestClient(app)


def generate_test_jwt(role: str = "student", user_id: str = "00000000-0000-0000-0000-000000000001") -> str:
    payload = {
        "sub": user_id,
        "email": f"test.{role}@mentormatch.org",
        "aud": "authenticated",
        "role": "authenticated",
        "app_metadata": {"role": role},
        "user_metadata": {"full_name": "Test User"},
        "exp": int(time.time()) + 3600,
        "iat": int(time.time()),
    }
    return jwt.encode(payload, SUPABASE_JWT_SECRET, algorithm="HS256")


def run_tests():
    print("=== Testing POST /api/process-audio Endpoint ===")

    student_token = generate_test_jwt(role="student")
    auth_headers = {"Authorization": f"Bearer {student_token}"}

    # -------------------------------------------------------------------------
    # Test 1: Unauthenticated request rejection (401)
    # -------------------------------------------------------------------------
    fake_audio = io.BytesIO(b"RIFF" + b"\x00" * 200)
    response = client.post(
        "/api/process-audio",
        files={"file": ("recording.wav", fake_audio, "audio/wav")}
    )
    assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
    print("[PASS] Unauthenticated request correctly rejected with 401 Unauthorized")

    # -------------------------------------------------------------------------
    # Test 2: Empty audio file validation (400)
    # -------------------------------------------------------------------------
    empty_audio = io.BytesIO(b"")
    response = client.post(
        "/api/process-audio",
        files={"file": ("recording.webm", empty_audio, "audio/webm")},
        headers=auth_headers
    )
    assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
    assert "empty or corrupted" in response.json()["detail"].lower()
    print("[PASS] Empty audio upload correctly rejected with 400 Bad Request")

    # -------------------------------------------------------------------------
    # Test 3: Truncated / Corrupted audio (< 100 bytes) validation (400)
    # -------------------------------------------------------------------------
    tiny_audio = io.BytesIO(b"RIFF1234")  # 8 bytes
    response = client.post(
        "/api/process-audio",
        files={"file": ("sample.wav", tiny_audio, "audio/wav")},
        headers=auth_headers
    )
    assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
    assert "minimum size" in response.json()["detail"].lower()
    print("[PASS] Truncated audio (<100 bytes) correctly rejected with 400 Bad Request")

    # -------------------------------------------------------------------------
    # Test 4: Unsupported file format validation (400)
    # -------------------------------------------------------------------------
    bad_format_file = io.BytesIO(b"This is just plain text content" * 10)
    response = client.post(
        "/api/process-audio",
        files={"file": ("document.pdf", bad_format_file, "application/pdf")},
        headers=auth_headers
    )
    assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
    assert "unsupported audio format" in response.json()["detail"].lower()
    print("[PASS] Unsupported file format correctly rejected with 400 Bad Request")

    # -------------------------------------------------------------------------
    # Test 5: Valid .webm audio transcription with latency benchmarking
    # -------------------------------------------------------------------------
    valid_webm_data = b"\x1a\x45\xdf\xa3" + (b"\x00\x01\x02\x03" * 200)  # 804 bytes
    valid_webm = io.BytesIO(valid_webm_data)
    response = client.post(
        "/api/process-audio",
        files={"file": ("question.webm", valid_webm, "audio/webm")},
        headers=auth_headers
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()
    assert data["success"] is True
    assert len(data["transcript"]) > 0
    assert data["file_name"] == "question.webm"
    assert data["file_size_bytes"] == len(valid_webm_data)
    assert "webm" in data["audio_format"].lower()
    assert "processing_time_ms" in data
    assert data["processing_time_ms"] >= 0.0
    assert data["user_role"] == "student"
    print(f"[PASS] Valid .webm transcription processed in {data['processing_time_ms']}ms")

    # -------------------------------------------------------------------------
    # Test 6: Valid .wav audio transcription with latency benchmarking
    # -------------------------------------------------------------------------
    valid_wav_data = b"RIFF" + (b"\x11\x22\x33\x44" * 100)
    valid_wav = io.BytesIO(valid_wav_data)
    response = client.post(
        "/api/process-audio",
        files={"file": ("doubt_recording.wav", valid_wav, "audio/wav")},
        headers=auth_headers
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    wav_data = response.json()
    assert wav_data["success"] is True
    assert wav_data["file_name"] == "doubt_recording.wav"
    assert wav_data["processing_time_ms"] >= 0.0
    print(f"[PASS] Valid .wav transcription processed in {wav_data['processing_time_ms']}ms")

    print("\n[SUCCESS] All 6 audio processing test suites passed with 100% success!")


if __name__ == "__main__":
    run_tests()
