import unittest
import io
from fastapi.testclient import TestClient
from main import app
from auth import SUPABASE_JWT_SECRET
import jwt

class TestRateLimitingAndFaultTolerance(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.token = jwt.encode(
            {"sub": "test-user-123", "email": "test@example.com", "role": "student"},
            SUPABASE_JWT_SECRET,
            algorithm="HS256"
        )
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_process_audio_rate_limiting(self):
        """Test that exceeding 5 requests/min triggers HTTP 429 Too Many Requests."""
        valid_audio = io.BytesIO(b"RIFF" + b"\x00" * 200)
        
        responses = []
        for i in range(7):
            valid_audio.seek(0)
            res = self.client.post(
                "/api/process-audio",
                files={"file": ("test.wav", valid_audio, "audio/wav")},
                headers=self.headers,
            )
            responses.append(res.status_code)

        print("Request status codes:", responses)
        # First 5 should succeed (200), subsequent should be 429
        self.assertIn(429, responses, "Expected HTTP 429 when exceeding 5 requests/minute rate limit")

if __name__ == "__main__":
    unittest.main()
