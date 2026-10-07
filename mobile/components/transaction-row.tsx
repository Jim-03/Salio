import { Transaction } from "@/lib/dto";
import { useData } from "@/providers/data-provider.component";
import { Modal, Pressable, Text, View } from "react-native";
import { useEffect, useState } from "react";
import CategoryPicker from "@/components/category-picker";

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
  const [showTransactionModal, setShowTransactionModal] = useState(false);
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
      onPress={() => setShowTransactionModal(true)}
    >
      {showTransactionModal && (
        <TransactionModal
          transaction={transaction}
          close={() => setShowTransactionModal(false)}
          isIncome={incoming}
        />
      )}
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

/**
 * Re-usable component rendering a transaction's details
 * @param props
 * @param props.transaction Transaction data
 * @param props.close State function to close modal
 * @param props.isIncome Condition to confirm if the transaction is an income/expense
 */
const TransactionModal = ({
  transaction,
  close,
  isIncome,
}: {
  transaction: Transaction;
  close: () => void;
  isIncome: boolean;
}) => {
  const { data } = useData();
  const transactionData = [
    { "Transaction code": transaction.code },
    { Date: new Date(transaction.timestamp) },
    { Amount: transaction.amount },
    { "Transaction cost": transaction.cost },
    {
      Platform: data.addresses.find((a) => a.id === transaction.address_id)
        ?.name,
    },
  ];
  const color = isIncome
    ? "text-green-800 dark:text-green-600"
    : "text-red-600";

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    transaction.category_id || 0,
  );

  useEffect(() => {
    // TODO: Update transaction
    transaction.category_id = selectedCategory;
  }, [selectedCategory]);

  return (
    <Modal animationType={"fade"} onRequestClose={close} transparent>
      {/* Background */}
      <View className={"flex-1 bg-black/60 justify-center items-center"}>
        {/* Main */}
        <View
          className={
            "bg-[rgb(245_245_245)] dark:bg-gray-600 p-5 rounded-xl elevation-md w-[90%]"
          }
        >
          {/* Header */}
          <Text className={`text-center font-bold ${color} text-2xl mb-2`}>
            {transaction.recipient}
          </Text>

          {/* Content */}
          {transactionData.map((t, k) => {
            const label = Object.keys(t)[0];
            let value = Object.values(t)[0];

            if (value instanceof Date) {
              value = value.toDateString();
            }

            return (
              <View key={k} className={"flex-row items-center"}>
                <Text
                  className={"w-1/2 mt-2 mb-2 font-semibold dark:text-amber-50"}
                >
                  {label}:{" "}
                </Text>
                <Text
                  className={`${!isNaN(value) && label === "Amount" ? color : "dark:text-white"}`}
                >
                  {!isNaN(value) ? `Kshs. ${value}` : value}
                </Text>
              </View>
            );
          })}

          {/* SMS message */}
          <Text
            className={
              "bg-black/15 dark:text-white p-4 text-justify rounded-xl mt-5"
            }
          >
            {transaction.sms}
          </Text>

          {/* Category */}
          {showCategoryPicker && (
            <CategoryPicker
              close={() => setShowCategoryPicker(false)}
              category={selectedCategory}
              changeCategory={setSelectedCategory}
            />
          )}
          <View className={"flex-row items-center mt-5"}>
            <Text className={"font-semibold dark:text-white mr-5"}>
              Category:
            </Text>
            <Pressable
              className={"bg-green-900 rounded"}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text className={" p-2.5  text-white"}>
                {transaction.category_id
                  ? data.categories.get(transaction.category_id)?.name
                  : "UNKNOWN"}
              </Text>
            </Pressable>
          </View>
          {transaction.autocategorized && <Text></Text>}
        </View>
      </View>
    </Modal>
  );
};
