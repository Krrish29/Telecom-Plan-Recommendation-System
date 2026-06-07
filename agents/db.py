"""
db.py — MySQL database connection, schema creation, and data seeding
for the Telecom AI Multi-Agent Intelligence Platform.
"""

import os
import random
import math
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     int(os.getenv("DB_PORT", 3306)),
    "user":     os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "29March2004#"),
    "database": os.getenv("DB_NAME", "telecom_db"),
}


def get_connection():

    conn = mysql.connector.connect(
        host="127.0.0.1",  # Use IP instead of localhost (Windows fix)
        user="root",
        password="29March2004#",
        database="telecom_db",
        connection_timeout=5,
        use_pure=True,  # Use pure Python implementation
        autocommit=True
    )

    print("MySQL Connected")

    return conn


def init_db():
    """Create all tables if they don't exist."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id       INT AUTO_INCREMENT PRIMARY KEY,
            name          VARCHAR(100),
            email         VARCHAR(150) UNIQUE,
            age           INT,
            gender        ENUM('Male','Female','Other'),
            location      VARCHAR(100),
            tenure_months INT DEFAULT 0,
            created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS mobile_plans (
            plan_id      INT AUTO_INCREMENT PRIMARY KEY,
            plan_name    VARCHAR(100),
            plan_type    VARCHAR(50),
            monthly_cost DECIMAL(8,2),
            data_gb      DECIMAL(6,2),
            call_minutes INT,
            sms_count    INT,
            features     TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_usage (
            usage_id        INT AUTO_INCREMENT PRIMARY KEY,
            user_id         INT,
            plan_id         INT,
            month           VARCHAR(20),
            data_used_gb    DECIMAL(6,2),
            call_minutes    INT,
            sms_sent        INT,
            roaming_minutes INT DEFAULT 0,
            recorded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id)  REFERENCES users(user_id),
            FOREIGN KEY (plan_id)  REFERENCES mobile_plans(plan_id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            payment_id   INT AUTO_INCREMENT PRIMARY KEY,
            user_id      INT,
            amount       DECIMAL(8,2),
            due_date     DATE,
            paid_date    DATE,
            status       ENUM('Paid','Late','Missed') DEFAULT 'Paid',
            complaints   INT DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS churn_analysis (
            churn_id        INT AUTO_INCREMENT PRIMARY KEY,
            user_id         INT UNIQUE,
            churn_score     DECIMAL(5,4),
            risk_level      ENUM('High','Medium','Low'),
            churn_reason    TEXT,
            last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendations (
            rec_id              INT AUTO_INCREMENT PRIMARY KEY,
            user_id             INT,
            recommended_plan_id INT,
            reason              TEXT,
            confidence_score    DECIMAL(5,4),
            created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id)              REFERENCES users(user_id),
            FOREIGN KEY (recommended_plan_id)  REFERENCES mobile_plans(plan_id)
        )
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("[db] Tables initialised.")


def seed_data(n_users: int = 200):
    """Populate the database with synthetic telecom data."""
    conn = get_connection()
    cursor = conn.cursor()

    # ── Plans ────────────────────────────────────────────────────────────────
    plans = [
        ("Basic Starter",   "Budget",   9.99,  2.0,  100, 50,  "Basic calling & SMS"),
        ("Value Pack",      "Budget",   14.99, 5.0,  200, 100, "Good value for light users"),
        ("Standard Plus",   "Standard", 24.99, 15.0, 500, 300, "Balanced plan for average users"),
        ("Business Pro",    "Premium",  49.99, 50.0, 2000,500, "Unlimited almost everything"),
        ("Data Monster",    "Data",     34.99, 100.0,300, 200, "Massive data for streamers"),
        ("Call Master",     "Voice",    29.99, 10.0, 5000,400, "Unlimited domestic calls"),
        ("Family Bundle",   "Bundle",   59.99, 80.0, 3000,1000,"Multi-line family plan"),
        ("Enterprise Elite","Enterprise",99.99,200.0,10000,2000,"Full enterprise connectivity"),
    ]
    cursor.execute("SELECT COUNT(*) FROM mobile_plans")
    if cursor.fetchone()[0] == 0:
        cursor.executemany("""
            INSERT INTO mobile_plans
              (plan_name,plan_type,monthly_cost,data_gb,call_minutes,sms_count,features)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, plans)

    # ── Users ────────────────────────────────────────────────────────────────
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] < n_users:
        first = ["Alex","Jordan","Taylor","Morgan","Casey","Riley","Quinn","Avery",
                 "Dakota","Sage","River","Skyler","Blake","Cameron","Drew","Emery"]
        last  = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller",
                 "Davis","Wilson","Martinez","Anderson","Thomas","Jackson","White"]
        locs  = ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia",
                 "San Antonio","San Diego","Dallas","San Jose","Mumbai","London"]
        for i in range(n_users):
            name   = f"{random.choice(first)} {random.choice(last)}"
            email  = f"user{i+1}_{random.randint(1000,9999)}@telecom.ai"
            age    = random.randint(18, 70)
            gender = random.choice(["Male","Female","Other"])
            loc    = random.choice(locs)
            tenure = random.randint(1, 84)
            cursor.execute("""
                INSERT IGNORE INTO users (name,email,age,gender,location,tenure_months)
                VALUES (%s,%s,%s,%s,%s,%s)
            """, (name, email, age, gender, loc, tenure))

    # ── Usage ────────────────────────────────────────────────────────────────
    cursor.execute("SELECT user_id FROM users")
    user_ids = [r[0] for r in cursor.fetchall()]
    cursor.execute("SELECT plan_id FROM mobile_plans")
    plan_ids = [r[0] for r in cursor.fetchall()]

    cursor.execute("SELECT COUNT(*) FROM user_usage")
    if cursor.fetchone()[0] == 0:
        months = ["2024-01","2024-02","2024-03","2024-04","2024-05","2024-06",
                  "2024-07","2024-08","2024-09","2024-10","2024-11","2024-12"]
        rows = []
        for uid in user_ids:
            pid = random.choice(plan_ids)
            for month in random.sample(months, k=random.randint(3,12)):
                rows.append((
                    uid, pid, month,
                    round(random.uniform(0.5, 120), 2),
                    random.randint(10, 6000),
                    random.randint(5, 800),
                    random.randint(0, 300),
                ))
        cursor.executemany("""
            INSERT INTO user_usage
              (user_id,plan_id,month,data_used_gb,call_minutes,sms_sent,roaming_minutes)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, rows)

    # ── Payments ─────────────────────────────────────────────────────────────
    cursor.execute("SELECT COUNT(*) FROM payments")
    if cursor.fetchone()[0] == 0:
        import datetime
        prows = []
        for uid in user_ids:
            for m in range(1, random.randint(3, 13)):
                due  = datetime.date(2024, m, 15)
                late = random.random() < 0.25
                miss = random.random() < 0.05
                if miss:
                    status = "Missed"; paid = None
                elif late:
                    status = "Late";   paid = due + datetime.timedelta(days=random.randint(1,30))
                else:
                    status = "Paid";   paid = due - datetime.timedelta(days=random.randint(0,5))
                prows.append((uid, round(random.uniform(10,100),2), due, paid,
                              status, random.randint(0,5)))
        cursor.executemany("""
            INSERT INTO payments (user_id,amount,due_date,paid_date,status,complaints)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, prows)

    conn.commit()
    cursor.close()
    conn.close()
    print(f"[db] Seeded data for {len(user_ids)} users.")


def fetch_feature_matrix():

    import pandas as pd

    print("Fetching feature matrix ...")

    conn = get_connection()

    query = """
        SELECT
            u.user_id,
            u.name          AS user_name,
            u.location      AS city,
            u.age,
            u.gender,
            u.tenure_months,
            COALESCE(AVG(uu.data_used_gb), 0)    AS avg_data_gb,
            COALESCE(AVG(uu.call_minutes), 0)     AS avg_call_minutes,
            COALESCE(AVG(uu.sms_sent), 0)         AS avg_sms,
            COALESCE(AVG(uu.roaming_minutes), 0)  AS avg_roaming_minutes,
            COALESCE(COUNT(uu.usage_id), 0)       AS usage_records,
            COALESCE(AVG(p.complaints), 0)        AS total_complaints,
            COALESCE(AVG(p.amount), 0)            AS avg_payment,
            COALESCE(SUM(CASE WHEN p.status = 'Missed' THEN 1 ELSE 0 END), 0) AS missed_payments,
            COALESCE(SUM(CASE WHEN p.status = 'Late'   THEN 1 ELSE 0 END), 0) AS total_late_payments,
            mp.plan_type    AS plan_category
        FROM users u
        LEFT JOIN user_usage uu  ON u.user_id  = uu.user_id
        LEFT JOIN payments   p   ON u.user_id  = p.user_id
        LEFT JOIN mobile_plans mp ON uu.plan_id = mp.plan_id
        GROUP BY
            u.user_id, u.name, u.location, u.age,
            u.gender, u.tenure_months, mp.plan_type
    """

    df = pd.read_sql(query, conn)

    conn.close()

    print(f"Loaded {len(df)} rows")
    print(df.head())

    return df

# =========================================

# BEHAVIOR AGENT DATA

# =========================================
 
def fetch_behavior_data():
 
    import pandas as pd
 
    print("Fetching behavior data from user_usage...")
 
    conn = get_connection()
 
    query = """

    SELECT

        user_id,
 
        AVG(data_used_gb) AS avg_data_gb,
 
        AVG(call_minutes_used) AS avg_call_minutes,
 
        AVG(sms_used) AS avg_sms,
 
        SUM(complaints) AS total_complaints,
 
        COUNT(*) AS usage_frequency,
 
        DATEDIFF(CURDATE(), MAX(last_active)) AS inactive_days
 
    FROM user_usage
 
    GROUP BY user_id

    """
 
    df = pd.read_sql(query, conn)
 
    conn.close()
 
    print(f"Loaded {len(df)} users for behavior analysis")
 
    return df.fillna(0)
 


if __name__ == "__main__":
    init_db()
    seed_data()
