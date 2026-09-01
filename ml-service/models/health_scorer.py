class HealthScorer:
    @staticmethod
    def calculate_score(income: float, expenses: float, transaction_count: int) -> dict:
        if income <= 0:
            return {
                "score": 0,
                "status": "Needs Improvement",
                "factors": {"savingsRate": 0, "expenseRatio": 100}
            }

        savings = income - expenses
        savings_rate = (savings / income) * 100

        score = 50.0

        # Savings factor
        if savings_rate >= 40:
            score += 30
        elif savings_rate >= 20:
            score += 20
        elif savings_rate < 0:
            score -= 30

        # Expense control
        if expenses < income * 0.5:
            score += 15
        elif expenses > income:
            score -= 20

        # Activity factor
        if transaction_count >= 5:
            score += 5

        score = max(0.0, min(100.0, score))
        int_score = int(round(score))

        status = "Needs Improvement"
        if int_score >= 80:
            status = "Excellent"
        elif int_score >= 60:
            status = "Good"
        elif int_score >= 40:
            status = "Fair"

        return {
            "score": int_score,
            "status": status,
            "factors": {
                "savingsRate": round(savings_rate, 1),
                "expenseRatio": round((expenses / income) * 100, 1) if income > 0 else 100
            }
        }
