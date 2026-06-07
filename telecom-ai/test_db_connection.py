#!/usr/bin/env python
"""Test database connection script with detailed diagnostics"""
import sys

print("=" * 70)
print("DATABASE CONNECTION DIAGNOSTIC TEST")
print("=" * 70)

# Step 1: Check imports
try:
    from db import get_connection
    print("\n[✓] Step 1: Importing get_connection... OK")
except Exception as e:
    print(f"\n[✗] Step 1: Import failed: {e}")
    sys.exit(1)

# Step 2: Check environment variables
try:
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    print("\n[✓] Step 2: Environment check:")
    print(f"  - DB_HOST: {os.getenv('DB_HOST', 'localhost')}")
    print(f"  - DB_PORT: {os.getenv('DB_PORT', '3306')}")
    print(f"  - DB_USER: {os.getenv('DB_USER', 'root')}")
    print(f"  - DB_NAME: {os.getenv('DB_NAME', 'telecom_db')}")
    print(f"  - DB_PASSWORD: {'*' * len(os.getenv('DB_PASSWORD', ''))}")
except Exception as e:
    print(f"\n[✗] Step 2: Environment check failed: {e}")
    sys.exit(1)

# Step 3: Try MySQL connection
print("\n[...] Step 3: Attempting MySQL connection...")
try:
    import mysql.connector
    print("  - mysql.connector imported OK")
    
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="29March2004#",
        database="telecom_db",
        connection_timeout=5
    )
    print("  [✓] MySQL connection successful!")
    
except mysql.connector.Error as err:
    if err.errno == 2003:
        print(f"  [✗] ERROR: Cannot connect to MySQL server")
        print(f"      Is MySQL running on localhost:3306?")
        print(f"      Full error: {err}")
    elif err.errno == 1045:
        print(f"  [✗] ERROR: Access denied (wrong credentials)")
        print(f"      Full error: {err}")
    elif err.errno == 1049:
        print(f"  [✗] ERROR: Unknown database 'telecom_db'")
        print(f"      Full error: {err}")
    else:
        print(f"  [✗] MySQL Error {err.errno}: {err.msg}")
    sys.exit(1)
except Exception as e:
    print(f"  [✗] Connection error: {type(e).__name__}: {e}")
    sys.exit(1)

# Step 4: Check tables
print("\n[...] Step 4: Checking tables...")
try:
    cursor = conn.cursor()
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    print(f"  [✓] Found {len(tables)} tables:")
    for table in tables:
        print(f"      - {table[0]}")
except Exception as e:
    print(f"  [✗] Error checking tables: {e}")
    sys.exit(1)

# Step 5: Query users table
print("\n[...] Step 5: Querying users table...")
try:
    cursor.execute("SELECT * FROM users LIMIT 5")
    rows = cursor.fetchall()
    print(f"  [✓] Found {len(rows)} user records")
    if rows:
        print(f"\n  Sample data:")
        for i, row in enumerate(rows, 1):
            print(f"    Row {i}: {row}")
    else:
        print(f"  (Table is empty)")
except Exception as e:
    print(f"  [✗] Error querying users: {e}")
    sys.exit(1)

# Cleanup
cursor.close()
conn.close()

print("\n" + "=" * 70)
print("[✓] ALL TESTS PASSED - Database connection is working!")
print("=" * 70)
