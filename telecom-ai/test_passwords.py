#!/usr/bin/env python
"""Test both possible MySQL passwords"""

import mysql.connector

passwords_to_test = [
    "29March2004#",      # Current hardcoded in db.py
    "Root@12345",        # From .env.example
]

print("Testing MySQL passwords...")
print("-" * 70)

for pwd in passwords_to_test:
    print(f"\nTrying password: {pwd}")
    try:
        conn = mysql.connector.connect(
            host="127.0.0.1",  # Use IP instead of localhost
            user="root",
            password=pwd,
            database="telecom_db",
            connection_timeout=3,
            autocommit=True,
            use_pure=True  # Use pure Python implementation
        )
        print(f"✓ SUCCESS with password: {pwd}")
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users LIMIT 5")
        rows = cursor.fetchall()
        print(f"  Found {len(rows)} rows in users table")
        cursor.close()
        conn.close()
        break
    except mysql.connector.Error as e:
        print(f"✗ Failed: {e.msg if hasattr(e, 'msg') else str(e)}")
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {str(e)[:80]}")
