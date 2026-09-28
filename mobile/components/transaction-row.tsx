import { Transaction } from "@/lib/dto";
import { useData } from "@/providers/data-provider.component";
import { Pressable, Text, View } from "react-native";

/**
 * Component rendering transaction rows
 * @param props Component props
 * @param props.transaction Transaction data
 */
export const TransactionRow = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  const date = new Date(transaction.timestamp);
  const { data } = useData();
  const incoming =
    transaction.action.includes("receive") ||
    (transaction.action.includes("reverse") &&
      transaction.sms.includes("credit"));

  /**
   * Get two-lettered initials from recipient name
   * @param recipientName
   */
  const getInitials = (recipientName: string) => {
    const names = recipientName.trim().split(/\s/);

    return `${names[0][0]}${names[1] ? names[1][0] : ""}`;
  };

  return (
    <Pressable
      className={
        "mt-2.5 mb-2.5 flex-row items-center border-b border-b-black/10 dark:border-b-white/30 pb-2 pt-2 h-20"
      }
    >
      {/* Initials */}
      <Text
        className={
          "bg-green-800 rounded-full p-2.5 text-white font-bold text-xl mr-2 w-14 h-14 text-center align-middle"
        }
      >
        {getInitials(transaction.recipient || "R").toUpperCase()}
      </Text>

      {/* Transaction details */}
      <View className={"justify-center gap-1 w-1/3 h-full mr-auto"}>
        <Text numberOfLines={1} className={"dark:text-white"}>
          {transaction.recipient}
        </Text>
        <View>
          <Text className={"text-xs text-black/60 dark:text-white/60"}>
            {date
              .toLocaleString([], { timeStyle: "short", dateStyle: "medium" })
              .replace(",", "")}
          </Text>
        </View>
      </View>

      {/* Payment */}
      <View className={"h-full gap-1 w-1/2 justify-center items-end"}>
        <Text
          numberOfLines={1}
          className={`${incoming ? "text-green-800" : "text-red-600"} font-semibold`}
        >
          {incoming ? "+" : "-"} Ksh.{" "}
          {transaction.amount.toLocaleString([], {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
          })}
        </Text>
        <Text className={"text-xs text-green-950 dark:text-green-400"}>
          {data.addresses.find((t) => t.id === transaction.address_id)?.name}
        </Text>
      </View>
    </Pressable>
  );
};
