import TransactionRow from "@/components/transaction-row";
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
  TransactionRecord,
} from "@/utils/database";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";

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
    TransactionRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const isImporting = useSms();
  const db = useDB();

  const isLight = useLightTheme();
  const bgColor = isLight ? lightModeBackground : darkModeBackground;
  const cardBg = isLight ? lightModeContainerColor : darkModeContainerColor;
  const themeColor = isLight ? "black" : "white";

  // Semantic tokens derived from theme
  const mutedText = isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";
  const dividerColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.07)";
  const incomeAccent = "#16a34a";
  const expenseAccent = "#e53e3e";
  const brandGreen = "#2e8b57";

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

  const lineData = useMemo(() => {
    if (!dailyData) return [];
    return Object.keys(dailyData).map((key) => {
      const val = dailyData[key];

      // Smart formatting to prevent rounding errors
      let labelText = "";
      if (val > 0 && val < 1000) {
        labelText = val.toString(); // Shows exactly 30 instead of 0.0K
      } else if (val >= 1000) {
        labelText = `${(val / 1000).toFixed(1)}K`; // Shows 2.0K
      }

      return {
        label: key,
        value: val,
        dataPointLabelComponent: () => {
          if (!labelText) return null;

          return (
            <View style={{ width: 40, alignItems: "center", marginLeft: -5 }}>
              <Text
                style={{
                  fontSize: 9,
                  color: mutedText,
                  fontWeight: "600",
                }}
              >
                {labelText}
              </Text>
            </View>
          );
        },
      };
    });
  }, [dailyData, mutedText]);

  return (
    <ScrollView
      style={[styles.background, { backgroundColor: bgColor }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Balance hero card */}
      <View style={[styles.heroCard, { backgroundColor: cardBg }]}>
        {/* Top row: label + net indicator */}
        <View style={styles.heroTopRow}>
          <Text style={[styles.heroLabel, { color: mutedText }]}>
            M-Pesa Balance
          </Text>
        </View>

        {/* Main balance */}
        <Text style={[styles.heroAmount, { color: themeColor }]}>
          <Text style={[styles.heroCurrency, { color: mutedText }]}>KES </Text>
          {balance.toLocaleString("en-KE", { maximumFractionDigits: 0 })}
        </Text>

        {/* Divider */}
        <View style={[styles.heroDivider, { backgroundColor: dividerColor }]} />

        {/* Income / Expense row */}
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <View style={styles.heroStatIcon}>
              <MaterialIcons
                name="arrow-downward"
                size={14}
                color={incomeAccent}
              />
            </View>
            <View>
              <Text style={[styles.heroStatLabel, { color: mutedText }]}>
                Income
              </Text>
              <Text style={[styles.heroStatAmount, { color: themeColor }]}>
                KES{" "}
                {(income || 0).toLocaleString("en-KE", {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </View>
          </View>

          <View
            style={[styles.heroStatDivider, { backgroundColor: dividerColor }]}
          />

          <View style={styles.heroStat}>
            <View
              style={[
                styles.heroStatIcon,
                { backgroundColor: "rgba(229,62,62,0.1)" },
              ]}
            >
              <MaterialIcons
                name="arrow-upward"
                size={14}
                color={expenseAccent}
              />
            </View>
            <View>
              <Text style={[styles.heroStatLabel, { color: mutedText }]}>
                Expense
              </Text>
              <Text style={[styles.heroStatAmount, { color: themeColor }]}>
                KES{" "}
                {(expense || 0).toLocaleString("en-KE", {
                  maximumFractionDigits: 0,
                })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Past 6-day expenditure */}
      <View style={[styles.section, { backgroundColor: cardBg }]}>
        <Text style={[styles.sectionLabel, { color: brandGreen }]}>
          Past 6 day expenditure
        </Text>
        <View style={{ marginLeft: -18, marginTop: 15 }}>
          <LineChart
            data={lineData}
            color={brandGreen}
            thickness={3}
            dataPointsColor={brandGreen}
            dataPointsRadius={4}
            hideAxesAndRules
            isAnimated
            yAxisExtraHeight={45}
            dataPointLabelShiftY={-10}
            xAxisLabelTextStyle={{ fontSize: 10, color: mutedText }}
            curved
            areaChart
            startFillColor={brandGreen}
            startOpacity={0.2}
            endFillColor={brandGreen}
            endOpacity={0.01}
          />
        </View>
      </View>

      {/* Recent transactions */}
      <View
        style={[styles.section, { backgroundColor: cardBg, marginBottom: 90 }]}
      >
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: brandGreen }]}>
            Recent Transactions
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/main/history")}
            style={styles.seeMoreBtn}
          >
            <Text style={[styles.seeMoreText, { color: brandGreen }]}>
              See all
            </Text>
            <MaterialIcons name="chevron-right" size={16} color={brandGreen} />
          </TouchableOpacity>
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
    paddingHorizontal: 16,
  },

  //  Hero balance card
  heroCard: {
    marginTop: 20,
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  netBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 16,
    textAlign: "center",
  },
  heroCurrency: {
    fontSize: 20,
    fontWeight: "500",
  },
  heroDivider: {
    height: 1,
    marginBottom: 14,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  heroStatIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "rgba(22,163,74,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroStatLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginBottom: 1,
  },
  heroStatAmount: {
    fontSize: 13,
    fontWeight: "700",
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    marginHorizontal: 12,
  },

  //  Generic section card
  section: {
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    marginTop: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  seeMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  seeMoreText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
