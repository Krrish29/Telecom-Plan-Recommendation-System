#!/usr/bin/env python
"""Test fixed database connection"""

from db import get_connection

print("Testing fixed database connection...")

try:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users LIMIT 5")
    rows = cursor.fetchall()
    
    print(f"\n✓ SUCCESS! Found {len(rows)} rows:\n")
    for row in rows:
        print(row)
    
    cursor.close()
    conn.close()
    print("\n✓ Connection closed successfully")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
