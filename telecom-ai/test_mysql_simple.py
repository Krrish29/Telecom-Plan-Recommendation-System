#!/usr/bin/env python
"""Simple MySQL connection test"""

import mysql.connector
from mysql.connector import Error

print("Attempting to connect to MySQL...")
print("Host: localhost")
print("User: root")
print("Password: 29March2004#")
print("Database: telecom_db")
print()

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="29March2004#",
        database="telecom_db",
        connection_timeout=5
    )
    print("[SUCCESS] Connected to MySQL!")
    conn.close()
except Error as e:
    print(f"[ERROR] {e}")
    print()
    if e.errno == 2003:
        print("ERROR TYPE: Connection refused")
        print("CAUSE: MySQL server is not running on localhost:3306")
        print("SOLUTION: Start MySQL server")
    elif e.errno == 1045:
        print("ERROR TYPE: Access denied")
        print("CAUSE: Wrong username or password")
    elif e.errno == 1049:
        print("ERROR TYPE: Unknown database")
        print("CAUSE: Database 'telecom_db' does not exist")
