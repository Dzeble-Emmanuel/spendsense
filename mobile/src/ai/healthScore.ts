import { Transaction } from "../types/finance";


export function calculateHealthScore(
  transactions: Transaction[]
){


const income = transactions

.filter(
(item)=>item.type==="income"
)

.reduce(
(total,item)=>total + item.amount,
0
);




const expenses = transactions

.filter(
(item)=>item.type==="expense"
)

.reduce(
(total,item)=>total + item.amount,
0
);





// No income data

if(income === 0){

return {

score:0,

status:"No data"

};

}





const savings =
income - expenses;




const savingsRatio =
savings / income;





let score = 50;




// Savings factor

if(savingsRatio >= 0.5){

score += 30;

}

else if(savingsRatio >= 0.2){

score += 20;

}

else if(savingsRatio < 0){

score -= 30;

}





// Expense control

if(expenses < income * 0.5){

score += 15;

}

else if(expenses > income){

score -= 20;

}




// Transaction activity

if(transactions.length >= 5){

score += 5;

}




// Limit score

if(score > 100){

score = 100;

}


if(score < 0){

score = 0;

}





let status="Needs Improvement";


if(score >= 80){

status="Excellent";

}

else if(score >=60){

status="Good";

}





return{


score,

status


};


}