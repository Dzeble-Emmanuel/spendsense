import { Transaction } from "../types/finance";

export function getMonthlyTrend(
  transactions: Transaction[]
) {

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

  const totals = new Array(12).fill(0);

  transactions.forEach(transaction => {

    if (transaction.type === "expense") {

      const month = new Date(transaction.date).getMonth();

      totals[month] += transaction.amount;

    }

  });

  return {
    labels: months,
    data: totals
  };

}