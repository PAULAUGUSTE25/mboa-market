#!/usr/bin/env python3
"""
Deprecated, unsafe database migration prototype.

It copied rows without preserving all constraints, indexes, and schema metadata.
Use migrate_render_to_neon.py, which preserves PostgreSQL schema objects and verifies
every public table before production is switched.
"""

import os
import sys
import asyncio
from datetime import datetime
import asyncpg

async def get_table_names(conn):
    """Get all table names in the database"""
    query = """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    """
    rows = await conn.fetch(query)
    return [row['table_name'] for row in rows]

async def copy_table_data(render_conn, neon_conn, table_name):
    """Copy data from Render to Neon for a specific table"""
    print(f"  Copying {table_name}...")

    # Get column names
    columns_query = f"""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = '{table_name}'
        AND table_schema = 'public'
        ORDER BY ordinal_position
    """
    render_columns = await render_conn.fetch(columns_query)
    column_names = [col['column_name'] for col in render_columns]

    if not column_names:
        print(f"    WARNING: No columns found for {table_name}")
        return 0

    columns_str = ', '.join(column_names)
    placeholders = ', '.join(['$' + str(i+1) for i in range(len(column_names))])

    # Read from Render
    select_query = f"SELECT {columns_str} FROM {table_name}"
    render_rows = await render_conn.fetch(select_query)

    if not render_rows:
        print(f"    INFO: {table_name} is empty")
        return 0

    # Write to Neon
    insert_query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"

    # Insert data in batches
    batch_size = 1000
    inserted = 0

    for i in range(0, len(render_rows), batch_size):
        batch = render_rows[i:i + batch_size]
        for row in batch:
            values = [row[col] for col in column_names]
            await neon_conn.execute(insert_query, *values)
            inserted += 1

        if (i + batch_size) % 5000 == 0:
            print(f"    Progress: {inserted}/{len(render_rows)} rows")

    print(f"    Copied {inserted} rows")
    return inserted

async def migrate_sequences(render_conn, neon_conn):
    """Reset sequences to match max IDs"""
    print("Resetting sequences...")

    sequences_query = """
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
    """
    render_sequences = await render_conn.fetch(sequences_query)

    for seq in render_sequences:
        seq_name = seq['sequence_name']
        try:
            # Get last value from Render
            last_val = await render_conn.fetchval(f"SELECT last_value FROM {seq_name}")

            # Set in Neon
            await neon_conn.execute(f"SELECT setval('{seq_name}', {last_val}, true)")
            print(f"  Sequence {seq_name} reset to {last_val}")
        except Exception as e:
            print(f"  WARNING: Could not reset sequence {seq_name}: {e}")

async def create_schema_from_render(render_conn, neon_conn):
    """Create table schema in Neon by copying from Render"""
    print("Creating schema in Neon from Render...")

    # Get all tables
    tables = await get_table_names(render_conn)

    for table in tables:
        if table in ['alembic_version']:
            print(f"  Skipping {table}")
            continue

        print(f"  Creating table {table}...")

        # Get column definitions
        columns_query = f"""
            SELECT column_name, data_type,
                   character_maximum_length,
                   is_nullable,
                   column_default,
                   ordinal_position
            FROM information_schema.columns
            WHERE table_name = '{table}'
            AND table_schema = 'public'
            ORDER BY ordinal_position
        """

        columns = await render_conn.fetch(columns_query)

        if not columns:
            print(f"    No columns found for {table}")
            continue

        # Build CREATE TABLE statement
        col_defs = []
        for col in columns:
            col_def = f"{col['column_name']} {col['data_type']}"
            if col['character_maximum_length']:
                col_def += f"({col['character_maximum_length']})"
            if col['is_nullable'] == 'NO':
                col_def += " NOT NULL"
            if col['column_default']:
                col_def += f" DEFAULT {col['column_default']}"
            col_defs.append(col_def)

        create_stmt = f"CREATE TABLE IF NOT EXISTS {table} ({', '.join(col_defs)})"

        try:
            await neon_conn.execute(create_stmt)
            print(f"    Created {table}")
        except Exception as e:
            print(f"    ERROR creating {table}: {e}")
            # Continue anyway, table might exist or we'll handle later

async def main():
    print(
        "This prototype does not preserve all PostgreSQL schema objects. "
        "Use migrate_render_to_neon.py instead."
    )
    sys.exit(2)

    print(
        "This prototype does not preserve all PostgreSQL schema objects. "
        "Use migrate_render_to_neon.py instead."
    )
    sys.exit(2)

    print("=" * 60)
    print("MBOA Market Database Migration: Render to Neon")
    print("=" * 60)

    # Get database URLs
    render_url = os.getenv("RENDER_DATABASE_URL")
    neon_url = os.getenv("NEON_DATABASE_URL")

    if not render_url:
        print("ERROR: RENDER_DATABASE_URL environment variable not set")
        print("   Example: set RENDER_DATABASE_URL=postgresql://<redacted>@host:5432/db")
        sys.exit(1)

    if not neon_url:
        print("ERROR: NEON_DATABASE_URL environment variable not set")
        print("   Example: set NEON_DATABASE_URL=postgresql://<redacted>@host:5432/db")
        sys.exit(1)

    # Fix URLs for asyncpg
    if render_url.startswith("postgresql://"):
        render_url = render_url.replace("postgresql://", "postgresql://", 1)
        if "?" in render_url:
            render_url = render_url.split("?")[0]
    if neon_url.startswith("postgresql://"):
        neon_url = neon_url.replace("postgresql://", "postgresql://", 1)
        if "?" in neon_url:
            neon_url = neon_url.split("?")[0]

    print(f"\nSource: {render_url.split('@')[1] if '@' in render_url else 'Render'}")
    print(f"Target: {neon_url.split('@')[1] if '@' in neon_url else 'Neon'}")

    try:
        # Connect to databases
        print("\nConnecting to databases...")
        render_conn = await asyncpg.connect(render_url)
        neon_conn = await asyncpg.connect(neon_url)
        print("Connected to both databases")

        # Get tables
        print("\nGetting table list...")
        tables = await get_table_names(render_conn)
        print(f"Found {len(tables)} tables: {', '.join(tables)}")

        # Copy data
        print("\nStarting data migration...")
        total_rows = 0

        for table in tables:
            if table in ['alembic_version']:  # Skip migration tracking
                print(f"  Skipping {table}")
                continue
            rows = await copy_table_data(render_conn, neon_conn, table)
            total_rows += rows

        print(f"\nMigration complete! Total rows copied: {total_rows}")

        # Reset sequences
        await migrate_sequences(render_conn, neon_conn)

        # Close connections
        await render_conn.close()
        await neon_conn.close()

        print("\n" + "=" * 60)
        print("Migration successful!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Update DATABASE_URL in Vercel to NEON_DATABASE_URL")
        print("2. Deploy backend to Vercel")
        print("3. Test the application")
        print("4. If everything works, you can delete the Render database")

    except Exception as e:
        print(f"\nMigration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
