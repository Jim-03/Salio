import { useLightTheme } from "@/contexts/theme-provider";
import { TransactionRecord } from "@/utils/database";
import React from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";

/**
 * Display a circular component with the merchant's initial
 * @param {string[]} names A list of the merchant's name
 * @returns {React.JSX.Element} A component that renders a profile photo like UI
 */
const MerchantIcon = ({ names }: { names: string[] }): React.JSX.Element => {
  const initials = () => {
    return `${names[0][0]}${names[1] ? names[1][0] : ""}`.toUpperCase();
  };
  return (
    <View style={styles.profile}>
      <Text style={styles.initial}>{initials()}</Text>
    </View>
  );
};

/**
 * Render the summary of a transaction
 * @param {TransactionSummary} transaction An object containing a transaction's summary
 * @param {() => void} onPress function triggered when the row is clicked
 * @returns {React.JSX.Element} A component rendering the transaction summary
 */
export default function TransactionRow({
  transaction,
  onPress,
}: {
  transaction: TransactionSummary;
  onPress?: () => void;
}): React.JSX.Element {
  const date = new Date(Number(transaction.transaction_timestamp));
  const isLight = useLightTheme();

  const merchantNames = transaction.merchant.split(/\s+/);

  const textColor = isLight ? "black" : "white";

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.background}>
        {/* Profile Icon*/}
        <MerchantIcon names={merchantNames} />

        {/* Name and Date*/}
        <View style={{ justifyContent: "center" }}>
          <Text style={[styles.merchantName, { color: textColor }]}>
            {merchantNames[0]} {merchantNames[1]}
          </Text>
          <Text style={[styles.timestamp, { color: textColor }]}>
            {date.toLocaleDateString("en-KE")}
          </Text>
        </View>

        {/* Amount and Time*/}
        <View
          style={{ flex: 1, alignItems: "flex-end", justifyContent: "center" }}
        >
          <Text
            style={{
              color: transaction.direction === "IN" ? "seagreen" : "tomato",
              fontSize: 15,
            }}
          >
            {transaction.direction === "IN" ? "+" : "-"} KES{" "}
            {transaction.amount.toLocaleString("en-KE", {
              maximumFractionDigits: 1,
            })}
          </Text>
          <Text style={[styles.timestamp, { color: textColor }]}>
            {date
              .toLocaleTimeString("en-KE", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .toUpperCase()}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    flexDirection: "row",
    marginVertical: 5,
    borderBottomWidth: 0.3,
    paddingBottom: 7,
    borderBottomColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
  },
  profile: {
    height: 40,
    width: 40,
    borderRadius: "50%",
    backgroundColor: "rgba(44, 139, 87, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },
  initial: {
    color: "white",
    fontWeight: 500,
    fontSize: 13,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: 400,
  },
  timestamp: {
    opacity: 0.5,
    fontSize: 12,
  },
});
