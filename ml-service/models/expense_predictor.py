import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

class ExpensePredictor:
    def __init__(self):
        self.model = LinearRegression()

    def predict_next_month(self, transactions_data: list) -> dict:
        if not transactions_data:
            return {
                "predictedExpense": 0.0,
                "confidence": "Low",
                "trend": "Stable",
                "slope": 0.0
            }

        df = pd.DataFrame(transactions_data)
        expenses_df = df[df["type"] == "expense"].copy()

        if expenses_df.empty:
            return {
                "predictedExpense": 0.0,
                "confidence": "Low",
                "trend": "Stable",
                "slope": 0.0
            }

        expenses_df["date"] = pd.to_datetime(expenses_df["date"])
        expenses_df["year_month"] = expenses_df["date"].dt.to_period("M")
        monthly_series = expenses_df.groupby("year_month")["amount"].sum().reset_index()

        n_months = len(monthly_series)

        if n_months < 2:
            avg_val = float(monthly_series["amount"].iloc[0])
            return {
                "predictedExpense": round(avg_val * 1.05, 2),
                "confidence": "Low",
                "trend": "Stable",
                "slope": 0.0
            }

        X = np.arange(n_months).reshape(-1, 1)
        y = monthly_series["amount"].values

        self.model.fit(X, y)
        next_month_X = np.array([[n_months]])
        pred = self.model.predict(next_month_X)[0]

        slope = float(self.model.coef_[0])
        trend = "Increasing" if slope > 10 else ("Decreasing" if slope < -10 else "Stable")
        confidence = "High" if n_months >= 4 else "Medium"

        return {
            "predictedExpense": round(max(0.0, float(pred)), 2),
            "confidence": confidence,
            "trend": trend,
            "slope": round(slope, 2)
        }
