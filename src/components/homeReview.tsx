import { useEffect, useState } from "react";
import { getLast5Transactions, TransactionRecord } from "../utils/database";
import { useDB } from "../services/database";
import { useTheme } from "../services/theme";
import { useSms } from "../services/messages";
import { StyleSheet, Text, View } from "react-native";
import useAppStyles from "../utils/styles";
import { getDateFromString } from "../utils/date";

/**
 * Extracts initials from merchant's name
 * @param name Merchant's name
 * @returns One/Two lettered initials
 */
export const getInitials = (name: string) => {
  const listOfNames = name.split(/\s+/);
  if (listOfNames[0].toUpperCase() === "AIRTIME") return "A";

  return `${listOfNames[0][0]}${listOfNames[1] ? listOfNames[1][0] : ""} `;
};

/**
 * Transaction review
 * @returns A reusable component that renders 5 rows of the latest transactions
 */
const HomeReview = () => {
  const [last5Transactions, setLast5Transactions] = useState<
    TransactionRecord[]
  >([]);
  const db = useDB();
  const theme = useTheme();
  const { isImporting } = useSms();
  const appStyles = useAppStyles();

  useEffect(() => {
    const loadData = async () => {
      setLast5Transactions(await getLast5Transactions(db));
    };
    loadData();
  }, [isImporting]);

  const transactionStyles = StyleSheet.create({
    transactionRow: {
      flex: 1,
      marginVertical: "auto",
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 5,
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
      flex: 1,
    },
    transactionTimeStamp: {
      color:
        theme === "light" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)",
      fontSize: 12,
      opacity: 0.7,
    },
  });

  return (
    <View
      style={{
        flex: 1,
        marginHorizontal: 5,
      }}
    >
      {last5Transactions.map((item, key) => {
        const date = getDateFromString(
          item.transaction_date,
          item.transaction_time,
        );

        return (
          <View style={transactionStyles.transactionRow} key={key}>
            <View style={transactionStyles.transactionProfile}>
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
            <View style={transactionStyles.transactionDetailsContainer}>
              <Text
                numberOfLines={1}
                style={[appStyles.text, { fontSize: 15, fontWeight: "bold" }]}
              >
                {item.merchant?.toUpperCase()}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={[
                    appStyles.text,
                    transactionStyles.transactionTimeStamp,
                  ]}
                >
                  {date.toLocaleDateString("en-KE")}
                </Text>
                <Text
                  style={[
                    appStyles.text,
                    transactionStyles.transactionTimeStamp,
                  ]}
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
                width: 80,
              }}
              numberOfLines={1}
            >
              {item.direction === "IN" ? "+" : "-"} Ksh.{item.amount}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default HomeReview;
