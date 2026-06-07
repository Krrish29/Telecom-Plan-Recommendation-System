"""
train_recommendation_model.py — Train the KNN recommendation model.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from db import fetch_feature_matrix
from recommendation_agent import RecommendationAgent

def main():
    print("Fetching feature matrix …")
    df = fetch_feature_matrix()
    print(f"  {len(df)} users loaded.")
    agent = RecommendationAgent()
    agent.train(df)
    print("Recommendation model training complete.")

if __name__ == "__main__":
    main()
