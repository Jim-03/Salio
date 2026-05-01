import {
  darkModeBackground,
  darkModeContainerColor,
  lightModeBackground,
  lightModeContainerColor,
  primaryColor,
} from "@/constants/colors";
import { useDB } from "@/contexts/database-provider";
import { useLightTheme } from "@/contexts/theme-provider";
import {
  CategoryExpense,
  getCashFlowOverView,
  getCategoryExpense,
  getMonthlyReview,
} from "@/utils/database";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart, PieChart } from "react-native-gifted-charts";

//  Palette
// Generate a unique, perceptually-spread color for every category index.
// Uses the golden-angle step (137.5°) so adjacent slices never share a hue,
// regardless of how many categories exist.
function categoryColor(index: number): string {
  const hue = (index * 137.508) % 360;
  // Keep saturation high and lightness mid-range so colors stay vivid and readable
  return `hsl(${Math.round(hue)}, 65%, 48%)`;
}

const INCOME_COLOR = "seagreen";
const EXPENSE_COLOR = "tomato";

//  Helpers
function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatKES(value: number): string {
  return `KES ${value.toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}

/**
 * Analytics screen component
 *
 * Displays overview of all transactions in a specified period
 * User has the ability to change the date period
 * Contains a pull down to refresh feature in case of new SMS messages
 * @returns {React.JSX.Element} An analytics screen component
 */
export default function Analytics(): React.JSX.Element {
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    now.setMonth(0);
    now.setDate(1);
    now.setHours(0, 0, 0, 0);
    return now;
  });
  const [endDate, setEndDate] = useState(new Date());

  const [pickerTarget, setPickerTarget] = useState<"start" | "end" | null>(
    null,
  );
  const [showPicker, setShowPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [categorySummary, setCategorySummary] = useState<CategoryExpense[]>([]);
  const [incomeData, setIncomeData] = useState(0);
  const [expenseData, setExpenseData] = useState(0);
  const [monthlyOverview, setMonthlyOverview] = useState<
    { month: string; total_expense: number; total_income: number }[]
  >([]);

  const db = useDB();
  const isLight = useLightTheme();
  const backgroundColor = isLight ? lightModeBackground : darkModeBackground;
  const containerColor = isLight
    ? lightModeContainerColor
    : darkModeContainerColor;
  const color = isLight ? "#111" : "#f5f5f5";
  const subColor = isLight ? "#888" : "#aaa";
  const borderColor = isLight ? "#e5e7eb" : "#2a2a2a";

  //  Data loading
  const loadData = async () => {
    const [categoryExpense, cashFlow] = await Promise.all([
      getCategoryExpense(db, startDate.getTime(), endDate.getTime()),
      getCashFlowOverView(db, startDate.getTime(), endDate.getTime()),
    ]);
    const monthly = await getMonthlyReview(db, startDate, endDate);

    if (categoryExpense) setCategorySummary(categoryExpense);
    if (cashFlow) {
      setIncomeData(cashFlow.income);
      setExpenseData(cashFlow.expense);
    }
    if (monthly) setMonthlyOverview(monthly);
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  //  Pie chart data
  const totalExpense = categorySummary.reduce(
    (sum, c) => sum + parseFloat(c.total_expense),
    0,
  );

  const pieData = categorySummary.map((cat, i) => ({
    value: parseFloat(cat.total_expense),
    color: categoryColor(i),
    text: cat.category,
    label: cat.category,
  }));

  //  Line chart data
  const incomeLineData = monthlyOverview.map((m) => ({
    value: m.total_income,
    label: m.month,
  }));
  const expenseLineData = monthlyOverview.map((m) => ({
    value: m.total_expense,
  }));

  //  Savings
  const savings = incomeData - expenseData;
  const savingsPct =
    incomeData > 0 ? ((savings / incomeData) * 100).toFixed(1) : "0.0";
  const savingsPositive = savings >= 0;

  //  Date picker handlers
  const openPicker = (target: "start" | "end") => {
    setPickerTarget(target);
    setShowPicker(true);
  };

  const onPickerChange = (_: any, selected?: Date) => {
    setShowPicker(false);
    if (!selected) return;
    if (pickerTarget === "start") setStartDate(selected);
    else setEndDate(selected);
  };

  //  Styles (inline to respect dynamic theme)
  const s = styles(
    backgroundColor,
    containerColor,
    color,
    subColor,
    borderColor,
    isLight,
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle={isLight ? "dark-content" : "light-content"} />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[primaryColor]}
            progressBackgroundColor={containerColor}
          />
        }
      >
        {/*  Title & Date Selector  */}
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.screenTitle}>Analytics</Text>
            <Text style={s.dateRange}>
              {formatDate(startDate)} – {formatDate(endDate)}
            </Text>
          </View>
          <View style={s.calendarBtns}>
            <TouchableOpacity
              style={s.calBtn}
              onPress={() => openPicker("start")}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={primaryColor}
              />
              <Text style={s.calBtnText}>From</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={s.calBtn}
              onPress={() => openPicker("end")}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={primaryColor}
              />
              <Text style={s.calBtnText}>To</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*  Date Picker (Android)  */}
        {showPicker && (
          <DateTimePicker
            value={pickerTarget === "start" ? startDate : endDate}
            mode="date"
            display="default"
            onValueChange={onPickerChange}
            maximumDate={new Date()}
          />
        )}

        {/*  Income vs Expense Summary  */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Cash Flow Summary</Text>
          <View style={s.cashRow}>
            <View style={s.cashItem}>
              <View style={[s.cashIcon, { backgroundColor: "#dcfce7" }]}>
                <Ionicons name="arrow-down" size={16} color={INCOME_COLOR} />
              </View>
              <Text style={s.cashLabel}>Income</Text>
              <Text style={[s.cashValue, { color: INCOME_COLOR }]}>
                {formatKES(incomeData)}
              </Text>
            </View>

            <View style={s.cashDivider} />

            <View style={s.cashItem}>
              <View style={[s.cashIcon, { backgroundColor: "#fee2e2" }]}>
                <Ionicons name="arrow-up" size={16} color={EXPENSE_COLOR} />
              </View>
              <Text style={s.cashLabel}>Expense</Text>
              <Text style={[s.cashValue, { color: EXPENSE_COLOR }]}>
                {formatKES(expenseData)}
              </Text>
            </View>
          </View>
        </View>

        {/*  Savings Island  */}
        <View
          style={[
            s.card,
            s.savingsCard,
            { borderColor: savingsPositive ? INCOME_COLOR : EXPENSE_COLOR },
          ]}
        >
          <View style={s.savingsRow}>
            <View
              style={[
                s.savingsIconWrap,
                { backgroundColor: savingsPositive ? "#dcfce7" : "#fee2e2" },
              ]}
            >
              <Ionicons
                name={savingsPositive ? "trending-up" : "trending-down"}
                size={22}
                color={savingsPositive ? INCOME_COLOR : EXPENSE_COLOR}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.savingsLabel}>Savings Rate</Text>
              <Text style={s.savingsSubLabel}>
                {savingsPositive ? "You saved" : "You overspent by"}{" "}
                {formatKES(Math.abs(savings))}
              </Text>
            </View>
            <Text
              style={[
                s.savingsPct,
                { color: savingsPositive ? INCOME_COLOR : EXPENSE_COLOR },
              ]}
            >
              {savingsPct}%
            </Text>
          </View>
        </View>

        {/*  Pie Chart  */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Spending by Category</Text>
          {pieData.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="pie-chart-outline" size={40} color={subColor} />
              <Text style={s.emptyText}>No expense data</Text>
            </View>
          ) : (
            <>
              <View style={s.pieWrapper}>
                <PieChart
                  data={pieData}
                  donut
                  radius={110}
                  innerRadius={65}
                  innerCircleColor={containerColor}
                  centerLabelComponent={() => (
                    <View style={s.pieCenter}>
                      <Text style={[s.pieCenterLabel, { color: subColor }]}>
                        Total
                      </Text>
                      <Text style={[s.pieCenterValue, { color }]}>
                        {formatKES(totalExpense)}
                      </Text>
                    </View>
                  )}
                />
              </View>

              {/* Legend */}
              <View style={s.legendGrid}>
                {pieData.map((item, i) => {
                  const pct =
                    totalExpense > 0
                      ? ((item.value / totalExpense) * 100).toFixed(1)
                      : "0";
                  return (
                    <View key={i} style={s.legendItem}>
                      <View
                        style={[s.legendDot, { backgroundColor: item.color }]}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[s.legendLabel, { color }]}
                          numberOfLines={1}
                        >
                          {item.label}
                        </Text>
                        <Text style={[s.legendSub, { color: subColor }]}>
                          {pct}% · {formatKES(item.value)}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </View>

        {/*  Line Chart  */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Monthly Overview</Text>

          {/* Legend */}
          <View style={s.lineChartLegend}>
            <View style={s.legendRow}>
              <View style={[s.lineDot, { backgroundColor: INCOME_COLOR }]} />
              <Text style={[s.legendLabel, { color }]}>Income</Text>
            </View>
            <View style={s.legendRow}>
              <View style={[s.lineDot, { backgroundColor: EXPENSE_COLOR }]} />
              <Text style={[s.legendLabel, { color }]}>Expense</Text>
            </View>
          </View>

          {monthlyOverview.length === 0 ? (
            <View style={s.emptyState}>
              <Ionicons name="analytics-outline" size={40} color={subColor} />
              <Text style={s.emptyText}>No monthly data</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={incomeLineData}
                data2={expenseLineData}
                color1={INCOME_COLOR}
                color2={EXPENSE_COLOR}
                dataPointsColor1={INCOME_COLOR}
                dataPointsColor2={EXPENSE_COLOR}
                startFillColor1={INCOME_COLOR}
                startFillColor2={EXPENSE_COLOR}
                endFillColor1={containerColor}
                endFillColor2={containerColor}
                startOpacity={0.3}
                endOpacity={0.05}
                areaChart
                height={180}
                width={Math.max(300, monthlyOverview.length * 60)}
                spacing={60}
                curved
                hideRules={false}
                rulesColor={borderColor}
                rulesType="dashed"
                yAxisColor={borderColor}
                xAxisColor={borderColor}
                yAxisTextStyle={{ color: subColor, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: subColor, fontSize: 10 }}
                showVerticalLines={false}
                thickness={2}
                initialSpacing={20}
                endSpacing={20}
                backgroundColor={containerColor}
                noOfSections={4}
              />
            </ScrollView>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

//  StyleSheet factory
function styles(
  backgroundColor: string,
  containerColor: string,
  color: string,
  subColor: string,
  borderColor: string,
  isLight: boolean,
) {
  const safeTop = (StatusBar.currentHeight ?? 24) + 8;

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor,
      paddingBottom: 40,
    },
    scroll: {
      paddingTop: safeTop,
      paddingHorizontal: 16,
    },

    // Header
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 20,
    },
    screenTitle: {
      fontSize: 26,
      fontWeight: "700",
      color: primaryColor,
      letterSpacing: -0.5,
    },
    dateRange: {
      fontSize: 13,
      color: subColor,
      marginTop: 2,
    },
    calendarBtns: {
      flexDirection: "row",
      gap: 8,
      marginTop: 4,
    },
    calBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: containerColor,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor,
    },
    calBtnText: {
      fontSize: 12,
      color: primaryColor,
      fontWeight: "600",
    },

    // Date picker (no modal styles needed — Android uses native dialog)

    // Card
    card: {
      backgroundColor: containerColor,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOpacity: isLight ? 0.06 : 0,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: isLight ? 2 : 0,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color,
      marginBottom: 16,
    },

    // Cash flow
    cashRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    cashItem: {
      flex: 1,
      alignItems: "center",
      gap: 6,
    },
    cashIcon: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    cashLabel: {
      fontSize: 11,
      color: subColor,
      fontWeight: "500",
    },
    cashValue: {
      fontSize: 13,
      fontWeight: "700",
    },
    cashDivider: {
      width: 1,
      height: 60,
      backgroundColor: borderColor,
    },

    // Savings island
    savingsCard: {
      borderWidth: 1.5,
    },
    savingsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    savingsIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    savingsLabel: {
      fontSize: 13,
      fontWeight: "700",
      color,
    },
    savingsSubLabel: {
      fontSize: 11,
      color: subColor,
      marginTop: 2,
    },
    savingsPct: {
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -1,
    },

    // Pie
    pieWrapper: {
      alignItems: "center",
      marginBottom: 20,
    },
    pieCenter: {
      alignItems: "center",
    },
    pieCenterLabel: {
      fontSize: 11,
      fontWeight: "500",
    },
    pieCenterValue: {
      fontSize: 13,
      fontWeight: "700",
      marginTop: 2,
    },
    legendGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      width: "47%",
      gap: 8,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginTop: 3,
    },
    legendLabel: {
      fontSize: 12,
      fontWeight: "600",
    },
    legendSub: {
      fontSize: 10,
      marginTop: 1,
    },

    // Line chart
    lineChartLegend: {
      flexDirection: "row",
      gap: 16,
      marginBottom: 12,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    lineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },

    // Empty
    emptyState: {
      alignItems: "center",
      paddingVertical: 32,
      gap: 8,
    },
    emptyText: {
      fontSize: 13,
      color: subColor,
    },
  });
}
