from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from models.expense_predictor import ExpensePredictor
from models.anomaly_detector import AnomalyDetector
from models.health_scorer import HealthScorer
from models.recommender import FinancialRecommender

app = FastAPI(
    title="SpendSense Machine Learning Service",
    description="Python FastAPI ML analytics & predictions engine for SpendSense",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://127.0.0.1:5000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

predictor = ExpensePredictor()
anomaly_detector = AnomalyDetector()

class TransactionItem(BaseModel):
    title: Optional[str] = "Transaction"
    amount: float
    type: str
    category: str
    date: str

class PredictionRequest(BaseModel):
    transactions: List[TransactionItem]

class HealthScoreRequest(BaseModel):
    income: float
    expenses: float
    transactionCount: int

class RecommendationRequest(BaseModel):
    income: float
    expenses: float
    topCategory: str
    topCategoryPercentage: float

@app.get("/")
def read_root():
    return {"service": "SpendSense ML Service", "status": "running"}

@app.post("/predict/expenses")
def predict_expenses(req: PredictionRequest):
    data = [t.dict() for t in req.transactions]
    prediction = predictor.predict_next_month(data)
    return prediction

@app.post("/analyze/anomalies")
def analyze_anomalies(req: PredictionRequest):
    data = [t.dict() for t in req.transactions]
    anomalies = anomaly_detector.detect_anomalies(data)
    return {"anomalies": anomalies, "count": len(anomalies)}

@app.post("/analyze/health-score")
def calculate_health(req: HealthScoreRequest):
    return HealthScorer.calculate_score(req.income, req.expenses, req.transactionCount)

@app.post("/recommend")
def get_recommendations(req: RecommendationRequest):
    recs = FinancialRecommender.generate_recommendations(
        req.income, req.expenses, req.topCategory, req.topCategoryPercentage
    )
    return {"recommendations": recs}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
