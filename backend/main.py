import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from auth import get_current_user, require_role, AuthenticatedUser

load_dotenv()

app = FastAPI(
    title="MentorMatch AI API",
    description="Backend API with local Supabase JWT verification and Role-Based Access Control",
    version="1.0.0"
)

# CORS Configuration
frontend_url = os.getenv("FRONTEND_URL", "https://cfg-practice.vercel.app")
origins = [
    frontend_url,
    "https://cfg-practice.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "MentorMatch AI API is running",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MentorMatch AI Backend",
        "version": "1.0.0",
        "cors_origins": origins,
        "auth_middleware": "Local Supabase JWT (HS256)"
    }


# -----------------------------------------------------------------------------
# Protected Route Examples (Person 1 Authentication Flow)
# -----------------------------------------------------------------------------

@app.get("/api/auth/me", response_model=AuthenticatedUser)
def get_my_profile(current_user: AuthenticatedUser = Depends(get_current_user)):
    """
    Returns the authenticated user details decoded locally from the Supabase JWT.
    """
    return current_user


@app.get("/api/student/dashboard")
def student_dashboard(current_user: AuthenticatedUser = Depends(require_role(["student", "admin"]))):
    """
    Student-only endpoint (also accessible by admin).
    """
    return {
        "message": f"Welcome to Student Dashboard, {current_user.email}",
        "user_id": current_user.id,
        "role": current_user.role,
    }


@app.get("/api/mentor/doubt-board")
def mentor_doubt_board(current_user: AuthenticatedUser = Depends(require_role(["mentor", "admin"]))):
    """
    Mentor-only endpoint (also accessible by admin).
    """
    return {
        "message": f"Welcome to Volunteer Mentor Hub, {current_user.email}",
        "user_id": current_user.id,
        "role": current_user.role,
    }


@app.get("/api/admin/metrics")
def admin_metrics(current_user: AuthenticatedUser = Depends(require_role(["admin"]))):
    """
    Admin-only endpoint.
    """
    return {
        "message": "Program Director Telemetry & Health",
        "user_id": current_user.id,
        "role": current_user.role,
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
