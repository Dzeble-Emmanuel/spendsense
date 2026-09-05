import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

class AnomalyDetector:
    def __init__(self, contamination: float = 0.05):
        self.contamination = contamination

    def detect_anomalies(self, transactions_data: list) -> list:
        if not transactions_data or len(transactions_data) < 5:
            return []

        df = pd.DataFrame(transactions_data)
        expenses_df = df[df["type"] == "expense"].copy()

        if len(expenses_df) < 5:
            return []

        # Guard against zero standard deviation when expenses are identical or flat
        std_val = float(expenses_df["amount"].std())
        if std_val == 0.0 or np.isnan(std_val):
            return []

        # Isolation Forest on amount
        amounts = expenses_df[["amount"]].values
        iso = IsolationForest(contamination=self.contamination, random_state=42)
        expenses_df["anomaly"] = iso.fit_predict(amounts)

        # Anomaly = -1 in IsolationForest
        anomalies = expenses_df[expenses_df["anomaly"] == -1]

        results = []
        mean_val = float(expenses_df["amount"].mean())
        for _, row in anomalies.iterrows():
            amt = float(row["amount"])
            if amt > mean_val:  # Only flag unusually high spending
                results.append({
                    "title": row.get("title", "Transaction"),
                    "amount": amt,
                    "category": row.get("category", "General"),
                    "reason": f"Amount of GH₵{amt:.2f} is significantly higher than your average spending of GH₵{mean_val:.2f}.",
                    "severity": "high" if amt > mean_val * 2.5 else "medium"
                })

        return results
