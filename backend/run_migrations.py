"""
MentorMatch AI - Automated PostgreSQL Schema Migration Script
============================================================
Reads schema.sql and migration files from local disk and applies them directly
to the Supabase PostgreSQL database using psycopg2.

Features:
- Robust connection retry logic with exponential backoff
- Supabase SSL connection handling ('sslmode=require')
- Applies schema.sql and incremental migrations in ../supabase/migrations/
- Verification and clear logging of extensions (pgvector), tables, and RPC functions

Usage:
    python run_migrations.py
    python run_migrations.py --schema-path ../supabase/schema.sql
"""

import os
import sys
import time
import argparse
from typing import Optional, List, Tuple
from dotenv import load_dotenv

# Ensure safe UTF-8 output on Windows consoles
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Try importing psycopg2
try:
    import psycopg2
    from psycopg2 import sql, extensions, OperationalError
except ImportError:
    psycopg2 = None

load_dotenv()

# -----------------------------------------------------------------------------
# Configuration & Connection Resolution
# -----------------------------------------------------------------------------

def resolve_db_connection_string() -> Optional[str]:
    """
    Resolves the PostgreSQL connection string from various environment variable standards.
    """
    conn_str = (
        os.getenv("DATABASE_URL")
        or os.getenv("POSTGRES_URL")
        or os.getenv("SUPABASE_DB_URL")
        or os.getenv("POSTGRES_CONNECTION_STRING")
    )
    if conn_str:
        conn_str = conn_str.strip().strip('"').strip("'")
        # Ensure sslmode=require is appended for Supabase if not specified
        if "sslmode" not in conn_str and "supabase.co" in conn_str:
            delimiter = "&" if "?" in conn_str else "?"
            conn_str = f"{conn_str}{delimiter}sslmode=require"
        return conn_str

    # Alternative: Build from individual connection parameters
    host = os.getenv("POSTGRES_HOST") or os.getenv("DB_HOST")
    user = os.getenv("POSTGRES_USER") or os.getenv("DB_USER") or "postgres"
    password = os.getenv("POSTGRES_PASSWORD") or os.getenv("DB_PASSWORD")
    port = os.getenv("POSTGRES_PORT") or os.getenv("DB_PORT") or "5432"
    dbname = os.getenv("POSTGRES_DB") or os.getenv("DB_NAME") or "postgres"

    if host and password:
        return f"postgresql://{user}:{password}@{host}:{port}/{dbname}?sslmode=require"

    return None


def connect_with_retries(
    conn_string: str, 
    max_retries: int = 5, 
    initial_delay: float = 2.0
):
    """
    Attempts to establish a PostgreSQL connection with exponential backoff retries.
    """
    if not psycopg2:
        raise ImportError(
            "psycopg2 package is required. Install via: pip install psycopg2-binary"
        )

    delay = initial_delay
    last_exception = None

    for attempt in range(1, max_retries + 1):
        try:
            print(f"[*] Connection attempt {attempt}/{max_retries} to Supabase PostgreSQL...")
            conn = psycopg2.connect(conn_string)
            conn.autocommit = True
            print("  [OK] Successfully connected to PostgreSQL database.")
            return conn
        except Exception as exc:
            last_exception = exc
            print(f"  [WARN] Attempt {attempt} failed: {exc}")
            if attempt < max_retries:
                print(f"  [INFO] Retrying in {delay:.1f} seconds...")
                time.sleep(delay)
                delay *= 2

    raise ConnectionError(
        f"Failed to connect to database after {max_retries} attempts: {last_exception}"
    )


# -----------------------------------------------------------------------------
# Schema & Migration File Discovery
# -----------------------------------------------------------------------------

def find_schema_files(custom_schema_path: Optional[str] = None) -> Tuple[Optional[str], List[str]]:
    """
    Locates the primary schema.sql and any incremental migration .sql files.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Check candidate locations for schema.sql
    schema_candidates = [
        custom_schema_path,
        os.path.join(base_dir, "..", "supabase", "schema.sql"),
        os.path.join(base_dir, "schema.sql"),
        os.path.join(base_dir, "supabase", "schema.sql"),
    ]

    primary_schema = None
    for candidate in schema_candidates:
        if candidate and os.path.exists(candidate):
            primary_schema = os.path.abspath(candidate)
            break

    # Look for migration scripts
    migrations_dir_candidates = [
        os.path.join(base_dir, "..", "supabase", "migrations"),
        os.path.join(base_dir, "migrations"),
    ]

    incremental_migrations = []
    for m_dir in migrations_dir_candidates:
        if os.path.exists(m_dir) and os.path.isdir(m_dir):
            for file_name in sorted(os.listdir(m_dir)):
                if file_name.endswith(".sql"):
                    incremental_migrations.append(os.path.join(m_dir, file_name))
            break

    return primary_schema, incremental_migrations


# -----------------------------------------------------------------------------
# Verification Helpers
# -----------------------------------------------------------------------------

def verify_database_state(conn):
    """
    Queries PostgreSQL system catalogs to verify and log installed extensions,
    public tables, and key functions.
    """
    print("\n" + "=" * 70)
    print("[*] Verifying Database Schema & Extensions State")
    print("=" * 70)

    with conn.cursor() as cursor:
        # 1. Verify Extensions
        cursor.execute("SELECT extname, extversion FROM pg_extension ORDER BY extname;")
        extensions_installed = cursor.fetchall()
        print("\n[Extensions Installed]:")
        has_vector = False
        for extname, extversion in extensions_installed:
            if extname == "vector":
                has_vector = True
                print(f"  [OK] pgvector (vector) v{extversion} [Active - 384-dim Embeddings Enabled]")
            elif extname == "uuid-ossp":
                print(f"  [OK] uuid-ossp v{extversion} [Active - UUID Generation Enabled]")
            else:
                print(f"  * {extname} v{extversion}")

        if not has_vector:
            print("  [WARN] pgvector extension not detected in pg_extension.")

        # 2. Verify Public Tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = [row[0] for row in cursor.fetchall()]
        print(f"\n[Public Tables Verified ({len(tables)})]:")
        for tbl in tables:
            # Count records
            try:
                cursor.execute(f"SELECT COUNT(*) FROM public.{tbl};")
                count = cursor.fetchone()[0]
                print(f"  [OK] Table '{tbl}' (current rows: {count})")
            except Exception:
                print(f"  [OK] Table '{tbl}'")

        # 3. Verify Key Functions & RPCs
        cursor.execute("""
            SELECT routine_name 
            FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            ORDER BY routine_name;
        """)
        routines = [row[0] for row in cursor.fetchall()]
        print(f"\n[Public RPC Functions Verified ({len(routines)})]:")
        for fn in routines:
            if fn in ("match_mentors", "handle_new_user", "handle_updated_at"):
                print(f"  [OK] Function '{fn}' [Active]")
            else:
                print(f"  * Function '{fn}'")


# -----------------------------------------------------------------------------
# Migration Execution Engine
# -----------------------------------------------------------------------------

def run_migrations(schema_path: Optional[str] = None, skip_migrations_dir: bool = False):
    print("=" * 70)
    print("[*] MentorMatch AI - Automated Database Migration Runner")
    print("=" * 70)

    # 1. Resolve Connection String
    conn_string = resolve_db_connection_string()
    if not conn_string:
        print("\n[ERROR] No PostgreSQL connection string found!")
        print("Please configure one of the following in backend/.env:")
        print("  DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require")
        print("  or individual POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_USER variables.")
        sys.exit(1)

    # Mask password for secure console output
    masked_conn = conn_string
    if "@" in conn_string and ":" in conn_string.split("@")[0]:
        user_part = conn_string.split("@")[0]
        prefix, _ = user_part.rsplit(":", 1)
        masked_conn = f"{prefix}:*****@{conn_string.split('@', 1)[1]}"
    print(f"[Config] Target Database: {masked_conn}")

    # 2. Locate SQL Files
    primary_schema, incremental_migrations = find_schema_files(schema_path)

    if not primary_schema:
        print("[ERROR] Could not find schema.sql on disk.")
        sys.exit(1)

    print(f"[File] Primary Schema: {primary_schema}")
    if incremental_migrations and not skip_migrations_dir:
        print(f"[File] Found {len(incremental_migrations)} incremental migration files:")
        for mf in incremental_migrations:
            print(f"       - {os.path.basename(mf)}")

    # 3. Connect to Database
    conn = connect_with_retries(conn_string, max_retries=5, initial_delay=2.0)

    try:
        # 4. Apply Primary Schema
        print("\n" + "-" * 70)
        print(f"[*] Applying primary schema from: {os.path.basename(primary_schema)}...")
        print("-" * 70)

        with open(primary_schema, "r", encoding="utf-8") as sf:
            schema_sql = sf.read()

        with conn.cursor() as cursor:
            cursor.execute(schema_sql)
            print("  [OK] Primary schema SQL executed successfully.")

        # 5. Apply Incremental Migrations if any
        if incremental_migrations and not skip_migrations_dir:
            for mig_file in incremental_migrations:
                mig_name = os.path.basename(mig_file)
                print(f"\n[*] Applying migration: {mig_name}...")
                with open(mig_file, "r", encoding="utf-8") as mf:
                    mig_sql = mf.read()
                with conn.cursor() as cursor:
                    cursor.execute(mig_sql)
                    print(f"  [OK] {mig_name} applied successfully.")

        # 6. Verify and Log Database Objects
        verify_database_state(conn)

        print("\n" + "=" * 70)
        print("[SUCCESS] ALL DATABASE MIGRATIONS COMPLETED SUCCESSFULLY!")
        print("=" * 70)

    except Exception as exc:
        print(f"\n[ERROR] Migration execution failed: {exc}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()
            print("[*] Database connection closed.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Supabase PostgreSQL migrations")
    parser.add_argument(
        "--schema-path", 
        type=str, 
        default=None, 
        help="Custom path to schema.sql file"
    )
    parser.add_argument(
        "--skip-migrations-dir", 
        action="store_true", 
        help="Skip applying files in supabase/migrations/ directory"
    )
    args = parser.parse_args()

    run_migrations(
        schema_path=args.schema_path,
        skip_migrations_dir=args.skip_migrations_dir
    )
