import { JSX, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../services/theme";
import useAppStyles from "../utils/styles";
import { getMonthlyAverageUsage, getMonthlyExpense } from "../utils/database";
import { useDB } from "../services/database";
import { useSms } from "../services/messages";

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
  const db = useDB();
  const [isLoading, setIsLoading] = useState(false);
  const { isImporting } = useSms();

  useEffect(() => {
    const loadData = async () => {
      if (isImporting) return;
      setIsLoading(true);
      try {
        const [expense, average] = await Promise.all([
          getMonthlyExpense(db),
          getMonthlyAverageUsage(db),
        ]);
        if (expense && average) {
          setTopExpense(expense);
          setAverageExpense(average);
        }
        setIsLoading(false);
      } catch (e) {
        console.error(
          "An error has occurred while loading the expense summary data:",
          e,
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isImporting]);

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
      <Text style={[appStyles.text, { fontWeight: "bold", opacity: 0.7 }]}>
        This month
      </Text>
      <View style={styles.summaryContainer}>
        <View style={[appStyles.container, styles.containers]}>
          <Text style={[appStyles.text, styles.label]}>Top Expense</Text>
          {isLoading ? (
            <ActivityIndicator
              size={20}
              color={theme === "light" ? "black" : "white"}
            />
          ) : (
            <Text style={[appStyles.text, { fontWeight: "bold" }]}>
              {topExpense}
            </Text>
          )}
        </View>
        <View style={[appStyles.container, styles.containers]}>
          <Text style={[appStyles.text, styles.label]}>Average usage</Text>
          {isLoading ? (
            <ActivityIndicator
              size={20}
              color={theme === "light" ? "black" : "white"}
            />
          ) : (
            <Text style={[appStyles.text, { fontWeight: "bold" }]}>
              Ksh.
              {averageExpense.toLocaleString("KE", {
                maximumFractionDigits: 0,
              })}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

export default ExpenseSummary;
