import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { useTheme } from "../services/theme";
import { getAllTransactions, TransactionRecord } from "../utils/database";
import { useDB } from "../services/database";
import { getInitials } from "./homeReview";
import { MaterialIcons } from "@expo/vector-icons";
import { getDateFromString } from "../utils/date";

/**
 * Memoized component to display transaction details
 * A user can click to view the transaction detail
 * TODO: Review individual transactions
 */
const TransactionRow = memo(({ item }: { item: TransactionRecord }) => {
  const theme = useTheme();
  const styles = StyleSheet.create({
    background: {
      alignItems: "center",
      flexDirection: "row",
      marginVertical: 5,
      gap: 5,
      borderBottomWidth: 0.5,
      borderBottomColor:
        theme === "light" ? "rgba(0, 0, 0, 0.3)" : "rgba(255,255,255,0.3)",
      paddingVertical: 14,
    },
    profile: {
      width: 50,
      height: 50,
      borderRadius: "50%",
      backgroundColor:
        theme === "light" ? "rgba(0, 100, 0, 0.3)" : "rgba(0, 255, 0, 0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    transactionDetails: {
      flex: 1,
      justifyContent: "center",
      gap: 3,
    },
    transactionCategory: {
      flexDirection: "row",
      gap: 5,
      alignItems: "center",
    },
    timeStamp: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    transactionText: {
      fontSize: 12,
      color: theme === "light" ? "black" : "white",
    },
    amount: {
      color: item.direction === "IN" ? "green" : "red",
      fontWeight: "bold",
      fontSize: 15,
      marginLeft: "auto",
      maxWidth: "50%",
    },
  });
  const date = getDateFromString(item.transaction_date, item.transaction_time);
  return (
    <TouchableWithoutFeedback
      onPress={() =>
        Alert.alert(
          "Notice",
          `Review for ${item.merchant?.split(/\s+/)[0]} to be implemented soon!`,
        )
      }
    >
      <View style={styles.background}>
        <View style={styles.profile}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 15,
              color:
                theme === "light" ? "rgb(0, 100, 0)" : "rgb(255, 255, 255)",
            }}
          >
            {getInitials(item.merchant as string)}
          </Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 15,
              fontWeight: "bold",
              color: theme === "light" ? "black" : "white",
            }}
          >
            {item.merchant?.toUpperCase()}
          </Text>
          <View style={{ flexDirection: "column", gap: 3 }}>
            <View>
              <View style={styles.transactionCategory}>
                {item.category.startsWith("AI_") && (
                  <MaterialIcons
                    name="auto-fix-high"
                    style={[styles.transactionText, { fontSize: 15 }]}
                  />
                )}
                <Text style={[styles.transactionText, { opacity: 0.7 }]}>
                  {item.category.replace("AI_", "")}
                </Text>
                <Text style={styles.amount} numberOfLines={1}>
                  {item.direction === "IN" ? "+" : "-"} Ksh.{item.amount}
                </Text>
              </View>
            </View>
            <View style={styles.timeStamp}>
              <Text style={[styles.transactionText, { opacity: 0.5 }]}>
                {date.toLocaleDateString("en-KE")}
              </Text>
              <Text style={[styles.transactionText, { opacity: 0.5 }]}>
                {date.toLocaleTimeString().replace(":00", "")}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
});

/**
 * Display a list of transactions
 * @returns A reusable component that renders a list of transaction row components
 */
const Transactions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [offset, setOffset] = useState(0);
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const theme = useTheme();
  const db = useDB();

  const loadData = async () => {
    if (isLoading || isFetchingMore) return;

    if (offset === 0) {
      setIsLoading(true);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const data = await getAllTransactions(db, offset, sort);
      if (data) {
        setTransactions((prev) => {
          if (offset === 0) return data;
          return [...prev, ...data];
        });
      }
    } catch (e) {
      console.error(
        "An error has occurred while fetching the transactions: ",
        e,
      );
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sort, offset]);

  const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
    infoText: {
      color: theme === "light" ? "black" : "white",
      opacity: 0.5,
      textAlign: "center",
      margin: "auto",
      fontSize: 16,
    },
    footerLoader: {
      paddingVertical: 20,
    },
  });

  const renderItem = useCallback(
    ({ item }: { item: TransactionRecord }) => <TransactionRow item={item} />,
    [],
  );

  const onEndReached = () => {
    if (!isLoading && !isFetchingMore) {
      setOffset((prev) => prev + 10);
    }
  };

  return (
    <View style={styles.background}>
      {isLoading && offset === 0 ? (
        <ActivityIndicator
          size={40}
          color={theme === "light" ? "seagreen" : "white"}
          style={{ flex: 1 }}
        />
      ) : transactions.length === 0 ? (
        <Text style={styles.infoText}>
          There are no transactions at the moment
        </Text>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore ? (
              <ActivityIndicator
                size="small"
                color={theme === "light" ? "seagreen" : "white"}
                style={styles.footerLoader}
              />
            ) : null
          }
        />
      )}
    </View>
  );
};

export default Transactions;
