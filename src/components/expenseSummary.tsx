import { JSX, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../services/theme";
import useAppStyles from "../utils/styles";

/**
 * Displays the summary 0f the past 30 days
 * The top most category spent on
 * The average amount outgoing
 * @returns {JSX.Element} A reusable component that renders the 30 day summary
 */
const ExpenseSummary = (): JSX.Element => {
  const [topExpense, setTopExpense] = useState("_");
  const [averageExpense, setAverageExpense] = useState(0);
  const theme = useTheme();
  const appStyles = useAppStyles();

  const styles = StyleSheet.create({
    background: {
      marginTop: 10,
      alignItems: "center",
      gap: 10,
    },
    summaryContainer: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-evenly",
    },
    containers: {
      width: 150,
      alignItems: "center",
      justifyContent: "center",
      height: 70,
      borderRadius: 10,
      elevation: 5,
    },
    label: {
      fontWeight: "bold",
      color:
        theme === "light" ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.7)",
    },
  });

  return (
    <View style={styles.background}>
      <Text style={[appStyles.text, { fontWeight: "bold" }]}>
        30 day summary
      </Text>
      <View style={styles.summaryContainer}>
        <View style={[appStyles.container, styles.containers]}>
          <Text style={[appStyles.text, styles.label]}>Top Expense</Text>
          <Text style={[appStyles.text, { fontWeight: "bold" }]}>
            {topExpense}
          </Text>
        </View>
        <View style={[appStyles.container, styles.containers]}>
          <Text style={[appStyles.text, styles.label]}>Average usage</Text>
          <Text style={[appStyles.text, { fontWeight: "bold" }]}>
            Ksh.
            {averageExpense.toLocaleString("KE", { maximumFractionDigits: 0 })}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ExpenseSummary;
