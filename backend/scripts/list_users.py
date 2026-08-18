#!/usr/bin/env python3
"""Simple CLI to list recent users from the MongoDB used by the backend.

Usage: python backend/scripts/list_users.py --days 7 --limit 50
"""
import os
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient
import argparse


def main():
    load_dotenv()
    mongo_url = os.environ.get("MONGO_URL")
    db_name = os.environ.get("DB_NAME")
    if not mongo_url or not db_name:
        print("Please set MONGO_URL and DB_NAME in the environment or .env file")
        return
    parser = argparse.ArgumentParser()
    parser.add_argument("--days", type=int, default=7, help="Number of days back to show users")
    parser.add_argument("--limit", type=int, default=100, help="Max number of users to print")
    args = parser.parse_args()

    client = MongoClient(mongo_url)
    db = client[db_name]
    cutoff = datetime.now(timezone.utc) - timedelta(days=args.days)
    cursor = db.users.find({"created_at": {"$gte": cutoff}}, {"_id": 0, "password_hash": 0}).sort("created_at", -1)
    users = list(cursor.limit(args.limit))
    if not users:
        print("No users found")
        return
    for u in users:
        ca = u.get("created_at")
        if isinstance(ca, str):
            try:
                ca = datetime.fromisoformat(ca)
            except Exception:
                pass
        print(f"{u.get('user_id')} | {u.get('email')} | {u.get('name')} | created_at={ca} | role={u.get('role')}")


if __name__ == '__main__':
    main()
