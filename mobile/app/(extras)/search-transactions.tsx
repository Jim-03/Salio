import Lucide from "@react-native-vector-icons/lucide";
import { Tabs } from "expo-router";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Keyboard,
  Pressable,
  SectionList,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { createAnimatedComponent } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { client } from "@/lib/client";
import {
  Filters,
  HistoryData,
  Transaction,
  TransactionDirection,
} from "@/lib/dto";
import { TransactionRow } from "@/components/transaction-row";

/**
 * Re-usable component rendering the search transaction's page
 */
export default function SearchTransactions() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Map<string, Transaction>>(
    new Map<string, Transaction>(),
  );
  const [hasMoreData, setHasMoreData] = useState(true);

  const [filters, setFilters] = useState<Filters>({
    direction: TransactionDirection.ALL,
    limit: 10,
    page: 0,
    search_term: "",
  });

  const loadData = async () => {
    if (isLoading || !hasMoreData) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v) {
          params.set(k, String(v));
        }
      });

      console.log(params.toString());
      const response = await client.get(
        `/dashboard/transactions?${params.toString()}`,
      );
      const data = response.data as HistoryData;

      if (data) {
        setTransactions((prev) => {
          const copy = new Map(prev);

          data.transactions.forEach((tx) => copy.set(tx.id, tx));

          return copy;
        });

        if (data.number_of_elements < filters.limit) {
          setHasMoreData(false);
        }
      }
    } catch (e) {
      console.error("An error has occurred while fetching transactions: ", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    filters.page,
    filters.search_term,
    filters.direction,
    filters.start,
    filters.end,
  ]);

  // Reset to start at empty state
  useEffect(() => {
    setTransactions(new Map());
  }, [filters.start, filters.end, filters.search_term, filters.direction]);

  return (
    <View className="bg-amber-50 dark:bg-slate-900 flex-1">
      <Tabs.Screen options={{ headerShown: false }} />

      {/* Tab Header */}
      <View className="bg-green-900" style={{ height: insets.top }} />

      <SearchBar
        searchTerm={filters.search_term as string}
        setFilters={setFilters}
        setHasMoreData={setHasMoreData}
      />
      <FilterBar />
      <TransactionsDisplay
        transactions={transactions}
        changePage={setFilters}
      />

      {/* TODO: Implement loading & empty state*/}
    </View>
  );
}

/**
 * Reusable component rendering the search bar
 * @param props
 * @param props.searchTerm The current searched text
 * @param props.setFilters State function to apply filters
 * @param props.setHasMoreData State function to allow fetching from the server
 */
const SearchBar = ({
  searchTerm,
  setFilters,
  setHasMoreData,
}: {
  searchTerm: string;
  setFilters: Dispatch<SetStateAction<Filters>>;
  setHasMoreData: (value: ((prevState: boolean) => boolean) | boolean) => void;
}) => {
  const isDark = useColorScheme() === "dark";
  const [searchText, setSearchText] = useState(searchTerm);

  const close = () => {
    setSearchText("");
    setFilters((prev) => ({
      ...prev,
      search_term: "",
      page: 0,
    }));
  };

  const search = () => {
    setFilters((prev) => ({
      ...prev,
      search_term: searchText.trim(),
      page: 0,
    }));
    Keyboard.dismiss();
  };

  return (
    <View
      className="flex-row items-center gap-2.5 border border-green-900/30 dark:border-amber-50/30 rounded-xl p-2.5"
      style={{ marginVertical: 10, marginHorizontal: 10 }}
    >
      <TextInput
        placeholder="Search by recipient or vendor"
        className="flex-1 dark:text-white"
        placeholderTextColor={
          isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 100, 0, 0.5)"
        }
        value={searchText}
        onChangeText={setSearchText}
      />
      <TouchableOpacity
        onPress={() => {
          if (!searchText.trim()) return; // Early return to prevent fetching if empty

          setHasMoreData(true);
          if (searchText.trim() !== searchTerm) {
            search();
          } else {
            close();
          }
        }}
      >
        <View>
          <Lucide
            name={
              searchText.trim() && searchText.trim() === searchTerm
                ? "x"
                : "search"
            }
            size={24}
            color={isDark ? "white" : "darkgreen"}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Reusable component rendering the filter icon
 * TODO: Implement filter transactions modal
 */
const FilterBar = () => {
  const AnimatedPressable = createAnimatedComponent(Pressable);
  return (
    <AnimatedPressable
      className={
        "bg-green-900 rounded-full items-center justify-center p-4 elevation-md"
      }
      style={{ marginHorizontal: 20 }}
    >
      <Lucide name={"funnel"} size={24} color={"white"} />
    </AnimatedPressable>
  );
};

/**
 * Reusable component rendering the transaction's data
 * @param props
 * @param props.transactions List of transactions to be displayed
 * @param props.changePage State function to change the offset being fetched from the server
 */
const TransactionsDisplay = ({
  transactions,
  changePage,
}: {
  transactions: Map<string, Transaction>;
  changePage: (value: ((prevState: Filters) => Filters) | Filters) => void;
}) => {
  const groupTransactions = useMemo(() => {
    const group: Map<number, Transaction[]> = new Map<number, Transaction[]>();

    for (const tx of Array.from(transactions.values())) {
      // Get the transaction's date
      const date = new Date(tx.timestamp).setHours(0, 0, 0, 0);

      // Add the transaction to the date bucket
      const bucket = group.get(date);

      if (bucket) {
        bucket.push(tx);
      } else {
        group.set(date, [tx]);
      }
    }

    return Array.from(group.entries())
      .sort(([timeA], [timeB]) => timeB - timeA)
      .map(([timestamp, tx]) => ({
        title: new Date(timestamp).toLocaleDateString("en-KE", {
          weekday: "long",
          day: "numeric",
        }),
        data: Array.from(tx).sort((a, b) => b.timestamp - a.timestamp),
      }));
  }, [transactions]);

  return (
    <View className={"flex-1 p-2.5"}>
      <SectionList
        sections={groupTransactions}
        renderItem={({ item }) => <TransactionRow transaction={item} />}
        onEndReached={() =>
          changePage((prev) => ({ ...prev, page: prev.page + 1 }))
        }
      />
    </View>
  );
};
