import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { JSX, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../services/theme";
import { useSms } from "../services/messages";

/**
 * Displays the transaction details on the home screen
 * @returns {JSX.Element} A reusable component that displays transaction summary
 */
const HomeBanner = (): JSX.Element => {
  const [income, setIncome] = useState(0); // TODO: Fetch annual income
  const [expense, setExpense] = useState(0); // TODO: Fetch annual expense
  const theme = useTheme();
  const { balance, isImporting } = useSms() as {
    balance: number;
    isImporting: boolean;
  };

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
      justifyContent: "space-between",
      alignItems: "center",
      padding: 5,
      borderRadius: 5,
    },
    summary: {
      flexDirection: "row",
      width: "40%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
    },
    summaryIcon: {
      fontSize: 30,
      color: "white",
    },
    summaryTextContainer: {
      alignItems: "center",
    },
    summaryText: {
      color: "white",
      fontSize: 17,
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
          {!isImporting ? (
            <MaterialIcons name="arrow-downward" style={styles.summaryIcon} />
          ) : (
            <ActivityIndicator color={"white"} size={30} />
          )}
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryText}>Income</Text>
            <Text style={styles.summaryText}>
              Ksh.{" "}
              {income.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
        <View style={styles.summary}>
          {!isImporting ? (
            <MaterialIcons name="arrow-upward" style={styles.summaryIcon} />
          ) : (
            <ActivityIndicator color={"white"} size={30} />
          )}
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryText}>Outgoing</Text>
            <Text style={styles.summaryText}>
              Ksh.{" "}
              {expense.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomeBanner;
