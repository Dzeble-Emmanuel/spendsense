import { Transaction } from "../types/finance";


export function generateReport(
  transactions: Transaction[]
){


  const income =
  transactions

  .filter(
    (item)=>item.type==="income"
  )

  .reduce(
    (total,item)=>total + item.amount,
    0
  );




  const expenses =
  transactions

  .filter(
    (item)=>item.type==="expense"
  )

  .reduce(
    (total,item)=>total + item.amount,
    0
  );





  const savings =
  income - expenses;





  // Calculate spending categories

  const categories:any = {};



  transactions

  .filter(
    (item)=>item.type==="expense"
  )

  .forEach(
    (item)=>{

      if(categories[item.category]){

        categories[item.category] += item.amount;

      }

      else{

        categories[item.category] = item.amount;

      }

    }

  );






  let topCategory = "None";

  let highestAmount = 0;




  Object.keys(categories).forEach(
    (category)=>{


      if(categories[category] > highestAmount){

        highestAmount = categories[category];

        topCategory = category;

      }


    }
  );







  let summary = "";



  if(savings > 0){

    summary =
    "Good job! You are saving money this month. Keep maintaining your spending habits.";

  }

  else{

    summary =
    "Your expenses are higher than your income. Consider reducing unnecessary spending.";

  }







  return {


    income,


    expenses,


    savings,


    topCategory,


    topCategoryAmount:highestAmount,


    summary


  };


}