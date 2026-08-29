import os
import json
import re
import time
from typing import List, Optional
from pydantic import BaseModel, Field
from groq import Groq, GroqError

VALID_CATEGORIES = [
    "Frontend",
    "Backend",
    "AI/ML",
    "System Design",
    "Algorithms",
    "Career & Projects",
    "General"
]


class ClassifyDoubtRequest(BaseModel):
    """Input payload containing raw voice transcript text."""
    transcript: str = Field(
        ...,
        min_length=3,
        max_length=10000,
        description="Raw voice transcript to classify and structure",
        examples=["I am confused about how to structure state management and useEffect cleanup in React."]
    )


class StructuredDoubt(BaseModel):
    """Structured doubt conforming to the MentorMatch public.doubts schema."""
    title: str = Field(..., description="Concise summary headline (5-10 words)")
    description: str = Field(..., description="Clear explanation of the technical question or roadblock")
    category: str = Field(default="General", description="Classified technical category")
    tags: List[str] = Field(default_factory=list, description="Array of keyword tags")
    urgency: str = Field(default="Standard", description="Urgency rating: Standard or Urgent")


class ClassifyDoubtResponse(BaseModel):
    """Standardized API response for POST /api/classify-doubt."""
    success: bool = True
    raw_transcript: str
    structured_doubt: StructuredDoubt
    processing_time_ms: float


def normalize_category(category_str: str) -> str:
    """Normalizes any LLM category response to our strict category taxonomy."""
    cat_lower = (category_str or "").lower().strip()
    if any(k in cat_lower for k in ["front", "react", "css", "html", "vue", "angular", "ui", "web"]):
        return "Frontend"
    if any(k in cat_lower for k in ["back", "fastapi", "express", "node", "django", "flask", "database", "sql", "postgres", "auth", "jwt"]):
        return "Backend"
    if any(k in cat_lower for k in ["ai", "ml", "machine learning", "nlp", "whisper", "vector", "embedding", "llm", "deep learning"]):
        return "AI/ML"
    if any(k in cat_lower for k in ["system", "architecture", "scale", "microservice", "distributed", "load balancer"]):
        return "System Design"
    if any(k in cat_lower for k in ["algo", "data structure", "dp", "dynamic programming", "tree", "graph", "binary", "leetcode", "sorting"]):
        return "Algorithms"
    if any(k in cat_lower for k in ["career", "resume", "intern", "interview", "job", "portfolio", "roadmap", "hiring"]):
        return "Career & Projects"
    
    # Direct match check
    for valid in VALID_CATEGORIES:
        if valid.lower() in cat_lower:
            return valid
    return "General"


def normalize_urgency(urgency_str: str, transcript: str) -> str:
    """Evaluates urgency against strict 'Standard' or 'Urgent' schema."""
    combined = f"{urgency_str} {transcript}".lower()
    if any(k in combined for k in ["urgent", "asap", "emergency", "broken in production", "deadline today", "critical", "blocking"]):
        return "Urgent"
    return "Standard"


def fallback_rule_based_classifier(transcript: str) -> StructuredDoubt:
    """
    Resilient offline rule-based heuristic classification when Groq API key is unconfigured.
    """
    text_lower = transcript.lower()
    
    # 1. Determine Category
    category = "General"
    tags = []
    
    if any(k in text_lower for k in ["react", "frontend", "css", "tailwind", "ui", "component", "state", "useeffect", "vite", "html", "javascript", "typescript"]):
        category = "Frontend"
        tags.extend(["frontend", "react", "ui-development"])
    elif any(k in text_lower for k in ["database", "sql", "postgres", "backend", "fastapi", "api", "auth", "jwt", "server", "endpoint", "supabase"]):
        category = "Backend"
        tags.extend(["backend", "database", "api-architecture"])
    elif any(k in text_lower for k in ["algorithm", "memoization", "dp", "dynamic programming", "graph", "tree", "binary search", "recursion", "time complexity"]):
        category = "Algorithms"
        tags.extend(["algorithms", "data-structures", "problem-solving"])
    elif any(k in text_lower for k in ["whisper", "groq", "ai", "machine learning", "embedding", "vector", "openai", "llama", "model", "pgvector"]):
        category = "AI/ML"
        tags.extend(["ai-ml", "speech-recognition", "embeddings"])
    elif any(k in text_lower for k in ["resume", "internship", "career", "portfolio", "interview", "project"]):
        category = "Career & Projects"
        tags.extend(["career-guidance", "internships", "portfolio"])
    else:
        tags.extend(["general-doubt", "mentorship"])

    # Extract additional keyword tags
    words = re.findall(r"\b[a-zA-Z]{4,}\b", transcript.lower())
    extra_keywords = [w for w in words if w not in ["that", "with", "from", "have", "this", "need", "help", "about", "what", "how", "when", "some", "getting"]][:3]
    tags.extend(extra_keywords)
    # Deduplicate tags
    unique_tags = list(dict.fromkeys(tags))[:5]

    # 2. Extract Title (max 10 words)
    words = transcript.strip().split()
    if len(words) <= 8:
        title = transcript.strip().rstrip(".!?")
    else:
        title = " ".join(words[:8]).rstrip(",.!?") + "..."

    # Capitalize title
    title = title[0].upper() + title[1:] if title else "Technical Mentorship Query"

    # 3. Urgency
    urgency = normalize_urgency("Standard", transcript)

    return StructuredDoubt(
        title=title,
        description=transcript.strip(),
        category=category,
        tags=unique_tags,
        urgency=urgency
    )


def classify_transcript(transcript: str) -> StructuredDoubt:
    """
    Main classifier function: Calls Groq Llama 3 (llama-3.3-70b-versatile) with strict JSON mode,
    falling back seamlessly to rule-based NLP if the API key is not configured or fails.
    """
    cleaned_transcript = (transcript or "").strip()
    if not cleaned_transcript:
        return StructuredDoubt(
            title="General Mentorship Doubt",
            description="Empty transcript provided.",
            category="General",
            tags=["general"],
            urgency="Standard"
        )

    groq_key = os.getenv("GROQ_API_KEY", "").strip()

    if groq_key and not groq_key.startswith("gsk_your"):
        try:
            client = Groq(api_key=groq_key)
            
            system_prompt = (
                "You are an expert AI mentor and question classifier for MentorMatch AI. "
                "Your task is to analyze a student's spoken voice doubt transcript and structure it into a clean JSON object.\n"
                "MULTILINGUAL INSTRUCTION: If the user's transcript is in Hindi, Hinglish, or mixed multilingual speech (e.g. 'HTML इस पर समझाओ मेरे को' or 'React state kaise banaye'), accurately translate and distill the core technical question into clear English before generating the title, description, category, and tags (e.g., Title: 'Foundational Explanation and Core Concepts of HTML', Description: 'Student is requesting a foundational explanation and conceptual overview of HTML for web development.').\n"
                "You MUST adhere strictly to this JSON schema:\n"
                "{\n"
                '  "title": "Concise headline summarizing the core doubt in English (max 8-10 words)",\n'
                '  "description": "Clear 1-2 sentence explanation of the technical question or roadblock in English",\n'
                '  "category": "Exactly one of: Frontend, Backend, AI/ML, System Design, Algorithms, Career & Projects, General",\n'
                '  "tags": ["keyword1", "keyword2", "keyword3"],\n'
                '  "urgency": "Standard" or "Urgent"\n'
                "}\n"
                "Return ONLY valid JSON."
            )

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Student Voice Transcript:\n\"\"\"{cleaned_transcript}\"\"\""}
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
                max_tokens=500,
            )

            content = response.choices[0].message.content
            parsed = json.loads(content)

            # Validate and normalize
            category = normalize_category(parsed.get("category", "General"))
            urgency = normalize_urgency(parsed.get("urgency", "Standard"), cleaned_transcript)
            
            raw_tags = parsed.get("tags", [])
            clean_tags = [str(t).lower().replace(" ", "-") for t in raw_tags if isinstance(t, (str, int))][:6]
            if not clean_tags:
                clean_tags = [category.lower()]

            return StructuredDoubt(
                title=str(parsed.get("title", cleaned_transcript[:60])).strip(),
                description=str(parsed.get("description", cleaned_transcript)).strip(),
                category=category,
                tags=clean_tags,
                urgency=urgency
            )

        except (GroqError, json.JSONDecodeError, Exception) as exc:
            # Resilient fallback to rule-based classification
            print(f"[WARN] Groq LLM classification fallback engaged: {exc}")
            return fallback_rule_based_classifier(cleaned_transcript)
    else:
        # Development / Offline Fallback
        return fallback_rule_based_classifier(cleaned_transcript)
