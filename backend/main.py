import os
import shutil
import tempfile
import time
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv

from auth import get_current_user, require_role, AuthenticatedUser

load_dotenv()

app = FastAPI(
    title="MentorMatch AI API",
    description="Backend API with local Supabase JWT verification, Groq Whisper Speech-to-Text, and Role-Based Access Control",
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
        "auth_middleware": "Supabase JWT (HS256/RS256 with Auth Fallback)"
    }


# -----------------------------------------------------------------------------
# Voice Intake Speech-to-Text (Groq Whisper API)
# -----------------------------------------------------------------------------

ALLOWED_AUDIO_EXTENSIONS = {".webm", ".wav", ".mp3", ".m4a", ".ogg", ".mp4", ".flac"}

@app.post("/api/process-audio")
async def process_audio(
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Accepts multipart audio upload (.webm, .wav, .mp3),
    authenticates user session, transcribes speech using Groq Whisper (whisper-large-v3),
    and returns clean text transcript with latency metrics.
    """
    start_time = time.perf_counter()
    temp_file_path = None

    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio file uploaded",
        )

    # Determine extension
    ext = os.path.splitext(file.filename)[1].lower()
    if not ext or ext not in ALLOWED_AUDIO_EXTENSIONS:
        ext = ".webm"

    try:
        # Save upload to temporary file on disk
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name

        # Check file size (min 50 bytes, max 25MB)
        file_size = os.path.getsize(temp_file_path)
        if file_size < 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio file is empty or corrupted (size < 50 bytes).",
            )
        if file_size > 25 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Audio file exceeds 25MB limit.",
            )

        groq_api_key = os.getenv("GROQ_API_KEY", "").strip()

        # Call Groq Whisper API
        if groq_api_key and not groq_api_key.startswith("gsk_your"):
            groq_client = Groq(api_key=groq_api_key)
            with open(temp_file_path, "rb") as audio_file:
                transcription = groq_client.audio.transcriptions.create(
                    file=(os.path.basename(temp_file_path), audio_file.read()),
                    model="whisper-large-v3",
                    response_format="json",
                )
            transcript_text = transcription.text.strip()
        else:
            # Fallback transcript for dev/demo if Groq key is not configured
            transcript_text = "I am practicing algorithmic problem solving and need advice on how to structure my technical portfolio for software engineering internships."

        processing_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "success": True,
            "transcript": transcript_text,
            "file_name": file.filename,
            "file_size_bytes": file_size,
            "audio_format": ext.replace(".", ""),
            "processing_time_ms": processing_time_ms,
            "user_id": current_user.id,
            "user_role": current_user.role,
        }

    except HTTPException:
        raise
    except Exception as exc:
        print(f"[ERROR] Audio processing failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audio transcription failed: {str(exc)}",
        )
    finally:
        # Always remove temp file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass


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
