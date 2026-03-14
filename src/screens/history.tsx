import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../services/theme";
import { getLast5MonthSummary, getLast5YearSummary } from "../utils/database";
import { useDB } from "../services/database";
import { BarChart, LineChart } from "react-native-gifted-charts";

/**
 * Graph based history
 * @returns An element that renders graphs for the past 5 years/months
 */
const History = () => {
  const [direction, setDirection] = useState<"INCOMING" | "OUTGOING">(
    "INCOMING",
  );
  const [monthlySummary, setMonthlySummary] = useState<
    { label: string; amount: number }[]
  >([]);
  const [yearlySummary, setYearlySummary] = useState<
    { label: string; amount: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const db = useDB();
  const dimensions = Dimensions.get("window");
  const [selectedData, setSelectedData] = useState("");
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [monthly, yearly] = await Promise.all([
          getLast5MonthSummary(db, direction),
          getLast5YearSummary(db, direction),
        ]);
        if (monthly && yearly) {
          setYearlySummary(yearly);
          setMonthlySummary(
            monthly.map((m) => {
              const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              return {
                label: `${months[Number(m.label) - 1]}`,
                amount: m.amount,
              };
            }),
          );
        }
      } catch (e) {
        console.error("An error has occurred while fetching the summary:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [direction]);

  const barData = [
    ...yearlySummary.reverse().map((yd) => ({
      label: yd.label,
      value: yd.amount / 1000,
      frontColor: direction === "INCOMING" ? "seagreen" : "tomato",
      topLabelComponent: () => (
        <Text>{(yd.amount / 1000).toFixed(0) + "K"}</Text>
      ),
    })),
  ];

  const lineData = [
    ...monthlySummary.reverse().map((md) => ({
      value: md.amount / 1000,
      label: md.label,
      frontColor: direction === "INCOMING" ? "seagreen" : "tomato",
      dataPointText: (md.amount / 1000).toFixed(0) + "K",
    })),
  ];

  const theme = useTheme();
  const styles = StyleSheet.create({
    directionHeader: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      marginTop: 10,
      alignItems: "center",
    },
    directionButtons: {
      flexDirection: "row",
      alignItems: "center",
      width: "40%",
      justifyContent: "center",
      backgroundColor: theme === "light" ? "white" : "grey",
      height: 40,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "rgb(0, 100, 0)",
    },
    activeDirection: {
      backgroundColor: "seagreen",
    },
    label: {
      color: theme === "light" ? "rgb(0, 100, 0)" : "white",
      fontSize: 18,
      fontWeight: "bold",
      textAlign: "center",
      marginVertical: 20,
    },
    axisLabelText: {
      color: theme === "light" ? "black" : "white",
    },
  });

  const directionButtons = [
    {
      icon: "arrow-downward",
      name: "INCOMING",
    },
    {
      icon: "arrow-upward",
      name: "OUTGOING",
    },
  ];

  return (
    <ScrollView
      style={{
        flexGrow: 1,
        height: dimensions.height * 0.9,
      }}
    >
      {isLoading ? (
        <ActivityIndicator
          size={50}
          style={{ margin: "auto" }}
          color={theme === "light" ? "seagreen" : "white"}
        />
      ) : (
        <>
          <View style={styles.directionHeader}>
            {directionButtons.map((b, k) => {
              const isActiveButton = b.name === direction;
              return (
                <TouchableWithoutFeedback
                  onPress={() =>
                    setDirection(b.name as "INCOMING" | "OUTGOING")
                  }
                  key={k}
                >
                  <View
                    style={[
                      styles.directionButtons,
                      isActiveButton ? styles.activeDirection : undefined,
                    ]}
                  >
                    <MaterialIcons
                      name={b.icon as "arrow-upward" | "arrow-downward"}
                      size={24}
                      color={
                        isActiveButton || theme === "dark" ? "white" : "black"
                      }
                    />
                    <Text
                      style={{
                        color:
                          isActiveButton || theme === "dark"
                            ? "white"
                            : "black",
                      }}
                    >
                      {b.name}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
          <Text style={styles.label}>5 Year Summary</Text>
          <BarChart
            data={barData}
            isAnimated
            yAxisLabelSuffix="K"
            barBorderRadius={5}
            width={dimensions.width * 0.7}
            height={dimensions.height * 0.27}
            yAxisThickness={0}
            xAxisThickness={0}
            noOfSections={5}
            yAxisTextStyle={styles.axisLabelText}
            xAxisLabelTextStyle={styles.axisLabelText}
            barWidth={35}
          />
          <Text style={styles.label}>5 Month Summary</Text>
          <LineChart
            data={lineData}
            curved
            yAxisLabelSuffix="K"
            width={dimensions.width * 0.7}
            height={dimensions.height * 0.27}
            yAxisThickness={0}
            xAxisThickness={0}
            noOfSections={5}
            areaChart
            startFillColor={
              direction === "INCOMING" ? "rgb(0, 100, 0)" : "rgb(255, 0, 0)"
            }
            startOpacity1={1}
            endFillColor={direction === "INCOMING" ? "seagreen" : "tomato"}
            endOpacity={0.3}
            textColor={theme === "light" ? "black" : "white"}
            textShiftY={-10}
            spacing={55}
            color={direction === "INCOMING" ? "seagreen" : "tomato"}
            thickness={1}
            showVerticalLines
            verticalLinesThickness={0.3}
            dataPointsColor={theme === "light" ? "seagreen" : "white"}
            yAxisTextStyle={styles.axisLabelText}
            xAxisLabelTextStyle={styles.axisLabelText}
            stripWidth={35}
            disableScroll
          />
        </>
      )}
    </ScrollView>
  );
};

export default History;
