import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

import { useFinance } from "../../src/hooks/useFinance";
import { useTheme } from "../../src/hooks/useTheme";


export default function Insights() {

  const {
    transactions,
    income,
    expenses,
  } = useFinance();


  const { theme } = useTheme();



  // Calculate expense categories

  const categories = (transactions || [])
    .filter(item => item.type === "expense")
    .reduce(
      (result, item) => {

        result[item.category] =
          (result[item.category] || 0)
          +
          item.amount;

        return result;

      },
      {} as Record<string, number>
    );



  // Find highest spending category

  const highestCategory =
    Object.entries(categories)
      .slice()
      .sort(
        (a, b) => b[1] - a[1]
      )[0];



  const highestCategoryName =
    highestCategory
      ?
      highestCategory[0]
      :
      "None";


  const highestCategoryAmount =
    highestCategory
      ?
      highestCategory[1]
      :
      0;




  // Savings calculation

  const savings =
    income - expenses;



  const savingsRate =
    income > 0
      ?
      (savings / income) * 100
      :
      0;



  // Financial health score

  let healthScore = 50;


  if (savingsRate > 40)
    healthScore += 30;

  else if (savingsRate > 20)
    healthScore += 20;


  if (expenses > income)
    healthScore -= 30;


  if (healthScore > 100)
    healthScore = 100;


  if (healthScore < 0)
    healthScore = 0;




  // Generate recommendations

  let recommendation =
    "Your finances look balanced. Keep maintaining your spending habits.";


  if (highestCategoryName !== "None") {

    recommendation =
      `Your highest spending category is ${highestCategoryName}. Consider reviewing your ${highestCategoryName.toLowerCase()} expenses.`;

  }



  if (expenses > income) {

    recommendation =
      "Your expenses are higher than your income. Try reducing unnecessary spending.";

  }



  return (

    <ScrollView

      style={[
        styles.container,
        {
          backgroundColor: theme.background
        }
      ]}

    >


      <Text

        style={[
          styles.title,
          {
            color: theme.text
          }
        ]}

      >
        AI Insights
      </Text>





      {/* Health Score */}

      <View

        style={[
          styles.card,
          {
            backgroundColor: theme.card
          }
        ]}

      >


        <Text

          style={[
            styles.heading,
            {
              color: theme.text
            }
          ]}

        >
          Financial Health Score
        </Text>



        <Text

          style={[
            styles.score,
            {
              color: theme.text
            }
          ]}

        >
          {healthScore}/100
        </Text>



        <Text

          style={[
            styles.text,
            {
              color: theme.text
            }
          ]}

        >
          {
            healthScore >= 70
              ?
              "Good financial health"
              :
              "Needs improvement"
          }

        </Text>


      </View>








      {/* Spending Overview */}

      <View

        style={[
          styles.card,
          {
            backgroundColor: theme.card
          }
        ]}

      >


        <Text

          style={[
            styles.heading,
            {
              color: theme.text
            }
          ]}

        >
          Spending Overview
        </Text>



        <Text

          style={[
            styles.text,
            {
              color: theme.text
            }
          ]}

        >
          Total Spending: GH₵ {expenses}
        </Text>



        <Text

          style={[
            styles.text,
            {
              color: theme.text
            }
          ]}

        >
          Highest Category: {highestCategoryName}
        </Text>



        <Text

          style={[
            styles.text,
            {
              color: theme.text
            }
          ]}

        >
          Amount: GH₵ {highestCategoryAmount}
        </Text>


      </View>









      {/* Recommendation */}

      <View

        style={[
          styles.card,
          {
            backgroundColor: theme.card
          }
        ]}

      >


        <Text

          style={[
            styles.heading,
            {
              color: theme.text
            }
          ]}

        >
          💡 Recommendation
        </Text>



        <Text

          style={[
            styles.text,
            {
              color: theme.text
            }
          ]}

        >
          {recommendation}
        </Text>


      </View>








      {/* Savings */}

      <View

        style={[
          styles.card,
          {
            backgroundColor: theme.card
          }
        ]}

      >


        <Text

          style={[
            styles.heading,
            {
              color: theme.text
            }
          ]}

        >
          Savings Analysis
        </Text>



        <Text

          style={[
            styles.text,
            {
              color: theme.text
            }
          ]}

        >
          Current Savings: GH₵ {savings}
        </Text>



        <Text

          style={[
            styles.text,
            {
              color: theme.text
            }
          ]}

        >
          Savings Rate: {savingsRate.toFixed(1)}%
        </Text>


      </View>



    </ScrollView>

  );

}





const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20
  },


  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 25
  },


  card: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20
  },


  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15
  },


  score: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 10
  },


  text: {
    fontSize: 16,
    lineHeight: 24
  }

});