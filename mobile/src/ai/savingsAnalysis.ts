export function calculateSavingsRate(
income:number,
expenses:number
){

if(income===0){
return 0;
}


const savings =
income - expenses;


return Number(
((savings/income)*100).toFixed(2)
);

}