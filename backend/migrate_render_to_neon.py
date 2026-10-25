#!/usr/bin/env python3
"""
Migrate database from Render PostgreSQL to Neon (Vercel Postgres)

Usage:
1. Set RENDER_DATABASE_URL environment variable (your Render database)
2. Set NEON_DATABASE_URL environment variable (your Neon database)
3. Run: python migrate_render_to_neon.py

Requirements:
- PostgreSQL client tools (pg_dump, pg_restore) or psycopg2
"""

import os
import sys
import subprocess
from datetime import datetime

def check_dependencies():
    """Check if required tools are installed"""
    try:
        subprocess.run(["pg_dump", "--version"], capture_output=True, check=True)
        print("✅ pg_dump found")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ pg_dump not found. Install PostgreSQL client tools")
        print("   Windows: choco install postgresql")
        print("   macOS: brew install postgresql")
        print("   Linux: sudo apt-get install postgresql-client")
        return False

    try:
        subprocess.run(["pg_restore", "--version"], capture_output=True, check=True)
        subprocess.run(["psql", "--version"], capture_output=True, check=True)
        print("✅ PostgreSQL client tools found")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ pg_restore not found. Install PostgreSQL client tools")
        return False

    return True

def export_from_render():
    """Export database from Render"""
    render_url = os.getenv("RENDER_DATABASE_URL")
    if not render_url:
        print("❌ RENDER_DATABASE_URL environment variable not set")
        return None

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"render_backup_{timestamp}.dump"

    print(f"📦 Exporting from Render to {backup_file}...")

    cmd = [
        "pg_dump",
        render_url,
        "--no-owner",
        "--no-acl",
        "--format=custom",
        "--compress=0",
        f"--file={backup_file}"
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"✅ Export successful: {backup_file}")
        return backup_file
    except subprocess.CalledProcessError:
        print("❌ Export failed. Check the source URL and PostgreSQL permissions.")
        return None


def _psql(url, query):
    return subprocess.run(
        ["psql", url, "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-c", query],
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()


def get_table_counts(database_url):
    """Return exact row counts for every public table without printing connection details."""
    tables = _psql(
        database_url,
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename",
    ).splitlines()
    counts = {}
    for table in tables:
        safe_name = table.replace('"', '""')
        count = _psql(database_url, f'SELECT count(*) FROM public."{safe_name}"')
        counts[table] = int(count)
    return counts


def import_to_neon(backup_file):
    """Import database to Neon"""
    neon_url = os.getenv("NEON_DATABASE_URL")
    if not neon_url:
        print("❌ NEON_DATABASE_URL environment variable not set")
        return False

    try:
        existing_tables = _psql(
            neon_url,
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public' LIMIT 1",
        )
    except subprocess.CalledProcessError:
        print("❌ Could not connect to the Neon database.")
        return False
    if existing_tables:
        print("❌ Target database is not empty; import stopped without changing it.")
        return False

    print(f"📥 Importing to Neon from {backup_file}...")

    cmd = [
        "pg_restore",
        "--no-owner",
        "--no-acl",
        "--exit-on-error",
        "--single-transaction",
        f"--dbname={neon_url}",
        backup_file
    ]

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("✅ Import successful")
        return True
    except subprocess.CalledProcessError:
        print("❌ Import failed. The target transaction was rolled back.")
        return False

def verify_migration():
    """Compare every public table and row count on the source and destination."""
    render_url = os.getenv("RENDER_DATABASE_URL")
    neon_url = os.getenv("NEON_DATABASE_URL")
    if not render_url or not neon_url:
        print("❌ Both database URL environment variables are required for verification.")
        return False

    print("🔍 Comparing public table row counts...")
    try:
        source_counts = get_table_counts(render_url)
        target_counts = get_table_counts(neon_url)
    except (subprocess.CalledProcessError, ValueError):
        print("❌ Verification failed while querying table counts.")
        return False
    if source_counts != target_counts:
        missing = sorted(set(source_counts) - set(target_counts))
        extra = sorted(set(target_counts) - set(source_counts))
        mismatched = sorted(
            table for table in source_counts.keys() & target_counts.keys()
            if source_counts[table] != target_counts[table]
        )
        print(f"❌ Counts differ. Missing tables: {missing}; extra tables: {extra}; mismatches: {mismatched}")
        return False
    print(f"✅ {len(source_counts)} public tables match by exact row count.")
    return True

def main():
    print("=" * 60)
    print("MBOA Market Database Migration: Render → Neon")
    print("=" * 60)

    # Check dependencies
    if not check_dependencies():
        sys.exit(1)

    source_url = os.getenv("RENDER_DATABASE_URL")
    target_url = os.getenv("NEON_DATABASE_URL")
    if not source_url or not target_url:
        print("\n❌ Set RENDER_DATABASE_URL and NEON_DATABASE_URL in the local environment.")
        print("   Use direct PostgreSQL URLs; do not paste them into source code or chat.")
        sys.exit(1)

    # Export from Render
    backup_file = export_from_render()
    if not backup_file:
        sys.exit(1)

    # Import to Neon
    if not import_to_neon(backup_file):
        sys.exit(1)

    # Verify every table before changing the Vercel DATABASE_URL.
    if not verify_migration():
        print("❌ Verification failed. Keep the source database and do not switch production.")
        sys.exit(1)
    else:
        print("✅ Migration and row-count verification completed.")

    print("\n📝 Next steps:")
    print("1. Set the Neon pooled connection URL as DATABASE_URL in Vercel.")
    print("2. Apply the repository database migration, then test the application.")
    print("3. Keep Render and the local backup until production validation is complete.")
    print(f"4. Backup file retained at: {backup_file}")

if __name__ == "__main__":
    main()
