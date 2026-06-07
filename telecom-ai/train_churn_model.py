"""
train_churn_model.py — Train the XGBoost churn prediction model.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from db import fetch_feature_matrix
from churn_agent import ChurnAgent

def main():
    print("Fetching feature matrix …")
    df = fetch_feature_matrix()
    print(f"  {len(df)} users loaded.")
    agent = ChurnAgent()
    agent.train(df)
    print("Churn model training complete.")

if __name__ == "__main__":
    main()
