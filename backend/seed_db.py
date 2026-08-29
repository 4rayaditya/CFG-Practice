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
    "Computer Science / Algorithms",
    "Web & Mobile Development",
    "Database & Cloud Infrastructure",
    "AI & Machine Learning",
    "Career & Technical Interviews"
]

MENTOR_TEMPLATES = [
    {
        "name": "Dr. Sarah Jenkins",
        "email": "sarah.jenkins@mentormatch.dev",
        "headline": "Staff Distributed Systems Engineer @ TechCorp",
        "bio": "12+ years building high-throughput microservices in Go & Python. Passionate about teaching algorithms and system design.",
        "tags": ["Distributed Systems", "Algorithms", "Python", "Go", "System Design"],
        "rating": 5.00,
        "resolved_count": 48
    },
    {
        "name": "Alex Rivera",
        "email": "alex.rivera@mentormatch.dev",
        "headline": "Lead Frontend Architect & Open Source Contributor",
        "bio": "Specializes in React, Next.js, Web Accessibility (a11y), and PWA offline architectures. Mentor for underrepresented youth in STEM.",
        "tags": ["React", "TypeScript", "Frontend", "Web Dev", "Accessibility"],
        "rating": 4.95,
        "resolved_count": 36
    },
    {
        "name": "Elena Rostova",
        "email": "elena.rostova@mentormatch.dev",
        "headline": "Senior AI / Machine Learning Researcher",
        "bio": "Focuses on NLP, LLM fine-tuning, embeddings, and vector databases with PyTorch and pgvector. Former CS instructor.",
        "tags": ["AI & Machine Learning", "PyTorch", "NLP", "Python", "Embeddings"],
        "rating": 5.00,
        "resolved_count": 29
    },
    {
        "name": "Marcus Chen",
        "email": "marcus.chen@mentormatch.dev",
        "headline": "Principal Cloud Infrastructure Architect",
        "bio": "DevOps & Cloud Database enthusiast. Expertise in PostgreSQL query optimization, Docker, Kubernetes, and Supabase.",
        "tags": ["Database Systems", "PostgreSQL", "Cloud", "DevOps", "Docker"],
        "rating": 4.88,
        "resolved_count": 25
    },
    {
        "name": "Priya Patel",
        "email": "priya.patel@mentormatch.dev",
        "headline": "Engineering Manager & Tech Career Coach",
        "bio": "Helps first-generation college students master behavioral questions, resume reviews, and internship strategy.",
        "tags": ["Career & Technical Interviews", "Resume Review", "Internships", "Mentorship"],
        "rating": 4.98,
        "resolved_count": 42
    }
]

DOUBT_TEMPLATES = [
    {
        "title": "Understanding recursion and tree traversals in Python",
        "description": "I am practicing binary search tree algorithms and having trouble understanding how the recursive call stack unwinds in pre-order vs in-order.",
        "transcript": "Hi mentor! I am practicing binary search tree algorithms and having trouble understanding how the recursive call stack unwinds in pre-order vs in-order traversal. Could you explain with a visual example?",
        "category": "Computer Science / Algorithms",
        "tags": ["Python", "Algorithms", "BinaryTree", "Recursion"],
        "status": "resolved",
        "urgency": "Standard",
        "answer": "Think of the call stack as a literal stack of plates! In In-Order (Left, Root, Right), we always recurse as deep left as possible before popping to process the current node."
    },
    {
        "title": "Tips for landing first web development internship with no prior experience",
        "description": "What are the best types of portfolio projects to demonstrate understanding of React and clean RESTful APIs for non-profit / social impact projects?",
        "transcript": "What are the best types of portfolio projects to demonstrate understanding of React and clean RESTful APIs for non-profit and community projects?",
        "category": "Career & Technical Interviews",
        "tags": ["Career", "React", "Portfolio", "Internship"],
        "status": "matched",
        "urgency": "High",
    },
    {
        "title": "How to build accessible web forms for screen readers",
        "description": "What are the essential ARIA attributes and keyboard navigation patterns to ensure my high school community site is accessible to everyone?",
        "transcript": "What are the essential ARIA attributes and keyboard navigation patterns to ensure my site is accessible to all students?",
        "category": "Web & Mobile Development",
        "tags": ["Accessibility", "ARIA", "React", "HTML5"],
        "status": "resolved",
        "urgency": "Standard",
        "answer": "Always prioritize semantic HTML (like <label htmlFor='...'>) before adding custom ARIA roles. Test tab navigation with your keyboard alone."
    },
    {
        "title": "Database normalization 3NF vs BCNF differences",
        "description": "Can someone provide a concrete table schema example where a relation is in 3NF but fails Boyce-Codd Normal Form?",
        "transcript": "Can someone provide a concrete schema example where a table is in 3NF but fails BCNF? I have an exam coming up.",
        "category": "Database & Cloud Infrastructure",
        "tags": ["Database", "SQL", "Normalization", "3NF"],
        "status": "pending",
        "urgency": "Urgent",
    },
    {
        "title": "Cosine distance vs Euclidean distance in Vector Embeddings",
        "description": "Why is cosine similarity preferred over Euclidean L2 distance for comparing semantic similarity of text embeddings like all-MiniLM-L6-v2?",
        "transcript": "Why is cosine similarity preferred over Euclidean distance when comparing text embeddings in pgvector?",
        "category": "AI & Machine Learning",
        "tags": ["pgvector", "Embeddings", "AI", "VectorMath"],
        "status": "matched",
        "urgency": "Standard",
    },
    {
        "title": "Optimizing Docker container build times for Vite + React",
        "description": "My multi-stage Dockerfile is re-installing node_modules on every trivial CSS change. How do I properly layer package.json caching?",
        "transcript": "My Dockerfile is re-installing node modules every time I change a file. How do I layer the cache correctly?",
        "category": "Database & Cloud Infrastructure",
        "tags": ["Docker", "Vite", "React", "DevOps"],
        "status": "resolved",
        "urgency": "Standard",
        "answer": "Copy only package.json and package-lock.json first, run npm ci, and only then COPY . . to take advantage of Docker layer caching."
    },
    {
        "title": "Handling offline sync with IndexedDB and Service Workers",
        "description": "How do I queue POST requests in IndexedDB when the user goes offline, and automatically flush them when the online event fires?",
        "transcript": "How do I queue user doubts in IndexedDB when offline and auto sync them when connection restores?",
        "category": "Web & Mobile Development",
        "tags": ["PWA", "IndexedDB", "Offline", "ServiceWorker"],
        "status": "matched",
        "urgency": "High",
    },
    {
        "title": "Understanding Big-O space complexity in Depth-First Search",
        "description": "If a graph has V vertices and E edges, is the DFS space complexity O(V) or O(V + E) when using an adjacency list vs call stack?",
        "transcript": "What is the exact space complexity of depth first search recursion when counting stack frames versus visited sets?",
        "category": "Computer Science / Algorithms",
        "tags": ["Algorithms", "BigO", "GraphTheory", "DFS"],
        "status": "pending",
        "urgency": "Standard",
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

def generate_students(count: int = 10) -> List[Dict[str, Any]]:
    """Generates realistic student profiles and student records."""
    education_levels = [
        "High School Junior", "High School Senior", 
        "First-Year Undergrad", "Sophomore CS Major", 
        "Self-Taught Career Switcher", "Bootcamp Graduate"
    ]
    
    interests_pool = [
        "Web Development", "Python", "Data Structures", 
        "AI/ML", "Mobile Apps", "Cloud Computing", "Cybersecurity"
    ]

    students = []
    for i in range(count):
        student_id = str(uuid.uuid4())
        name = fake.name() if fake else f"Student Learner {i + 1}"
        email = (
            fake.email() if fake 
            else f"student_{i + 1}_{int(datetime.now().timestamp())}@community.edu"
        )
        
        students.append({
            "id": student_id,
            "profile": {
                "id": student_id,
                "email": email,
                "full_name": name,
                "avatar_url": f"https://api.dicebear.com/7.x/bottts/svg?seed={student_id[:8]}",
                "role": "student",
                "created_at": (datetime.now(timezone.utc) - timedelta(days=random.randint(5, 60))).isoformat(),
            },
            "student_record": {
                "id": student_id,
                "education_level": random.choice(education_levels),
                "learning_goals": f"Master fundamental programming and prepare for technical internships in software engineering.",
                "learning_interests": random.sample(interests_pool, k=random.randint(2, 4)),
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
