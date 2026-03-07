import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { JSX, useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../services/theme";
import { useSms } from "../services/messages";
import {
  getTotalIncomePerYear,
  getTotalExpensePerYear,
  getLastBalance,
} from "../utils/database";
import { useDB } from "../services/database";

/**
 * Displays the transaction details on the home screen
 * @returns {JSX.Element} A reusable component that displays transaction summary
 */
const HomeBanner = (): JSX.Element => {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const theme = useTheme();
  const { isImporting } = useSms() as {
    isImporting: boolean;
  };
  const [isLoading, setIsLoading] = useState(false);
  const db = useDB();

  useEffect(() => {
    const loadData = async () => {
      if (isImporting) return;
      try {
        setIsLoading(true);
        const [balanceEstimate, totalIncome, totalExpense] = await Promise.all([
          getLastBalance(db),
          getTotalIncomePerYear(db),
          getTotalExpensePerYear(db),
        ]);
        if (balanceEstimate && totalIncome && totalExpense) {
          setIncome(totalIncome);
          setExpense(totalExpense);
          setBalance(balanceEstimate);
        }
      } catch (e) {
        console.error(
          "An error has occurred while fetching the banner's data: ",
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
      backgroundColor:
        theme === "light" ? "seagreen" : "rgba(255, 255, 255, 0.3)",
      height: 200,
      marginTop: 5,
      borderRadius: 20,
      paddingVertical: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    balanceContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      width: "95%",
      borderRadius: 10,
    },
    title: {
      fontSize: 25,
      fontWeight: "bold",
      color: "white",
    },
    summaryContainer: {
      flexDirection: "row",
      width: "95%",
      height: 70,
      justifyContent: "space-evenly",
      alignItems: "center",
      padding: 5,
      borderRadius: 5,
    },
    summary: {
      flexDirection: "row",
      width: "45%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 5,
    },
    summaryIcon: {
      fontSize: 25,
      color: "rgba(255, 255, 255, 0.7)",
    },
    summaryLabel: {
      color: "rgba(255, 255, 255, 0.7)",
      fontSize: 17,
    },
    amountText: {
      color: "white",
      fontSize: 18,
      fontWeight: "bold",
    },
  });

  return (
    <View style={styles.background}>
      <View style={styles.balanceContainer}>
        <Text style={styles.title}>Estimated Balance</Text>
        <Text style={[styles.title, { fontSize: 30 }]}>
          Ksh.{balance.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
        </Text>
      </View>
      <View style={styles.summaryContainer}>
        <View style={styles.summary}>
          {isImporting || isLoading ? (
            <ActivityIndicator color={"white"} size={30} />
          ) : (
            <MaterialIcons name="arrow-downward" style={styles.summaryIcon} />
          )}
          <View>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.amountText}>
              Ksh.{income.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
        <View style={styles.summary}>
          {isImporting || isLoading ? (
            <ActivityIndicator color={"white"} size={30} />
          ) : (
            <MaterialIcons name="arrow-upward" style={styles.summaryIcon} />
          )}
          <View>
            <Text style={styles.summaryLabel}>Outgoing</Text>
            <Text style={styles.amountText}>
              Ksh.
              {expense.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomeBanner;
