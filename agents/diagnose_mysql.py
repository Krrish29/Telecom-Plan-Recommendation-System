#!/usr/bin/env python
"""Check MySQL connectivity without hanging"""

import socket
import subprocess
import os

print("=" * 70)
print("MySQL CONNECTIVITY DIAGNOSTIC")
print("=" * 70)

# 1. Check if port 3306 is open
print("\n[1] Checking if MySQL port 3306 is listening...")
try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(2)
    result = sock.connect_ex(('127.0.0.1', 3306))
    sock.close()
    
    if result == 0:
        print("    [✓] Port 3306 is OPEN - MySQL is accessible")
    else:
        print("    [✗] Port 3306 is CLOSED - MySQL not accessible on this port")
except Exception as e:
    print(f"    [✗] Error checking port: {e}")

# 2. Try MySQL command line client
print("\n[2] Trying mysql.exe command-line client...")
try:
    result = subprocess.run(
        ['mysql', '-h', 'localhost', '-u', 'root', '-p29March2004#', 
         '-e', 'SELECT 1'],
        capture_output=True,
        text=True,
        timeout=5
    )
    if result.returncode == 0:
        print("    [✓] mysql.exe connected successfully!")
        print(f"    Output: {result.stdout}")
    else:
        print(f"    [✗] mysql.exe failed:")
        print(f"    {result.stderr}")
except FileNotFoundError:
    print("    [!] mysql.exe not found in PATH")
except subprocess.TimeoutExpired:
    print("    [✗] Command timed out - MySQL may be hanging")
except Exception as e:
    print(f"    [✗] Error: {e}")

# 3. Try with different host names
print("\n[3] Testing different connection hosts...")
import mysql.connector

hosts_to_test = [
    ('127.0.0.1', 'IP address (127.0.0.1)'),
    ('localhost', 'Localhost name'),
]

for host, label in hosts_to_test:
    print(f"\n    Testing {label}...")
    try:
        conn = mysql.connector.connect(
            host=host,
            user="root",
            password="29March2004#",
            database="telecom_db",
            connection_timeout=3,
            autocommit=True
        )
        print(f"      [✓] SUCCESS on {host}")
        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE()")
        db_name = cursor.fetchone()[0]
        print(f"      Database: {db_name}")
        cursor.close()
        conn.close()
        break
    except Exception as e:
        print(f"      [✗] Failed: {str(e)[:100]}")

print("\n" + "=" * 70)
