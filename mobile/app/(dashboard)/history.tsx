import Header, { SearchButton } from "@/components/header";
import { TransactionRow } from "@/components/transaction-row";
import { client } from "@/lib/client";
import { HistoryData, Transaction } from "@/lib/dto";
import { useData } from "@/providers/data-provider.component";
import Lucide from "@react-native-vector-icons/lucide";
import { Tabs } from "expo-router";
import { useBottomTabBarHeight } from "expo-router/build/react-navigation/bottom-tabs";
import { useEffect, useMemo, useState } from "react";
import { Pressable, SectionList, Text, View } from "react-native";
import Animated from "react-native-reanimated";

/**
 * Component rendering the history tab
 */
export default function History() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
  );
  const [endDate, setEndDate] = useState(currentDate);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<
    "ALL" | "INCOME" | "SPENT"
  >("ALL");
  const [page, setPage] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const { setData } = useData();
  const limit = 10;

  /**
   * Fetch transactions from the server
   * @returns A promise that resolves after fetching transactions
   */
  const fetchTransactions = async () => {
    if (isLoading || !hasMoreData) return; // Skip if data is being fetched or no more data exists
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        start: String(startDate.getTime()),
        end: String(endDate.getTime()),
        limit: String(limit),
        direction: selectedDirection,
        page: String(page),
      });

      const response = await client.get(
        `/dashboard/transactions?${params.toString()}`,
      );
      const data = response.data as HistoryData;

      if (data) {
        if (data.number_of_elements < limit) {
          setHasMoreData(false);
        }
        setData((prev) => ({
          ...prev,
          transactions: new Set([...prev.transactions, ...data.transactions]),
        }));
        setIncome(data.income);
        setExpense(data.expense);
      }
    } catch (e) {
      console.error("An error has occurred while reviewing transactions: ", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [startDate, endDate, selectedDirection, page]);

  /**
   * Adjust the month on current date
   * @param offset The number of months to add to current date
   */
  const changeMonth = (offset: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
  };

  useEffect(() => {
    setStartDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    );
    setEndDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    );
    setPage(0);
    setHasMoreData(true);
  }, [currentDate]);

  const tabHeight = useBottomTabBarHeight();

  return (
    <View
      style={{ paddingBottom: tabHeight + 15 }}
      className={"flex-1 bg-amber-50 dark:bg-slate-900 items-center"}
    >
      {/* Screen header */}
      <Tabs.Screen
        options={{
          header: () => (
            <Header title="Transactions" headerRight={<SearchButton />} />
          ),
        }}
      />

      <TabHeader changeMonth={changeMonth} date={currentDate} />
      <Expenditure income={income} expense={expense} isLoading={!true} />
      <Transactions
        selectedDirection={selectedDirection}
        setSelectedDirection={setSelectedDirection}
        setOffset={setPage}
        start={startDate.getTime()}
        end={endDate.getTime()}
      />
    </View>
  );
}

/**
 * Re-usable component rendering the history tab's heading
 * @param props Tab header props
 * @param props.changeMonth Function to adjust the date
 * @param props.date The date being displayed
 */
const TabHeader = ({
  changeMonth,
  date,
}: {
  changeMonth: (offset: number) => void;
  date: Date;
}) => {
  /**
   * Check if the next dat eis greater than today
   * @returns true if the next date is greater than today, false otherwise
   */
  const isForwardDisabled = () => {
    const currentDate = new Date(date);

    currentDate.setMonth(date.getMonth() + 1);

    return currentDate > new Date();
  };

  return (
    <View className="flex-row mt-3 items-center gap-2.5 mb-5">
      <Pressable
        className={"p-2.5 rounded-full bg-white dark:bg-gray-600 elevation-md"}
        onPress={() => changeMonth(-1)}
      >
        <Lucide name="chevron-left" size={30} />
      </Pressable>
      <Text
        className={
          "w-48 text-center font-semibold text-2xl text-green-950 dark:text-green-400"
        }
      >
        {date.toLocaleDateString([], {
          month: "long",
          year: "numeric",
        })}
      </Text>
      <Pressable
        className={"p-2.5 rounded-full bg-white dark:bg-gray-600 elevation-md"}
        onPress={() => changeMonth(1)}
        disabled={isForwardDisabled()}
      >
        <Lucide name="chevron-right" size={30} />
      </Pressable>
    </View>
  );
};

/**
 * Re-usable component rendering the monthly total
 * @param props Component's props
 * @param props.income Total income for current month
 * @param props.expense Total expense fro current month
 * @param props.isLoading State check if the tab is loading
 */
const Expenditure = ({
  income,
  expense,
  isLoading,
}: {
  income: number;
  expense: number;
  isLoading: boolean;
}) => {
  const data = [
    { name: "Income", icon: "arrow-down-left", value: income },
    { name: "Spent", icon: "arrow-up-right", value: expense },
  ];
  return (
    <View className="flex-row gap-12" style={{ paddingHorizontal: 20 }}>
      {data.map((d, k) => {
        const isIncome = d.name === "Income";
        const color = isIncome ? "rgb(74, 222, 128)" : "rgb(220, 38, 38)";

        return (
          <Animated.View
            key={k}
            className={`h-20 items-center justify-center flex-1 rounded-xl p-2.5 ${isLoading && "bg-black/30"} bg-white dark:bg-gray-600 elevation-md`}
          >
            {!isLoading && (
              <>
                <View className={"flex-row gap-2"}>
                  <Lucide name={d.icon} size={20} color={color} />
                  <Text
                    className={"text-green-950 dark:text-white font-semibold"}
                  >
                    {d.name}
                  </Text>
                </View>
                <Text className={"font-semibold text-xl"} style={{ color }}>
                  Ksh. {d.value.toLocaleString()}
                </Text>
              </>
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

interface TransactionsProps {
  start: number;
  end: number;
  selectedDirection: "ALL" | "INCOME" | "SPENT";
  setSelectedDirection: (
    value:
      | ((prevState: "ALL" | "INCOME" | "SPENT") => "ALL" | "INCOME" | "SPENT")
      | "ALL"
      | "INCOME"
      | "SPENT",
  ) => void;
  setOffset: (value: ((prevState: number) => number) | number) => void;
}

/**
 * Re-usable component rendering the transactions' details
 * @param props
 * @param props.start Timestamp of the start of the month
 * @param props.end Timestamp of the end of the month
 * @param props.selectedDirection The direction of transactions to fetch
 * @param props.setSelectedDirection State function to change the transaction direction
 * @param props.setOffset State function to change the page to fetch from the server
 */
const Transactions = ({
  start,
  end,
  selectedDirection,
  setSelectedDirection,
  setOffset,
}: TransactionsProps) => {
  const options = ["ALL", "INCOME", "SPENT"];

  const { data } = useData();

  const sections = useMemo(() => {
    const grouped: Map<number, Set<Transaction>> = new Map<
      number,
      Set<Transaction>
    >();
    const seenIds = new Set<string>();

    for (const tx of data.transactions) {
      if (seenIds.has(tx.id)) continue;
      seenIds.add(tx.id);
      // Get date
      const timestamp = new Date(tx.timestamp).setHours(0, 0, 0, 0);

      // Skip transactions that aren't in the specified time period
      if (timestamp < start || timestamp > end) continue;

      // Get existing transaction in this date
      const bucket = grouped.get(timestamp);

      // Add the transaction to existing/new date group
      if (bucket) bucket.add(tx);
      else grouped.set(timestamp, new Set([tx]));
    }

    return Array.from(grouped.entries())
      .sort(([timeA], [timeB]) => timeB - timeA)
      .map(([timestamp, tx]) => ({
        title: new Date(timestamp).toLocaleDateString("en-KE", {
          weekday: "long",
          day: "numeric",
        }),
        data: Array.from(tx).sort((a, b) => b.timestamp - a.timestamp),
      }));
  }, [data.transactions]);

  return (
    <View className={"flex-1 w-full p-5"}>
      {/* Header */}
      <View className={"flex-row gap-2.5 mb-5"}>
        {options.map((o, k) => {
          const isSelected = selectedDirection === o;
          return (
            <Text
              className={`border border-black/30 dark:border-white/50 dark:text-white h-11 w-20 text-center align-middle rounded-xl ${isSelected && "bg-green-800 text-white border-none"}`}
              key={k}
              onPress={() =>
                setSelectedDirection(o as "ALL" | "INCOME" | "SPENT")
              }
            >
              {o}
            </Text>
          );
        })}
      </View>

      {/* Content */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionRow transaction={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text
            className={
              "font-semibold text-xl text-green-950 dark:text-white bg-white dark:bg-gray-600 p-2.5 rounded-xl"
            }
          >
            {title}
          </Text>
        )}
        onEndReached={() => setOffset((prev) => prev + 1)}
      />
    </View>
  );
};
