import { Transaction } from "../types/finance";


export type CategoryAnalysis = {
  category:string;
  amount:number;
  percentage:number;
};



export function analyzeCategories(
  transactions:Transaction[]
):CategoryAnalysis[]{


  const expenses = transactions.filter(
    item=>item.type==="expense"
  );


  const totalExpense = expenses.reduce(
    (total,item)=>total + item.amount,
    0
  );



  const categories:{[key:string]:number}={};



  expenses.forEach(item=>{


    if(categories[item.category]){

      categories[item.category] += item.amount;

    }
    else{

      categories[item.category] = item.amount;

    }


  });




  return Object.keys(categories).map(
    (category)=>({

      category,

      amount:categories[category],

      percentage:
      totalExpense > 0
      ?
      Number(
        (
          (categories[category] / totalExpense)
          *
          100
        ).toFixed(1)
      )
      :
      0


    })
  );


}