import io
import os
import time
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from groq import Groq, GroqError

from auth import get_current_user, require_role, AuthenticatedUser
from classifier import (
    ClassifyDoubtRequest,
    StructuredDoubt,
    ClassifyDoubtResponse,
    classify_transcript
)

load_dotenv()

# Allowed audio formats for Whisper speech-to-text intake
ALLOWED_AUDIO_EXTENSIONS = {".webm", ".wav", ".mp3", ".m4a", ".ogg", ".mp4", ".flac"}
ALLOWED_CONTENT_TYPES = {
    "audio/webm",
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/mpeg",
    "audio/mp3",
    "audio/m4a",
    "audio/ogg",
    "audio/x-m4a",
    "video/webm",
    "audio/mp4",
    "application/octet-stream",
}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25MB (Whisper audio file limit)
MIN_FILE_SIZE_BYTES = 100  # Minimum size to reject empty/corrupted uploads


class AudioProcessingResponse(BaseModel):
    """Structured JSON response returned upon successful audio transcription."""
    success: bool = True
    transcript: str
    structured_doubt: Optional[StructuredDoubt] = None
    file_name: str
    file_size_bytes: int
    audio_format: str
    duration_seconds: Optional[float] = None
    processing_time_ms: float
    user_id: str
    user_role: str


app = FastAPI(
    title="MentorMatch AI API",
    description="Backend API with local Supabase JWT verification, Groq Whisper (whisper-large-v3) speech transcription, Groq Llama 3 doubt classification, and Role-Based Access Control",
    version="1.0.0"
)

# CORS Configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    frontend_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
    groq_configured = bool(os.getenv("GROQ_API_KEY") and not os.getenv("GROQ_API_KEY").startswith("gsk_your"))
    return {
        "status": "healthy",
        "service": "MentorMatch AI Backend",
        "version": "1.0.0",
        "cors_origins": origins,
        "auth_middleware": "Local Supabase JWT (HS256)",
        "groq_whisper_configured": groq_configured,
        "groq_llama_classifier_configured": groq_configured
    }


# -----------------------------------------------------------------------------
# Person 2: Voice-to-Text AI Audio Processing Endpoint (CUJ 1 - Groq Whisper)
# -----------------------------------------------------------------------------

@app.post("/api/process-audio", response_model=AudioProcessingResponse)
async def process_audio(
    file: UploadFile = File(..., description="Multipart audio recording file (.webm, .wav, .mp3, .m4a)"),
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Accepts multipart audio uploads, validates file integrity, authenticates via Supabase JWT,
    and passes the audio buffer to the free Groq API (whisper-large-v3) for speech transcription.
    Automatically classifies the transcript into a structured doubt payload.
    """
    start_time = time.perf_counter()

    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No audio file provided in request.",
        )

    # 1. Validate File Extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_AUDIO_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported audio format '{file_ext}'. Allowed formats: {', '.join(sorted(ALLOWED_AUDIO_EXTENSIONS))}",
        )

    # 2. Read and Validate Audio Buffer Size
    try:
        audio_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read audio file: {str(exc)}",
        )

    file_size = len(audio_bytes)

    if file_size < MIN_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded audio file is empty or corrupted ({file_size} bytes). Minimum size is {MIN_FILE_SIZE_BYTES} bytes.",
        )

    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Audio file exceeds maximum size limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB.",
        )

    # 3. Transcribe with Groq API (whisper-large-v3)
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    transcript_text = ""

    if groq_key and not groq_key.startswith("gsk_your"):
        try:
            client = Groq(api_key=groq_key)
            transcription = client.audio.transcriptions.create(
                file=(file.filename or f"audio{file_ext}", audio_bytes),
                model="whisper-large-v3",
                response_format="json"
            )
            transcript_text = getattr(transcription, "text", str(transcription)).strip()
        except GroqError as groq_err:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Groq Whisper API error: {str(groq_err)}",
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Audio transcription service failed: {str(exc)}",
            )
    else:
        # Development / Offline Fallback Simulation
        transcript_text = (
            "I am practicing algorithmic problem solving and getting confused with "
            "dynamic programming memoization and state transitions in grid traversal."
        )

    # 4. Extract Structured Doubt via Classifier Pipeline
    structured_doubt = classify_transcript(transcript_text)
    processing_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return AudioProcessingResponse(
        success=True,
        transcript=transcript_text,
        structured_doubt=structured_doubt,
        file_name=file.filename,
        file_size_bytes=file_size,
        audio_format=file.content_type or f"audio/{file_ext.lstrip('.')}",
        processing_time_ms=processing_time_ms,
        user_id=current_user.id,
        user_role=current_user.role,
    )


# -----------------------------------------------------------------------------
# Person 2: Doubt Classification Pipeline (CUJ 1 & CUJ 2 - Groq Llama 3)
# -----------------------------------------------------------------------------

@app.post("/api/classify-doubt", response_model=ClassifyDoubtResponse)
def classify_doubt_endpoint(
    payload: ClassifyDoubtRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
):
    """
    Accepts raw speech-to-text transcript text, passes it to Groq Llama 3 with JSON mode,
    and returns a structured doubt object (title, description, category, tags, urgency).
    """
    start_time = time.perf_counter()

    if not payload.transcript or not payload.transcript.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcript text cannot be empty.",
        )

    structured_doubt = classify_transcript(payload.transcript)
    processing_time_ms = round((time.perf_counter() - start_time) * 1000, 2)

    return ClassifyDoubtResponse(
        success=True,
        raw_transcript=payload.transcript,
        structured_doubt=structured_doubt,
        processing_time_ms=processing_time_ms,
    )


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
