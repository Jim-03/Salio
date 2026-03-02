import { FlatList, StyleSheet, Text, View } from "react-native";
import { TransactionRecord } from "../utils/database";
import { JSX, memo, useCallback } from "react";
import useAppStyles from "../utils/styles";
import { getDateFromString } from "../utils/date";
import { useTheme } from "../services/theme";

/**
 * Transaction row in the review component
 */
const TransactionDetails = memo(({ item }: { item: TransactionRecord }) => {
  const appStyles = useAppStyles();
  const theme = useTheme();

  /**
   * Extracts initials from merchant's name
   * @param name Merchant's name
   * @returns One/Two lettered initials
   */
  const getInitials = (name: string) => {
    const listOfNames = name.split(/\s+/);
    if (listOfNames[0].toUpperCase() === "AIRTIME") return "A";

    return `${listOfNames[0][0]}${listOfNames[1] ? listOfNames[1][0] : ""} `;
  };
  const date = getDateFromString(item.transaction_date, item.transaction_time);

  const transactionStyles = StyleSheet.create({
    transactionRow: {
      height: 60,
      marginVertical: "auto",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    transactionProfile: {
      backgroundColor:
        theme === "light" ? "rgba(0, 100, 0, 0.1)" : "rgba(0, 255, 0, 0.2)",
      height: 50,
      width: 50,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
    },
    transactionDetailsContainer: {
      width: 200,
    },
    transactionTimeStamp: {
      color:
        theme === "light" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)",
      fontSize: 12,
      opacity: 0.7,
    },
  });

  return (
    <View style={transactionStyles.transactionRow}>
      <View style={transactionStyles.transactionProfile}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 15,
            color: theme === "light" ? "rgb(0, 100, 0)" : "rgb(255, 255, 255)",
          }}
        >
          {getInitials(item.merchant as string)}
        </Text>
      </View>
      <View style={transactionStyles.transactionDetailsContainer}>
        <Text
          numberOfLines={1}
          style={[appStyles.text, { fontSize: 15, fontWeight: "bold" }]}
        >
          {item.merchant?.toUpperCase()}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={[appStyles.text, transactionStyles.transactionTimeStamp]}
          >
            {date.toLocaleDateString("en-KE")}
          </Text>
          <Text
            style={[appStyles.text, transactionStyles.transactionTimeStamp]}
          >
            {date.toLocaleTimeString().replace(":00", "")}
          </Text>
        </View>
      </View>
      <Text
        style={{
          color: item.direction === "IN" ? "green" : "red",
          fontWeight: "bold",
          fontSize: 17,
        }}
      >
        {item.direction === "IN" ? "+" : "-"} Ksh.{item.amount}
      </Text>
    </View>
  );
});

/**
 * Display transactions
 * @param transactions A list of transactions to display
 * @returns A reusable component that renders the review component
 */
const Review = ({
  transactions,
}: {
  transactions: TransactionRecord[];
}): JSX.Element => {
  const renderItem = useCallback(
    ({ item }: { item: TransactionRecord }) => (
      <TransactionDetails item={item} />
    ),
    [],
  );

  return (
    <View
      style={{
        flex: 1,
        marginHorizontal: 5,
      }}
    >
      <FlatList
        data={transactions}
        keyExtractor={(item, _index) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

export default Review;
