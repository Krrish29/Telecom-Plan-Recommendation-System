from db import fetch_feature_matrix
from data_intelligence_agent import DataIntelligenceAgent

def main():

    print("Fetching feature matrix ...")

    df = fetch_feature_matrix()

    print(f"{len(df)} users loaded.")

    agent = DataIntelligenceAgent()

    agent.train(df)

    print("Data intelligence model complete.")

if __name__ == "__main__":
    main()