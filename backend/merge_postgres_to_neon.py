"""Safely append rows from an existing PostgreSQL database into Neon."""

import argparse
import asyncio
import hashlib
import json
import os
import ssl
from collections import defaultdict, deque
from urllib.parse import parse_qsl, urlsplit

import asyncpg


def _connection_options(database_url: str) -> dict:
    normalized_url = database_url.replace("postgresql+asyncpg://", "postgresql://", 1)
    parts = urlsplit(normalized_url)
    if parts.scheme not in {"postgres", "postgresql"} or not parts.hostname:
        raise ValueError("A valid PostgreSQL URL is required.")

    query = dict(parse_qsl(parts.query))
    host = parts.hostname.lower()
    options = {
        "host": parts.hostname,
        "port": parts.port or 5432,
        "user": parts.username,
        "password": parts.password,
        "database": parts.path.lstrip("/"),
        "timeout": 10,
        "command_timeout": 60,
        "statement_cache_size": 0,
    }
    if host not in {"localhost", "127.0.0.1"}:
        options["ssl"] = ssl.create_default_context()
    elif query.get("sslmode") in {"require", "verify-ca", "verify-full"}:
        options["ssl"] = ssl.create_default_context()
    return options


def _quote_identifier(identifier: str) -> str:
    return '"' + identifier.replace('"', '""') + '"'


def _row_hash(record: asyncpg.Record) -> bytes:
    contents = json.dumps(dict(record), sort_keys=True, default=str, separators=(",", ":"))
    return hashlib.sha256(contents.encode("utf-8")).digest()


def _key_value(record: asyncpg.Record, columns: list[str]) -> tuple[str, ...]:
    return tuple(
        json.dumps(record[column], sort_keys=True, default=str, separators=(",", ":"))
        for column in columns
    )


async def _table_names(connection: asyncpg.Connection) -> set[str]:
    rows = await connection.fetch(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    )
    return {row["tablename"] for row in rows}


async def _column_definitions(connection: asyncpg.Connection, table: str) -> list[tuple]:
    rows = await connection.fetch(
        """
        SELECT column_name, data_type, udt_name, is_nullable,
               character_maximum_length, numeric_precision, numeric_scale,
               is_generated, identity_generation
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
        """,
        table,
    )
    return [tuple(row.values()) for row in rows]


async def _unique_indexes(connection: asyncpg.Connection) -> dict[tuple[str, str], dict]:
    rows = await connection.fetch(
        """
        SELECT t.relname AS table_name, ix.relname AS index_name,
               i.indisprimary AS is_primary,
               i.indpred IS NOT NULL AS is_partial,
               bool_or(a.attname IS NULL)
                   FILTER (WHERE k.ord <= i.indnkeyatts) AS has_expression,
               array_agg(a.attname ORDER BY k.ord)
                   FILTER (WHERE k.ord <= i.indnkeyatts) AS columns
        FROM pg_index i
        JOIN pg_class t ON t.oid = i.indrelid
        JOIN pg_class ix ON ix.oid = i.indexrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY k(attnum, ord)
        LEFT JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
        WHERE n.nspname = 'public' AND i.indisunique
        GROUP BY t.relname, ix.relname, i.indisprimary, i.indpred
        ORDER BY t.relname, ix.relname
        """
    )
    return {
        (row["table_name"], row["index_name"]): {
            "columns": list(row["columns"] or []),
            "is_primary": row["is_primary"],
            "is_partial": row["is_partial"],
            "has_expression": row["has_expression"],
        }
        for row in rows
    }


async def _foreign_key_order(
    connection: asyncpg.Connection,
    source_tables: set[str],
) -> list[str]:
    rows = await connection.fetch(
        """
        SELECT tc.table_name AS child, ccu.table_name AS parent
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
         AND ccu.constraint_schema = tc.constraint_schema
        WHERE tc.constraint_schema = 'public'
          AND tc.constraint_type = 'FOREIGN KEY'
        """
    )
    children: dict[str, set[str]] = defaultdict(set)
    indegree = {table: 0 for table in source_tables}
    for row in rows:
        child, parent = row["child"], row["parent"]
        if child not in source_tables or parent not in source_tables or child == parent:
            continue
        if child not in children[parent]:
            children[parent].add(child)
            indegree[child] += 1

    ready = deque(sorted(table for table, degree in indegree.items() if degree == 0))
    ordered = []
    while ready:
        table = ready.popleft()
        ordered.append(table)
        for child in sorted(children[table]):
            indegree[child] -= 1
            if indegree[child] == 0:
                ready.append(child)

    if len(ordered) != len(source_tables):
        cyclic = sorted(source_tables - set(ordered))
        raise RuntimeError(f"Foreign-key cycle prevents a safe append: {cyclic}")
    return ordered


async def _check_unique_collisions(
    source: asyncpg.Connection,
    target: asyncpg.Connection,
    source_indexes: dict[tuple[str, str], dict],
) -> None:
    target_indexes = await _unique_indexes(target)
    conflicts = []
    for index_key, source_index in source_indexes.items():
        table, index_name = index_key
        target_index = target_indexes.get(index_key)
        if target_index != source_index:
            raise RuntimeError(f"Unique index mismatch on {table}.{index_name}.")
        if source_index["is_partial"] or source_index["has_expression"]:
            raise RuntimeError(f"Unsupported partial or expression index on {table}.{index_name}.")

        columns = source_index["columns"]
        if not columns:
            raise RuntimeError(f"Could not read unique-index columns for {table}.{index_name}.")

        quoted_table = _quote_identifier(table)
        quoted_columns = ", ".join(_quote_identifier(column) for column in columns)
        not_null = " AND ".join(f"{_quote_identifier(column)} IS NOT NULL" for column in columns)
        query = (
            f"SELECT {quoted_columns} FROM public.{quoted_table} "
            f"WHERE {not_null}"
        )
        source_keys = {
            _key_value(row, columns) for row in await source.fetch(query)
        }
        target_keys = {
            _key_value(row, columns) for row in await target.fetch(query)
        }
        overlap = len(source_keys & target_keys)
        if overlap:
            conflicts.append(f"{table}.{index_name} ({overlap})")

    if conflicts:
        raise RuntimeError(f"Existing unique values would collide: {', '.join(conflicts)}")


async def _validate_schema(
    source: asyncpg.Connection,
    target: asyncpg.Connection,
    source_tables: set[str],
    target_tables: set[str],
) -> None:
    missing = sorted(source_tables - target_tables)
    if missing:
        raise RuntimeError(f"Target is missing source tables: {missing}")

    for table in sorted(source_tables):
        source_columns = await _column_definitions(source, table)
        target_columns = await _column_definitions(target, table)
        if source_columns != target_columns:
            raise RuntimeError(f"Column definitions differ for table {table}.")

    source_indexes = await _unique_indexes(source)
    target_indexes = await _unique_indexes(target)
    source_indexes = {
        key: value for key, value in source_indexes.items() if key[0] in source_tables
    }
    target_shared_indexes = {
        key: value for key, value in target_indexes.items() if key[0] in source_tables
    }
    if source_indexes != target_shared_indexes:
        raise RuntimeError("Unique indexes differ between source and target.")

    await _check_unique_collisions(source, target, source_indexes)


async def _merge(dry_run: bool) -> None:
    source_url = os.environ.get("MIGRATION_SOURCE_DATABASE_URL")
    target_url = os.environ.get("MIGRATION_TARGET_DATABASE_URL")
    if not source_url or not target_url:
        raise RuntimeError(
            "Set MIGRATION_SOURCE_DATABASE_URL and MIGRATION_TARGET_DATABASE_URL locally."
        )

    source = await asyncpg.connect(**_connection_options(source_url))
    target = await asyncpg.connect(**_connection_options(target_url))
    try:
        async with source.transaction(isolation="repeatable_read", readonly=True):
            source_tables = await _table_names(source)
            target_tables = await _table_names(target)
            await _validate_schema(source, target, source_tables, target_tables)
            ordered_tables = await _foreign_key_order(source, source_tables)

            source_counts = {}
            for table in ordered_tables:
                source_counts[table] = await source.fetchval(
                    f"SELECT count(*) FROM public.{_quote_identifier(table)}"
                )
            total_rows = sum(source_counts.values())
            print(
                f"Preflight passed: {len(source_tables)} source tables, "
                f"{total_rows} source rows, unique keys do not collide."
            )
            if dry_run:
                print("Dry run only; no database changes were made.")
                return

            async with target.transaction(isolation="repeatable_read"):
                target_counts = {}
                for table in ordered_tables:
                    target_counts[table] = await target.fetchval(
                        f"SELECT count(*) FROM public.{_quote_identifier(table)}"
                    )

                imported = {}
                for table in ordered_tables:
                    quoted_table = _quote_identifier(table)
                    columns = await _column_definitions(source, table)
                    column_names = [column[0] for column in columns]
                    insert_columns = [
                        column[0] for column in columns if column[7] == "NEVER"
                    ]
                    if len(insert_columns) != len(column_names):
                        raise RuntimeError(
                            f"Generated columns need manual review in table {table}."
                        )

                    records = await source.fetch(
                        f"SELECT * FROM public.{quoted_table}"
                    )
                    imported[table] = records
                    if records:
                        await target.copy_records_to_table(
                            table,
                            schema_name="public",
                            records=[
                                tuple(record[column] for column in insert_columns)
                                for record in records
                            ],
                            columns=insert_columns,
                        )

                    print(f"Appended {len(records)} rows from {table}.")

                primary_indexes = {
                    key[0]: value["columns"]
                    for key, value in (await _unique_indexes(source)).items()
                    if value["is_primary"]
                }
                for table, source_records in imported.items():
                    if not source_records:
                        continue
                    primary_key = primary_indexes.get(table)
                    if not primary_key:
                        raise RuntimeError(f"Table {table} has no primary key for verification.")

                    quoted_table = _quote_identifier(table)
                    key_set = {_key_value(record, primary_key) for record in source_records}
                    target_records = await target.fetch(
                        f"SELECT * FROM public.{quoted_table}"
                    )
                    by_key = {_key_value(record, primary_key): record for record in target_records}
                    if any(key not in by_key for key in key_set):
                        raise RuntimeError(f"Imported rows are missing from table {table}.")
                    for source_record in source_records:
                        key = _key_value(source_record, primary_key)
                        if _row_hash(source_record) != _row_hash(by_key[key]):
                            raise RuntimeError(f"Imported row verification failed for table {table}.")

                    actual_count = await target.fetchval(
                        f"SELECT count(*) FROM public.{quoted_table}"
                    )
                    expected_count = target_counts[table] + source_counts[table]
                    if actual_count != expected_count:
                        raise RuntimeError(f"Row-count verification failed for table {table}.")

            print(
                f"Merge committed and verified: {total_rows} rows appended "
                f"across {len(source_tables)} tables. Existing target rows were preserved."
            )
    finally:
        await source.close()
        await target.close()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Append source rows to Neon in a transaction; default is a read-only dry run.",
    )
    args = parser.parse_args()
    try:
        asyncio.run(_merge(dry_run=not args.apply))
    except Exception as exc:
        print(f"Migration stopped without committing: {type(exc).__name__}: {exc}")
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
