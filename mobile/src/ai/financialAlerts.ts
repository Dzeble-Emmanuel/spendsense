import { Transaction } from "../types/finance";


export function generateFinancialAlerts(
  transactions: Transaction[]
): string[] {


  const alerts:string[] = [];


  const expenses =
  transactions
  .filter(
    (item)=>item.type==="expense"
  )
  .reduce(
    (total,item)=>total + item.amount,
    0
  );



  const income =
  transactions
  .filter(
    (item)=>item.type==="income"
  )
  .reduce(
    (total,item)=>total + item.amount,
    0
  );





  if(expenses > income * 0.7){

    alerts.push(
      "⚠️ You have spent more than 70% of your income. Consider reducing unnecessary expenses."
    );

  }





  if(income - expenses > income * 0.3){

    alerts.push(
      "🎉 Great job! You saved more than 30% of your income this month."
    );

  }





  if(alerts.length === 0){

    alerts.push(
      "✅ Your financial activity looks healthy. Keep monitoring your spending."
    );

  }




  return alerts;


}