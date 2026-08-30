import os
import json
import re
import time
from typing import List, Optional
from pydantic import BaseModel, Field
from groq import (
    Groq,
    GroqError,
    RateLimitError,
    APITimeoutError,
    APIConnectionError,
    APIStatusError
)

VALID_CATEGORIES = [
    "Physics",
    "Chemistry",
    "Algebra",
    "Geometry",
    "Biology",
    "World History",
    "Literature"
]


class ClassifyDoubtRequest(BaseModel):
    """Input payload containing raw voice transcript text."""
    transcript: str = Field(
        ...,
        min_length=3,
        max_length=10000,
        description="Raw voice transcript to classify and structure",
        examples=["I don't understand how to balance this redox equation in chemistry."]
    )


class StructuredDoubt(BaseModel):
    """Structured doubt conforming to the MentorMatch public.doubts schema."""
    title: str = Field(..., description="Concise summary headline (5-10 words)")
    description: str = Field(..., description="Clear explanation of the academic question or roadblock")
    category: str = Field(default="Physics", description="Classified academic category")
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
    if any(k in cat_lower for k in ["physics", "kinematics", "force", "velocity", "gravity", "motion", "energy", "newton", "optics"]):
        return "Physics"
    if any(k in cat_lower for k in ["chem", "redox", "molecule", "reaction", "acid", "base", "stoichiometry", "bond", "atom"]):
        return "Chemistry"
    if any(k in cat_lower for k in ["algebra", "calculus", "equation", "derivative", "chain rule", "polynomial", "integral", "limit", "matrix"]):
        return "Algebra"
    if any(k in cat_lower for k in ["geometry", "trigonometric", "trigonometry", "triangle", "circle", "angle", "proof", "hypotenuse"]):
        return "Geometry"
    if any(k in cat_lower for k in ["biology", "cell", "photosynthesis", "respiration", "genetics", "dna", "gene", "organism"]):
        return "Biology"
    if any(k in cat_lower for k in ["history", "revolution", "war", "empire", "century", "historical", "civilization"]):
        return "World History"
    if any(k in cat_lower for k in ["literature", "essay", "thesis", "novel", "poem", "shakespeare", "reading", "grammar"]):
        return "Literature"
    
    # Direct match check
    for valid in VALID_CATEGORIES:
        if valid.lower() in cat_lower:
            return valid
    return "Physics"


def normalize_urgency(urgency_str: str, transcript: str) -> str:
    """Evaluates urgency against strict 'Standard' or 'Urgent' schema."""
    combined = f"{urgency_str} {transcript}".lower()
    if any(k in combined for k in ["urgent", "asap", "emergency", "test tomorrow", "exam tomorrow", "critical", "blocking"]):
        return "Urgent"
    return "Standard"


def fallback_rule_based_classifier(transcript: str) -> StructuredDoubt:
    """
    Resilient offline rule-based heuristic classification when Groq API key is unconfigured.
    """
    text_lower = transcript.lower()
    
    # 1. Determine Category
    category = "Physics"
    tags = []
    
    if any(k in text_lower for k in ["physics", "kinematics", "force", "acceleration", "velocity", "motion", "gravity", "energy"]):
        category = "Physics"
        tags.extend(["physics", "kinematics", "science"])
    elif any(k in text_lower for k in ["chemistry", "chem", "redox", "oxidation", "reduction", "molecule", "reaction", "acid", "base"]):
        category = "Chemistry"
        tags.extend(["chemistry", "redox-reactions", "science"])
    elif any(k in text_lower for k in ["algebra", "calculus", "chain rule", "derivative", "equation", "integral", "limit"]):
        category = "Algebra"
        tags.extend(["algebra", "calculus", "mathematics"])
    elif any(k in text_lower for k in ["geometry", "trigonometry", "triangle", "circle", "angle", "proof", "vectors"]):
        category = "Geometry"
        tags.extend(["geometry", "trigonometry", "mathematics"])
    elif any(k in text_lower for k in ["biology", "cell", "photosynthesis", "respiration", "genetics", "dna", "organism"]):
        category = "Biology"
        tags.extend(["biology", "cell-biology", "science"])
    elif any(k in text_lower for k in ["history", "revolution", "war", "empire", "historical", "century"]):
        category = "World History"
        tags.extend(["world-history", "social-studies", "history"])
    elif any(k in text_lower for k in ["literature", "essay", "thesis", "poem", "novel", "reading", "grammar"]):
        category = "Literature"
        tags.extend(["literature", "essay-writing", "english"])
    else:
        tags.extend(["academic-doubt", "mentorship"])

    # Extract additional keyword tags
    words = re.findall(r"\b[a-zA-Z]{4,}\b", transcript.lower())
    extra_keywords = [w for w in words if w not in ["that", "with", "from", "have", "this", "need", "help", "about", "what", "how", "when", "some", "getting"]][:3]
    tags.extend(extra_keywords)
    unique_tags = list(dict.fromkeys(tags))[:5]

    # 2. Extract Title (max 10 words)
    words = transcript.strip().split()
    if len(words) <= 8:
        title = transcript.strip().rstrip(".!?")
    else:
        title = " ".join(words[:8]).rstrip(",.!?") + "..."

    title = title[0].upper() + title[1:] if title else "Academic Mentorship Query"
    urgency = normalize_urgency("Standard", transcript)

    return StructuredDoubt(
        title=title,
        description=transcript.strip(),
        category=category,
        tags=unique_tags,
        urgency=urgency
    )


def classify_transcript(transcript: str, timeout_seconds: float = 10.0) -> StructuredDoubt:
    """
    Main classifier function: Calls Groq Llama 3 (llama-3.3-70b-versatile) with strict JSON mode
    and an explicit 10-second timeout, falling back seamlessly to rule-based NLP if the API key
    is not configured or fails.
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
            client = Groq(api_key=groq_key, timeout=timeout_seconds)
            
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

        except (RateLimitError, APITimeoutError, APIConnectionError, APIStatusError, GroqError, json.JSONDecodeError, Exception) as exc:
            # Resilient fallback to rule-based classification
            print(f"[WARN] Groq LLM classification fallback engaged: {exc}")
            return fallback_rule_based_classifier(cleaned_transcript)
    else:
        # Development / Offline Fallback
        return fallback_rule_based_classifier(cleaned_transcript)
