import TransactionRow, {
  type TransactionSummary,
} from "@/components/transaction-row";
import {
  darkModeBackground,
  darkModeContainerColor,
  lightModeBackground,
  lightModeContainerColor,
} from "@/constants/colors";
import { useDB } from "@/contexts/database-provider";
import { useSms } from "@/contexts/sms-provider";
import { useLightTheme } from "@/contexts/theme-provider";
import {
  getLast5Transactions,
  getLast6DayExpense,
  getLatestBalance,
  getMonthlyOverview,
} from "@/utils/database";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

/**
 * Home screen
 *
 * Displays the current balance, total income and expense for the current month,a graph showing the expenditure of the last 6 months and a list of the last 5 transactions
 * @returns {React.JSX.Element} A home screen component
 */
export default function Home(): React.JSX.Element {
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [dailyData, setDailyData] = useState<Record<string, number>>({});
  const [last5Transactions, setLast5Transactions] = useState<
    TransactionSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const isImporting = useSms();
  const db = useDB();

  const isLight = useLightTheme();
  const bgColor = isLight ? lightModeBackground : darkModeBackground;
  const cardBg = isLight ? lightModeContainerColor : darkModeContainerColor;
  const tint = isLight ? "black" : "white";
  const themeColor = isLight ? "black" : "white";
  const labelFontSize = 18;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (isImporting || isLoading) return;

      try {
        const [balance, monthlyData, fiveDayData, transactionData] =
          await Promise.all([
            getLatestBalance(db),
            getMonthlyOverview(db),
            getLast6DayExpense(db),
            getLast5Transactions(db),
          ]);
        if (balance) setBalance(balance);
        if (monthlyData) {
          setIncome(monthlyData.income);
          setExpense(monthlyData.expense);
        }
        if (dailyData) setDailyData(fiveDayData);
        if (transactionData) setLast5Transactions(transactionData);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isImporting]);

  const barData = useMemo(() => {
    // If data isn't loaded yet, return an empty array for the chart
    if (!dailyData) return [];

    // Map the object keys into the array format Gifted Charts expects
    return Object.keys(dailyData).map((key) => ({
      label: key, // e.g., "0" (Sunday)
      value: dailyData[key],
      topLabelComponent: () => (
        <Text
          numberOfLines={1}
          style={{
            fontSize: 10,
            color: tint,
            opacity: 0.7,
            marginBottom: 4,
            textAlign: "center",
          }}
        >
          {(dailyData[key] / 1000).toFixed(1)} K
        </Text>
      ),
    }));
  }, [dailyData]);

  if (isImporting || isLoading) {
    return <></>;
  }

  return (
    <ScrollView style={[styles.background, { backgroundColor: bgColor }]}>
      {/* Card to show the current balance */}
      <View style={[styles.balanceCard, { backgroundColor: cardBg }]}>
        <Text
          style={[
            styles.balanceLabel,
            { color: tint, fontSize: labelFontSize },
          ]}
        >
          Current M-Pesa balance
        </Text>
        <Text style={[styles.balanceText, { color: themeColor }]}>
          KES {balance.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
        </Text>
      </View>

      {/* Card to show this month's expenditure*/}
      <View style={styles.monthCard}>
        <Text style={[styles.containerLabel, { fontSize: labelFontSize }]}>
          Current month's overview
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 10,
            width: "100%",
            marginHorizontal: "auto",
          }}
        >
          {/* Monthly income*/}
          <View style={[styles.overviewCard, { backgroundColor: cardBg }]}>
            <MaterialIcons
              name={"arrow-downward"}
              color={"green"}
              style={styles.overviewCardIcon}
            />
            <View style={styles.overviewCardTextContainer}>
              <Text style={[styles.overviewCardLabel, { color: tint }]}>
                Income
              </Text>
              <Text style={[styles.overviewAmount, { color: themeColor }]}>
                KES{" "}
                {income.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>

          {/* Monthly Expense */}
          <View style={[styles.overviewCard, { backgroundColor: cardBg }]}>
            <MaterialIcons
              name={"arrow-upward"}
              color={"red"}
              style={styles.overviewCardIcon}
            />
            <View style={styles.overviewCardTextContainer}>
              <Text style={[styles.overviewCardLabel, { color: tint }]}>
                Expense
              </Text>
              <Text style={[styles.overviewAmount, { color: themeColor }]}>
                KES{" "}
                {expense.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Container displaying the last 6-day usage */}
      <View>
        <Text style={[styles.containerLabel, { fontSize: labelFontSize }]}>
          Past 6 day expenditure
        </Text>
        <View style={{ marginLeft: -15 }}>
          <BarChart
            data={barData}
            barWidth={25}
            barBorderRadius={5}
            hideAxesAndRules
            frontColor={"tomato"}
            isAnimated
            disablePress
            disableScroll
            yAxisExtraHeight={25}
            xAxisLabelTextStyle={{ fontSize: 10, color: tint }}
          />
        </View>
      </View>

      {/* Container displaying the last 5 transactions*/}
      <View style={{ marginBottom: 75 }}>
        <View style={styles.historyContainerHeader}>
          <Text style={[styles.containerLabel, { fontSize: labelFontSize }]}>
            Recent Transactions
          </Text>
          <Text
            onPress={() => router.push("/main/history")}
            style={[styles.seeMoreText, { color: tint }]}
          >
            See more
          </Text>
        </View>
        <View>
          {last5Transactions.map((t, k) => (
            <TransactionRow key={k} transaction={t} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingHorizontal: 15,
  },
  balanceCard: {
    marginTop: 20,
    height: 100,
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  balanceLabel: {
    opacity: 0.5,
    marginTop: 10,
    marginBottom: 15,
    fontWeight: 500,
  },
  balanceText: {
    fontWeight: "bold",
    fontSize: 20,
  },
  monthCard: {},
  containerLabel: {
    color: "seagreen",
    opacity: 0.7,
    marginVertical: 10,
  },
  overviewCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 5,
    height: 55,
    borderRadius: 10,
    gap: 5,
    elevation: 5,
  },
  overviewCardTextContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  overviewCardIcon: {
    fontSize: 24,
    padding: 5,
    borderRadius: 5,
  },
  overviewCardLabel: {
    opacity: 0.7,
    fontSize: 11,
  },
  overviewAmount: {
    fontSize: 18,
    fontWeight: 500,
  },
  historyContainerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    alignItems: "center",
  },
  seeMoreText: {
    textDecorationStyle: "solid",
    textDecorationLine: "underline",
    fontSize: 15,
    padding: 5,
  },
});
