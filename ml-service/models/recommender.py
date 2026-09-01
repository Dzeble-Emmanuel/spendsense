class FinancialRecommender:
    @staticmethod
    def generate_recommendations(income: float, expenses: float, top_category: str, top_category_pct: float) -> list:
        recommendations = []

        if expenses > income:
            recommendations.append({
                "message": "Your total expenses currently exceed your income. Prioritize cutting non-essential spending.",
                "category": "Budgeting",
                "priority": "high"
            })
        elif income > 0 and (income - expenses) / income < 0.2:
            recommendations.append({
                "message": "You are saving less than 20% of your income. Aim to build an emergency fund by setting aside a fixed portion each month.",
                "category": "Savings",
                "priority": "medium"
            })

        if top_category and top_category_pct > 35:
            recommendations.append({
                "message": f"Your {top_category} expenditure accounts for {top_category_pct:.1f}% of total spending. Consider establishing a dedicated limit.",
                "category": top_category,
                "priority": "medium"
            })

        if not recommendations:
            recommendations.append({
                "message": "Your spending is well-balanced. Continue maintaining your current financial discipline.",
                "category": "General",
                "priority": "low"
            })

        return recommendations
