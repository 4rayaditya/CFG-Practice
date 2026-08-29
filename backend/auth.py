import os
from typing import Optional, List, Dict, Any
import jwt
import httpx
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Supabase JWT Secret configured in Supabase Project Settings -> API -> JWT Settings (Min 32 bytes recommended)
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "super-secret-supabase-jwt-key-for-development-32-chars-min").strip().strip('"').strip("'")
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip().rstrip("/").strip('"').strip("'")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "").strip().strip('"').strip("'")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip().strip('"').strip("'")

# HTTPBearer scheme to extract Authorization: Bearer <token>
security = HTTPBearer(auto_error=False)


class AuthenticatedUser(BaseModel):
    """Represents a validated Supabase user extracted locally from the verified JWT."""
    id: str
    email: Optional[str] = None
    role: str = "student"
    aud: Optional[str] = None
    app_metadata: Dict[str, Any] = {}
    user_metadata: Dict[str, Any] = {}


def verify_supabase_jwt(token: str) -> AuthenticatedUser:
    """
    Verifies a Supabase JWT:
    1. Attempts local symmetric verification (HS256) using project SUPABASE_JWT_SECRET.
    2. Gracefully falls back to Supabase Auth API (GET /auth/v1/user) for asymmetric (RS256/ES256) tokens.
    3. Rejects invalid or tampered tokens with HTTP 401.
    """
    # Method 1: Local HS256 symmetric decoding
    if SUPABASE_JWT_SECRET and len(SUPABASE_JWT_SECRET) >= 8:
        try:
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_aud": False,
                }
            )

            user_id = payload.get("sub")
            if user_id:
                app_metadata = payload.get("app_metadata", {})
                user_metadata = payload.get("user_metadata", {})
                user_role = (
                    app_metadata.get("role") 
                    or user_metadata.get("role") 
                    or payload.get("role") 
                    or "student"
                )
                return AuthenticatedUser(
                    id=str(user_id),
                    email=payload.get("email"),
                    role=str(user_role),
                    aud=payload.get("aud"),
                    app_metadata=app_metadata,
                    user_metadata=user_metadata,
                )
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired. Please refresh your session.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        except (jwt.InvalidSignatureError, jwt.DecodeError, Exception) as local_err:
            # Continue to Supabase Auth API fallback only if online URL is configured
            last_error = str(local_err)
    else:
        last_error = "SUPABASE_JWT_SECRET is not configured"

    # Method 2: Supabase Auth API verification (handles RS256/ES256/HS256 natively)
    api_key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
    if SUPABASE_URL and not SUPABASE_URL.startswith("https://your-") and api_key and not api_key.startswith("your-"):
        try:
            with httpx.Client(timeout=4.0) as client:
                resp = client.get(
                    f"{SUPABASE_URL}/auth/v1/user",
                    headers={
                        "apikey": api_key,
                        "Authorization": f"Bearer {token}",
                    }
                )
                if resp.status_code == 200:
                    user_data = resp.json()
                    app_meta = user_data.get("app_metadata", {})
                    user_meta = user_data.get("user_metadata", {})
                    user_role = app_meta.get("role") or user_meta.get("role") or "student"
                    return AuthenticatedUser(
                        id=str(user_data.get("id")),
                        email=user_data.get("email"),
                        role=str(user_role),
                        aud=user_data.get("aud"),
                        app_metadata=app_meta,
                        user_metadata=user_meta,
                    )
        except Exception as net_err:
            print(f"[WARN] Supabase Auth API token check error: {net_err}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication token: signature verification failed.",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security)
) -> AuthenticatedUser:
    """
    FastAPI dependency that extracts and validates the Bearer token from the Authorization header.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid format. Expected 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return verify_supabase_jwt(credentials.credentials)


def require_role(allowed_roles: List[str]):
    """
    Role-Based Access Control (RBAC) dependency factory.
    Example: Depends(require_role(["mentor", "admin"]))
    """
    async def role_checker(
        current_user: AuthenticatedUser = Depends(get_current_user)
    ) -> AuthenticatedUser:
        if current_user.role not in allowed_roles and "admin" not in allowed_roles and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Forbidden: Access requires one of the following roles: {allowed_roles}. Your role is '{current_user.role}'.",
            )
        return current_user

    return role_checker
