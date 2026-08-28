import time
import jwt
from fastapi import HTTPException
from auth import verify_supabase_jwt, SUPABASE_JWT_SECRET, AuthenticatedUser

def run_tests():
    print("=== Testing Supabase Local JWT Verification ===")

    # 1. Test Valid Student Token
    valid_payload = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "email": "alex.student@mentormatch.org",
        "aud": "authenticated",
        "role": "authenticated",
        "app_metadata": {"role": "student"},
        "user_metadata": {"full_name": "Alex Chen"},
        "exp": int(time.time()) + 3600,
        "iat": int(time.time()),
    }
    token = jwt.encode(valid_payload, SUPABASE_JWT_SECRET, algorithm="HS256")
    user = verify_supabase_jwt(token)
    assert user.id == valid_payload["sub"]
    assert user.email == valid_payload["email"]
    assert user.role == "student"
    print("[PASS] Valid student JWT decoded successfully")

    # 2. Test Valid Mentor Token
    mentor_payload = {
        "sub": "00000000-0000-0000-0000-000000000002",
        "email": "sarah.mentor@mentormatch.org",
        "aud": "authenticated",
        "role": "authenticated",
        "app_metadata": {"role": "mentor"},
        "user_metadata": {"full_name": "Dr. Sarah Jenkins"},
        "exp": int(time.time()) + 3600,
    }
    mentor_token = jwt.encode(mentor_payload, SUPABASE_JWT_SECRET, algorithm="HS256")
    mentor_user = verify_supabase_jwt(mentor_token)
    assert mentor_user.role == "mentor"
    print("[PASS] Valid mentor JWT decoded successfully")

    # 3. Test Expired Token
    expired_payload = {
        "sub": "00000000-0000-0000-0000-000000000003",
        "email": "expired@mentormatch.org",
        "exp": int(time.time()) - 3600,
    }
    expired_token = jwt.encode(expired_payload, SUPABASE_JWT_SECRET, algorithm="HS256")
    try:
        verify_supabase_jwt(expired_token)
        assert False, "Should have raised 401 for expired token"
    except HTTPException as e:
        assert e.status_code == 401
        assert "expired" in e.detail.lower()
        print("[PASS] Expired JWT correctly rejected with 401")

    # 4. Test Invalid Secret / Tampered Signature
    tampered_token = jwt.encode(valid_payload, "wrong-secret-key-that-is-at-least-32-chars-long", algorithm="HS256")
    try:
        verify_supabase_jwt(tampered_token)
        assert False, "Should have raised 401 for invalid signature"
    except HTTPException as e:
        assert e.status_code == 401
        assert "invalid" in e.detail.lower()
        print("[PASS] Tampered signature correctly rejected with 401")

    print("\n[SUCCESS] All auth verification tests passed with 100% success!")

if __name__ == "__main__":
    run_tests()
