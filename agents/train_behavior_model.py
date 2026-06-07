import joblib

from sklearn.cluster import KMeans

from sklearn.preprocessing import StandardScaler

from db import fetch_behavior_data
 
 
# =========================================

# FETCH DATA

# =========================================
 
df = fetch_behavior_data()
 
print(df.head())

print(f"Training on {len(df)} users")
 
# =========================================

# FEATURES

# =========================================
 
X = df[[

    "avg_data_gb",

    "avg_call_minutes",

    "avg_sms",

    "total_complaints",

    "usage_frequency",

    "inactive_days"

]]
 
# =========================================

# SCALE

# =========================================
 
scaler = StandardScaler()

X_scaled = scaler.fit_transform(X)
 
# =========================================

# TRAIN KMEANS

# =========================================
 
kmeans = KMeans(

    n_clusters=4,

    random_state=42,

    n_init=20

)
 
kmeans.fit(X_scaled)
 
# =========================================

# SAVE

# =========================================
 
joblib.dump(kmeans, "behavior_model.pkl")

joblib.dump(scaler, "behavior_scaler.pkl")
 
print(f"Behavior model trained successfully on {len(df)} users")
 