import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";

import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";


export default function EditTransaction(){


const { id } = useLocalSearchParams();


const {
  transactions,
  updateTransaction
} = useFinance();


const {theme}=useTheme();



const transaction =
transactions.find(
(item)=>item.id === id
);



const [title,setTitle]=useState(
transaction?.title || ""
);


const [amount,setAmount]=useState(
transaction?.amount.toString() || ""
);


const [category,setCategory]=useState(
transaction?.category || ""
);


const [type,setType]=useState<
"income"|"expense"
>(
transaction?.type || "expense"
);





function saveChanges(){


if(!transaction){

return;

}



updateTransaction({

id:transaction.id,

title,

amount:Number(amount),

category,

type,

date:transaction.date

});


router.back();


}





if(!transaction){

return(

<View

style={[

styles.container,

{
backgroundColor:theme.background
}

]}

>


<Text

style={{
color:theme.text
}}

>

Transaction not found

</Text>


</View>

);

}







return(


<View

style={[

styles.container,

{

backgroundColor:theme.background

}

]}

>


<Text

style={[

styles.title,

{

color:theme.text

}

]}

>

Edit Transaction

</Text>







<TextInput

placeholder="Title"

value={title}

onChangeText={setTitle}

style={[

styles.input,

{

backgroundColor:theme.card,

color:theme.text

}

]}

/>








<TextInput

placeholder="Amount"

keyboardType="numeric"

value={amount}

onChangeText={setAmount}

style={[

styles.input,

{

backgroundColor:theme.card,

color:theme.text

}

]}

/>








<TextInput

placeholder="Category"

value={category}

onChangeText={setCategory}

style={[

styles.input,

{

backgroundColor:theme.card,

color:theme.text

}

]}

/>








<View style={styles.row}>




<TouchableOpacity

style={[

styles.typeButton,

type==="income" && styles.selected

]}

onPress={()=>setType("income")}

>

<Text>
Income
</Text>

</TouchableOpacity>







<TouchableOpacity

style={[

styles.typeButton,

type==="expense" && styles.selected

]}

onPress={()=>setType("expense")}

>

<Text>
Expense
</Text>

</TouchableOpacity>



</View>








<TouchableOpacity

style={styles.saveButton}

onPress={saveChanges}

>


<Text style={styles.saveText}>

SAVE CHANGES

</Text>


</TouchableOpacity>






</View>


);

}






const styles = StyleSheet.create({


container:{

flex:1,

padding:20

},



title:{

fontSize:30,

fontWeight:"bold",

marginTop:30,

marginBottom:30

},



input:{

height:55,

borderRadius:15,

paddingHorizontal:15,

marginBottom:15

},



row:{

flexDirection:"row",

justifyContent:"space-between",

marginVertical:20

},



typeButton:{

padding:20,

backgroundColor:"#FFFFFF",

borderRadius:15,

width:"48%",

alignItems:"center"

},



selected:{

backgroundColor:"#93C5FD"

},



saveButton:{

backgroundColor:"#2563EB",

height:55,

borderRadius:15,

alignItems:"center",

justifyContent:"center"

},



saveText:{

color:"#FFFFFF",

fontWeight:"bold"

}


});