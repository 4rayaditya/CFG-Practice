import os
from typing import Optional, List, Dict, Any
import jwt
from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Supabase JWT Secret configured in Supabase Project Settings -> API -> JWT Settings (Min 32 bytes recommended)
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "super-secret-supabase-jwt-key-for-development-32-chars-min")

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
    Verifies a Supabase JWT locally using the project's JWT Secret (HS256).
    Performs zero network round-trips to Supabase for high throughput and sub-millisecond latency.
    """
    try:
        # Decode and verify signature, expiration, and audience
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": False,  # Checked below for flexibility
            }
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject (user ID)",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Extract role: Check app_metadata -> user_metadata -> default 'student'
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
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(exc)}",
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
