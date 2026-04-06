#!/usr/bin/env python3
"""Seed PostgreSQL from data/work_tickets.csv.

Reads the pre-parsed CSV and inserts into the work_tickets table.
Requires DATABASE_URL env var.

Usage:
    DATABASE_URL=... python seed.py --reset
    DATABASE_URL=... python seed.py --reset --prod
"""

import argparse
import os
import sys
import time

import pandas as pd
import psycopg2
from dotenv import load_dotenv

load_dotenv()


CREATE_TABLE = '''CREATE TABLE IF NOT EXISTS work_tickets (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL,
    product_code TEXT NOT NULL,
    part_name TEXT,
    material TEXT,
    processes TEXT,
    process_count INTEGER DEFAULT 0
)'''

CREATE_INDEXES = [
    'CREATE INDEX IF NOT EXISTS idx_wt_category ON work_tickets(category)',
    'CREATE INDEX IF NOT EXISTS idx_wt_product_code ON work_tickets(product_code)',
]


def seed_database(database_url: str, df: pd.DataFrame, reset: bool = False):
    """Insert CSV data into a PostgreSQL database."""
    display_url = database_url.split('@')[1] if '@' in database_url else database_url
    print(f"\nConnecting to: {display_url}")

    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    if reset:
        print("Resetting: dropping and recreating work_tickets table")
        cur.execute('DROP TABLE IF EXISTS work_tickets')

    cur.execute(CREATE_TABLE)
    for idx_sql in CREATE_INDEXES:
        cur.execute(idx_sql)

    if reset:
        cur.execute('DELETE FROM work_tickets')

    conn.commit()

    start = time.time()
    for _, row in df.iterrows():
        cur.execute(
            'INSERT INTO work_tickets (category, product_code, part_name, material, processes, process_count) '
            'VALUES (%s, %s, %s, %s, %s, %s)',
            (row['category'], row['product_code'], row.get('part_name'),
             row.get('material'), row.get('processes'), int(row.get('process_count', 0)))
        )
    conn.commit()

    cur.execute('SELECT COUNT(*) FROM work_tickets')
    total = cur.fetchone()[0]
    print(f"Inserted {len(df)} rows in {time.time() - start:.1f}s (total in table: {total})")

    cur.close()
    conn.close()


def main():
    parser = argparse.ArgumentParser(description='Seed PostgreSQL from data/work_tickets.csv')
    parser.add_argument('--reset', action='store_true',
                        help='Drop and recreate work_tickets table before inserting')
    parser.add_argument('--local', action='store_true',
                        help='Seed local DATABASE_URL')
    parser.add_argument('--prod', action='store_true',
                        help='Seed PROD_DATABASE_URL')
    parser.add_argument('--csv', type=str, default='data/work_tickets.csv',
                        help='Path to CSV file (default: data/work_tickets.csv)')
    args = parser.parse_args()

    if not args.local and not args.prod:
        print("ERROR: specify at least one of --local or --prod", file=sys.stderr)
        sys.exit(1)

    local_url = os.environ.get('DATABASE_URL')
    prod_url = os.environ.get('PROD_DATABASE_URL')

    if args.local and not local_url:
        print("ERROR: DATABASE_URL env var is required for --local", file=sys.stderr)
        sys.exit(1)

    if args.prod and not prod_url:
        print("ERROR: PROD_DATABASE_URL env var is required for --prod", file=sys.stderr)
        sys.exit(1)

    if not os.path.exists(args.csv):
        print(f"ERROR: {args.csv} not found. Run parts_importer.py first.", file=sys.stderr)
        sys.exit(1)

    print(f"Reading {args.csv}...")
    df = pd.read_csv(args.csv)
    print(f"Loaded {len(df)} rows")

    if args.local:
        print("\n--- Seeding local database ---")
        seed_database(local_url, df, reset=args.reset)

    if args.prod:
        print("\n--- Seeding prod database ---")
        seed_database(prod_url, df, reset=args.reset)

    print("\nDone!")


if __name__ == "__main__":
    main()
