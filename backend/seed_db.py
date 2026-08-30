"""
MentorMatch AI - Standalone Database Seeder
============================================
Populates Supabase PostgreSQL database for hackathon demos and testing:
- 10 Realistic Student Profiles & Student records
- 5 Volunteer Mentor Profiles & Mentor records (with mock 384-dim pgvector skill embeddings)
- 20 Simulated Technical Doubts spanning 'pending', 'matched', and 'resolved' statuses

Usage:
    python seed_db.py
    python seed_db.py --dry-run
"""

import os
import sys
import uuid
import random
import math
import argparse
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from dotenv import load_dotenv

# Ensure safe UTF-8 output on Windows consoles
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    psycopg2 = None

# Try importing Faker, with graceful fallback
try:
    from faker import Faker
    fake = Faker()
except ImportError:
    print("[WARN] 'faker' package not installed. Using internal mock generators.")
    fake = None

# Try importing Supabase client
try:
    from supabase import create_client, Client
except ImportError:
    print("[WARN] 'supabase' package not installed. Install with 'pip install supabase'.")
    create_client = None

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip().rstrip("/").strip('"').strip("'")
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY") 
    or os.getenv("SUPABASE_ANON_KEY", "")
).strip().strip('"').strip("'")

# -----------------------------------------------------------------------------
# Curated Technical Seed Constants
# -----------------------------------------------------------------------------

CATEGORIES = [
    "Physics",
    "Chemistry",
    "Algebra",
    "Geometry",
    "Biology",
    "World History",
    "Literature"
]

MENTOR_TEMPLATES = [
    {
        "name": "Dr. Sarah Jenkins",
        "email": "sarah.jenkins@shiftingorbits.org",
        "headline": "Senior Physics & Chemistry Teacher",
        "bio": "12+ years helping high school students build confidence in Physics, Chemistry, and lab sciences.",
        "tags": ["Physics", "Chemistry", "Kinematics", "Lab Safety", "Study Skills"],
        "rating": 4.98,
        "resolved_count": 48
    },
    {
        "name": "Priya Sharma",
        "email": "priya.sharma@shiftingorbits.org",
        "headline": "Algebra & Calculus Educator",
        "bio": "Passionate about nurturing high school students in Mathematics, Calculus, and problem-solving.",
        "tags": ["Algebra", "Calculus", "Trigonometry", "Exam Prep", "Mathematics"],
        "rating": 5.00,
        "resolved_count": 54
    },
    {
        "name": "Marcus Chen",
        "email": "marcus.chen@shiftingorbits.org",
        "headline": "Chemistry & Environmental Science Teacher",
        "bio": "Specializes in chemical equations, stoichiometry, and environmental science learning.",
        "tags": ["Chemistry", "Redox Reactions", "Biology", "Science Projects", "Lab Safety"],
        "rating": 4.85,
        "resolved_count": 25
    },
    {
        "name": "Elena Rostova",
        "email": "elena.rostova@shiftingorbits.org",
        "headline": "Senior Geometry & Mathematics Teacher",
        "bio": "Coaching secondary school students through geometry proofs, algebra, and exam preparation.",
        "tags": ["Geometry", "Algebra", "Trigonometry", "Proofs", "Math Competitions"],
        "rating": 4.90,
        "resolved_count": 31
    },
    {
        "name": "Alex Rivera",
        "email": "alex.rivera@shiftingorbits.org",
        "headline": "World History & English Literature Educator",
        "bio": "Guiding students in analytical essay writing, historical analysis, and literature comprehension.",
        "tags": ["World History", "Literature", "Essay Writing", "Reading Comprehension", "Social Studies"],
        "rating": 4.92,
        "resolved_count": 38
    }
]

DOUBT_TEMPLATES = [
    {
        "title": "I don't understand how to balance this redox equation",
        "description": "I am struggling to balance the half-reactions for oxidation and reduction in acidic solution.",
        "transcript": "Hello teacher, I don't understand how to balance this redox equation in my chemistry homework. Could you explain the half-reaction method?",
        "category": "Chemistry",
        "tags": ["Chemistry", "Redox", "Equations", "LabPrep"],
        "status": "resolved",
        "urgency": "Standard",
        "answer": "Divide the equation into oxidation and reduction half-reactions first, balance atoms other than O and H, then add H2O and H+ ions before balancing charge with electrons."
    },
    {
        "title": "Can someone explain the chain rule in calculus?",
        "description": "I understand basic derivatives, but I get confused when taking derivatives of composite functions like sin(x^2).",
        "transcript": "Can someone explain the chain rule in calculus? I am getting confused when differentiating composite functions.",
        "category": "Algebra",
        "tags": ["Calculus", "ChainRule", "Derivatives", "Mathematics"],
        "status": "matched",
        "urgency": "High",
    },
    {
        "title": "How does cellular respiration compare to photosynthesis in biology?",
        "description": "I am preparing a biology study guide comparing energy transformation in chloroplasts versus mitochondria.",
        "transcript": "How does cellular respiration compare to photosynthesis in biology? What are the key reactants and products?",
        "category": "Biology",
        "tags": ["Biology", "CellRespiration", "Photosynthesis", "Science"],
        "status": "resolved",
        "urgency": "Standard",
        "answer": "Photosynthesis stores solar energy into glucose (6CO2 + 6H2O -> C6H12O6 + 6O2), while cellular respiration breaks down glucose to generate ATP energy!"
    },
    {
        "title": "How do I calculate kinetic energy in a projectile motion problem?",
        "description": "I need help breaking down the vertical and horizontal velocity components to find total kinetic energy at maximum height.",
        "transcript": "How do I calculate kinetic energy at the peak of projectile motion in physics?",
        "category": "Physics",
        "tags": ["Physics", "Kinematics", "KineticEnergy", "Vectors"],
        "status": "pending",
        "urgency": "Urgent",
    },
    {
        "title": "3D Geometry lines and planes shortest distance formula derivation",
        "description": "Need step-by-step vector method explanation for skew lines distance formula.",
        "transcript": "Can someone explain the derivation of the shortest distance between skew lines in 3D geometry?",
        "category": "Geometry",
        "tags": ["Geometry", "Vectors", "3DGeometry", "Trigonometry"],
        "status": "matched",
        "urgency": "Standard",
    },
    {
        "title": "What were the primary economic causes of the American Revolution?",
        "description": "I am preparing a history essay and want to structure key causes like colonial trade acts and taxation.",
        "transcript": "What were the primary economic causes of the American Revolution for my history paper?",
        "category": "World History",
        "tags": ["WorldHistory", "EssayWriting", "AmericanRevolution", "SocialStudies"],
        "status": "resolved",
        "urgency": "Standard",
        "answer": "Focus your thesis on mercantilist trade restrictions (Navigation Acts) and direct taxation without representation (Stamp Act, Townshend Acts)."
    }
]

# -----------------------------------------------------------------------------
# Mock Vector Embedding Generator (384-dimensional Unit Vector)
# -----------------------------------------------------------------------------

def generate_mock_384d_embedding(seed_str: str = "") -> List[float]:
    """
    Generates a realistic, unit-normalized 384-dimensional vector
    using Python's random module to simulate pgvector skill embeddings
    without requiring external model API calls.
    """
    rng = random.Random(seed_str if seed_str else None)
    raw_vector = [rng.uniform(-1.0, 1.0) for _ in range(384)]
    
    # Calculate Euclidean L2 norm
    l2_norm = math.sqrt(sum(val * val for val in raw_vector))
    if l2_norm == 0:
        return [0.0] * 384
    
    # Normalize to unit length (sum of squares = 1.0)
    normalized = [round(val / l2_norm, 6) for val in raw_vector]
    return normalized


# -----------------------------------------------------------------------------
# Seed Data Builders
# -----------------------------------------------------------------------------

STUDENT_TEMPLATES = [
    {"name": "Rahul Kumar", "email": "rahul.k@student.shiftingorbits.org", "stage": "Grade 10 (Secondary Boards)", "interests": ["Physics", "Chemistry", "Algebra"]},
    {"name": "Ananya Patel", "email": "ananya.p@student.shiftingorbits.org", "stage": "Grade 12 (College Prep & Boards)", "interests": ["Biology", "Chemistry", "Genetics"]},
    {"name": "Amit Verma", "email": "amit.v@student.shiftingorbits.org", "stage": "Grade 9 (Early High School)", "interests": ["Geometry", "Physics", "Algebra"]},
    {"name": "Sneha Roy", "email": "sneha.r@student.shiftingorbits.org", "stage": "Grade 12 (Senior High School)", "interests": ["Biology", "Chemistry", "Cell Energetics"]},
    {"name": "Vikram Singh", "email": "vikram.s@student.shiftingorbits.org", "stage": "Grade 11 (Senior Secondary)", "interests": ["Calculus", "Algebra", "Physics"]},
    {"name": "Pooja Nair", "email": "pooja.n@student.shiftingorbits.org", "stage": "Grade 10 (Secondary Boards)", "interests": ["Chemistry", "World History", "Biology"]},
    {"name": "Deepa Mehta", "email": "deepa.m@student.shiftingorbits.org", "stage": "Grade 12 (College Prep & Boards)", "interests": ["Physics", "Kinematics", "Trigonometry"]},
    {"name": "Rohit Gupta", "email": "rohit.g@student.shiftingorbits.org", "stage": "Grade 11 (Senior Secondary)", "interests": ["Chemistry", "Physics", "Algebra"]},
    {"name": "Kavita Joshi", "email": "kavita.j@student.shiftingorbits.org", "stage": "Grade 8 (Middle School)", "interests": ["Biology", "Environmental Science", "General Science"]},
    {"name": "Tarun Sharma", "email": "tarun.s@student.shiftingorbits.org", "stage": "Grade 12 (Senior High School)", "interests": ["Geometry", "Trigonometry", "Algebra"]},
    {"name": "Ritu Desai", "email": "ritu.d@student.shiftingorbits.org", "stage": "Grade 12 (College Prep & Boards)", "interests": ["Geometry", "Calculus", "Physics"]},
    {"name": "Sameer Khan", "email": "sameer.k@student.shiftingorbits.org", "stage": "Grade 10 (Secondary Boards)", "interests": ["World History", "Literature", "Social Studies"]},
    {"name": "Sunita Devi", "email": "sunita.d@student.shiftingorbits.org", "stage": "Grade 11 (Senior Secondary)", "interests": ["World History", "Literature", "Essay Writing"]},
    {"name": "Manoj Yadav", "email": "manoj.y@student.shiftingorbits.org", "stage": "Grade 9 (Early High School)", "interests": ["Literature", "English Grammar", "World History"]},
    {"name": "Divya Rani", "email": "divya.r@student.shiftingorbits.org", "stage": "Grade 12 (Senior High School)", "interests": ["Algebra", "Economics", "Statistics"]},
]

def generate_students(count: int = 15) -> List[Dict[str, Any]]:
    """Generates 15 realistic student profiles and student records."""
    students = []
    for i, t in enumerate(STUDENT_TEMPLATES[:count]):
        student_id = str(uuid.uuid4())
        students.append({
            "id": student_id,
            "profile": {
                "id": student_id,
                "email": t["email"],
                "full_name": t["name"],
                "avatar_url": f"https://api.dicebear.com/7.x/bottts/svg?seed={t['name'].replace(' ', '_')}",
                "role": "student",
                "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(5, 60))).isoformat(),
            },
            "student_record": {
                "id": student_id,
                "education_level": t["stage"],
                "learning_goals": f"Achieve mastery in {t['stage']} curriculum and excel in cradle-to-college milestones.",
                "learning_interests": t["interests"],
            }
        })
    return students


def generate_mentors() -> List[Dict[str, Any]]:
    """Generates 5 volunteer mentor profiles with 384-dim skill embeddings."""
    mentors = []
    for m in MENTOR_TEMPLATES:
        mentor_id = str(uuid.uuid4())
        embedding = generate_mock_384d_embedding(seed_str=m["name"])
        
        mentors.append({
            "id": mentor_id,
            "profile": {
                "id": mentor_id,
                "email": m["email"],
                "full_name": m["name"],
                "avatar_url": f"https://api.dicebear.com/7.x/avataaars/svg?seed={m['name'].replace(' ', '_')}",
                "role": "mentor",
                "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(30, 180))).isoformat(),
            },
            "mentor_record": {
                "id": mentor_id,
                "headline": m["headline"],
                "bio": m["bio"],
                "expertise_tags": m["tags"],
                "skill_embedding": embedding,
                "is_available": True,
                "rating": m["rating"],
                "resolved_count": m["resolved_count"],
            }
        })
    return mentors


def generate_doubts(
    students: List[Dict[str, Any]], 
    mentors: List[Dict[str, Any]], 
    count: int = 20
) -> List[Dict[str, Any]]:
    """Generates 20 simulated technical doubts with realistic fields and embeddings."""
    doubts = []
    now = datetime.now(timezone.utc)

    for i in range(count):
        doubt_id = str(uuid.uuid4())
        template = DOUBT_TEMPLATES[i % len(DOUBT_TEMPLATES)]
        student = random.choice(students)
        assigned_mentor = random.choice(mentors) if template.get("status") in ("matched", "resolved") else None
        created_time = now - timedelta(minutes=random.randint(5, 2880)) # 5 mins to 2 days ago

        doubt_embedding = generate_mock_384d_embedding(seed_str=template["title"] + str(i))
        status = template.get("status", random.choice(["pending", "matched", "resolved"]))

        doubt_record = {
            "id": doubt_id,
            "student_id": student["id"],
            "title": template["title"] if i < len(DOUBT_TEMPLATES) else f"{template['title']} (Case #{i+1})",
            "description": template["description"],
            "transcript": template.get("transcript", template["description"]),
            "audio_url": f"https://placeholder-storage.supabase.co/audio/recording_{doubt_id[:8]}.webm",
            "category": template["category"],
            "tags": template["tags"],
            "status": status,
            "urgency": template.get("urgency", "Standard"),
            "embedding": doubt_embedding,
            "matched_mentor_ids": [m["id"] for m in random.sample(mentors, k=min(2, len(mentors)))],
            "assigned_mentor_id": assigned_mentor["id"] if assigned_mentor else None,
            "answer": template.get("answer") if status == "resolved" else None,
            "answered_by_name": assigned_mentor["profile"]["full_name"] if status == "resolved" and assigned_mentor else None,
            "answered_at": (created_time + timedelta(minutes=random.randint(2, 12))).isoformat() if status == "resolved" else None,
            "created_at": created_time.isoformat(),
            "updated_at": created_time.isoformat(),
        }
        doubts.append(doubt_record)

    return doubts


# -----------------------------------------------------------------------------
# Seeder Execution Engine
# -----------------------------------------------------------------------------

def seed_database(dry_run: bool = False):
    print("=" * 70)
    print("[*] MentorMatch AI - Supabase Database Seeder")
    print("=" * 70)

    # 1. Generate Synthetic Datasets
    print("\n[1/4] Generating 10 realistic student records...")
    students = generate_students(10)
    for s in students[:3]:
        print(f"  * Student: {s['profile']['full_name']} ({s['student_record']['education_level']})")
    print(f"  ... plus {len(students)-3} more students.")

    print("\n[2/4] Generating 5 volunteer mentor profiles with 384-dim pgvector embeddings...")
    mentors = generate_mentors()
    for m in mentors:
        vec = m["mentor_record"]["skill_embedding"]
        print(f"  * Mentor: {m['profile']['full_name']} | Tags: {m['mentor_record']['expertise_tags']} | Embedding dim: {len(vec)}")

    print("\n[3/4] Generating 20 simulated technical doubts across pending, matched, and resolved...")
    doubts = generate_doubts(students, mentors, 20)
    resolved_c = sum(1 for d in doubts if d["status"] == "resolved")
    matched_c = sum(1 for d in doubts if d["status"] == "matched")
    pending_c = sum(1 for d in doubts if d["status"] == "pending")
    print(f"  * Generated {len(doubts)} doubts ({pending_c} pending, {matched_c} matched, {resolved_c} resolved).")

    if dry_run or not SUPABASE_URL or not SUPABASE_KEY:
        print("\n" + "=" * 70)
        print("[!] DRY-RUN / LOCAL MODE:")
        print("   Skipping live HTTP insertion to Supabase. To execute live seeding,")
        print("   ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file.")
        print("=" * 70)
        return

    # 2. Insert into live Supabase instance
    db_url = os.getenv("DATABASE_URL")
    if db_url and psycopg2:
        print(f"\n[4/4] Seeding database via direct PostgreSQL connection...")
        if "sslmode" not in db_url and "supabase.co" in db_url:
            db_url += ("&" if "?" in db_url else "?") + "sslmode=require"

        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        try:
            with conn.cursor() as cur:
                # A. Insert Students into auth.users & public.students
                print(f"\n  -> Provisioning {len(students)} student auth users...")
                for s in students:
                    cur.execute("SELECT id FROM auth.users WHERE email = %s;", (s["profile"]["email"],))
                    existing = cur.fetchone()
                    if existing:
                        s["id"] = existing[0]
                        s["profile"]["id"] = existing[0]
                        s["student_record"]["id"] = existing[0]
                    else:
                        cur.execute("""
                            INSERT INTO auth.users (
                                id, instance_id, aud, role, email, encrypted_password, 
                                email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
                                created_at, updated_at
                            )
                            VALUES (
                                %s, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
                                %s, crypt('Password123!', gen_salt('bf')), NOW(),
                                '{"provider":"email","providers":["email"]}'::jsonb,
                                %s::jsonb,
                                NOW(), NOW()
                            );
                        """, (
                            s["id"],
                            s["profile"]["email"],
                            psycopg2.extras.Json({
                                "full_name": s["profile"]["full_name"],
                                "role": "student",
                                "avatar_url": s["profile"]["avatar_url"],
                                "education_level": s["student_record"]["education_level"],
                                "learning_goals": s["student_record"]["learning_goals"]
                            })
                        ))
                    
                    # Ensure public.profiles & public.students exist
                    cur.execute("""
                        INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
                        VALUES (%s, %s, %s, %s, 'student')
                        ON CONFLICT (id) DO UPDATE SET
                            full_name = EXCLUDED.full_name,
                            avatar_url = EXCLUDED.avatar_url;
                    """, (s["id"], s["profile"]["email"], s["profile"]["full_name"], s["profile"]["avatar_url"]))

                    cur.execute("""
                        INSERT INTO public.students (id, education_level, learning_goals, learning_interests)
                        VALUES (%s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                            education_level = EXCLUDED.education_level,
                            learning_goals = EXCLUDED.learning_goals,
                            learning_interests = EXCLUDED.learning_interests;
                    """, (s["id"], s["student_record"]["education_level"], s["student_record"]["learning_goals"], s["student_record"]["learning_interests"]))

                print("    [OK] Students created.")

                # B. Insert Mentors into auth.users & public.mentors
                print(f"\n  -> Provisioning {len(mentors)} mentor auth users with 384-dim pgvector embeddings...")
                for m in mentors:
                    cur.execute("SELECT id FROM auth.users WHERE email = %s;", (m["profile"]["email"],))
                    existing = cur.fetchone()
                    if existing:
                        m["id"] = existing[0]
                        m["profile"]["id"] = existing[0]
                        m["mentor_record"]["id"] = existing[0]
                    else:
                        cur.execute("""
                            INSERT INTO auth.users (
                                id, instance_id, aud, role, email, encrypted_password, 
                                email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
                                created_at, updated_at
                            )
                            VALUES (
                                %s, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 
                                %s, crypt('Password123!', gen_salt('bf')), NOW(),
                                '{"provider":"email","providers":["email"]}'::jsonb,
                                %s::jsonb,
                                NOW(), NOW()
                            );
                        """, (
                            m["id"],
                            m["profile"]["email"],
                            psycopg2.extras.Json({
                                "full_name": m["profile"]["full_name"],
                                "role": "mentor",
                                "avatar_url": m["profile"]["avatar_url"],
                                "headline": m["mentor_record"]["headline"],
                                "bio": m["mentor_record"]["bio"]
                            })
                        ))

                    cur.execute("""
                        INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
                        VALUES (%s, %s, %s, %s, 'mentor')
                        ON CONFLICT (id) DO UPDATE SET
                            full_name = EXCLUDED.full_name,
                            avatar_url = EXCLUDED.avatar_url;
                    """, (m["id"], m["profile"]["email"], m["profile"]["full_name"], m["profile"]["avatar_url"]))

                    # Update mentor record with skill embedding & expertise tags
                    embedding_str = "[" + ",".join(str(x) for x in m["mentor_record"]["skill_embedding"]) + "]"
                    cur.execute("""
                        INSERT INTO public.mentors (
                            id, headline, bio, expertise_tags, skill_embedding, is_available, rating, resolved_count
                        )
                        VALUES (%s, %s, %s, %s, %s::vector, TRUE, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                            headline = EXCLUDED.headline,
                            bio = EXCLUDED.bio,
                            expertise_tags = EXCLUDED.expertise_tags,
                            skill_embedding = EXCLUDED.skill_embedding,
                            rating = EXCLUDED.rating,
                            resolved_count = EXCLUDED.resolved_count;
                    """, (
                        m["id"],
                        m["mentor_record"]["headline"],
                        m["mentor_record"]["bio"],
                        m["mentor_record"]["expertise_tags"],
                        embedding_str,
                        m["mentor_record"]["rating"],
                        m["mentor_record"]["resolved_count"],
                    ))

                print("    [OK] Mentors & 384-dim pgvector embeddings updated.")

                # C. Insert Doubts with pgvector embeddings
                fresh_doubts = generate_doubts(students, mentors, 20)
                print(f"\n  -> Inserting {len(fresh_doubts)} simulated doubt cases into 'doubts' table...")
                for d in fresh_doubts:
                    d_emb_str = "[" + ",".join(str(x) for x in d["embedding"]) + "]"
                    cur.execute("""
                        INSERT INTO public.doubts (
                            id, student_id, title, description, transcript, audio_url,
                            category, tags, status, urgency, embedding, matched_mentor_ids,
                            assigned_mentor_id, answer, answered_by_name, answered_at,
                            created_at, updated_at
                        )
                        VALUES (
                            %s, %s, %s, %s, %s, %s,
                            %s, %s, %s::doubt_status, %s, %s::vector, %s::uuid[],
                            %s, %s, %s, %s,
                            %s, %s
                        )
                        ON CONFLICT (id) DO UPDATE SET
                            title = EXCLUDED.title,
                            status = EXCLUDED.status,
                            embedding = EXCLUDED.embedding;
                    """, (
                        d["id"], d["student_id"], d["title"], d["description"], d["transcript"], d["audio_url"],
                        d["category"], d["tags"], d["status"], d["urgency"], d_emb_str, d["matched_mentor_ids"],
                        d["assigned_mentor_id"], d["answer"], d["answered_by_name"], d["answered_at"],
                        d["created_at"], d["updated_at"]
                    ))

                print("    [OK] 20 Doubts live feed seeded.")

            print("\n" + "=" * 70)
            print("[SUCCESS] LIVE DATABASE SEEDING COMPLETED SUCCESSFULLY!")
            print(f"   - {len(students)} Students seeded")
            print(f"   - {len(mentors)} Mentors with 384-dimensional pgvector embeddings seeded")
            print(f"   - {len(doubts)} Doubts seeded across pending, matched, and resolved")
            print("=" * 70)
            return
        finally:
            conn.close()

    print("[ERROR] DATABASE_URL not set or psycopg2 unavailable.")




if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed MentorMatch AI database")
    parser.add_argument("--dry-run", action="store_true", help="Simulate seeding without executing Supabase HTTP requests")
    args = parser.parse_args()

    seed_database(dry_run=args.dry_run)
