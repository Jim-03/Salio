import { Transaction } from "@/lib/dto";
import { useData } from "@/providers/data-provider.component";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useState } from "react";
import CategoryPicker from "@/components/category-picker";
import { createAnimatedComponent, SlideInLeft } from "react-native-reanimated";
import Lucide from "@react-native-vector-icons/lucide";

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
  const AnimatedPressable = createAnimatedComponent(Pressable);

  /**
   * Get two-lettered initials from recipient name
   * @param recipientName
   */
  const getInitials = (recipientName: string) => {
    const names = recipientName.trim().split(/\s/);

    return `${names[0][0]}${names[1] ? names[1][0] : ""}`;
  };

  return (
    <AnimatedPressable
      className={
        "mt-2.5 mb-2.5 flex-row items-center border-b border-b-black/10 dark:border-b-white/30 pb-2 pt-2 h-20"
      }
      entering={SlideInLeft}
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
    </AnimatedPressable>
  );
};

/**
 * Re-usable component rendering a transaction's details
 * @param props
 * @param props.transaction Transaction data
 * @param props.close State function to close modal
 * @param props.isIncome Condition to confirm if the transaction is an income/expense
 */
export const TransactionModal = ({
  transaction,
  close,
  isIncome,
}: {
  transaction: Transaction;
  close: () => void;
  isIncome: boolean;
}) => {
  const isDark = useColorScheme() === "dark";
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

  const amountColor = isIncome
    ? "text-green-700 dark:text-green-500"
    : "text-red-600 dark:text-red-500";

  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    transaction.category_id || 0,
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const hasCategoryChanged =
    selectedCategory !== (transaction.category_id || 0);

  const handleUpdate = async () => {
    // TODO: Implement your update logic here
    setIsUpdating(true);
    try {
      console.log(
        "Updating transaction with new category ID:",
        selectedCategory,
      );
      // await client.patch(`/transactions/${transaction.id}`, { category_id: selectedCategory });

      // Update the local object if you aren't refetching immediately
      // transaction.category_id = selectedCategory;

      close();
    } catch (error) {
      console.error("Failed to update category:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Modal animationType="fade" onRequestClose={close} transparent>
      {/* Background */}
      <View className="flex-1 bg-black/60 justify-center items-center p-4">
        {/* Main Card */}
        <View className="bg-amber-50 dark:bg-slate-900 p-6 rounded-[32px] elevation-xl w-full max-h-[90%] shadow-2xl">
          {/* Header Row */}
          <View className="flex-row justify-between items-start mb-6">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-semibold text-green-900/60 dark:text-amber-50/60 uppercase tracking-wider mb-1">
                {isIncome ? "Received From" : "Sent To"}
              </Text>
              <Text
                className="font-bold text-gray-900 dark:text-white text-2xl"
                numberOfLines={2}
              >
                {transaction.recipient}
              </Text>
            </View>
            <Pressable
              onPress={close}
              className="p-2 bg-black/5 dark:bg-white/10 rounded-full"
            >
              <Lucide name="x" size={20} color={isDark ? "white" : "#022c22"} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Details List */}
            <View className="bg-white/50 dark:bg-black/20 rounded-2xl p-4 mb-5 border border-black/5 dark:border-white/5">
              {transactionData.map((t, k) => {
                const label = Object.keys(t)[0];
                let value = Object.values(t)[0];

                if (value instanceof Date) {
                  value = value.toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }

                const isAmount = label === "Amount";
                const displayValue =
                  isAmount && !isNaN(Number(value))
                    ? `Kshs. ${Number(value).toLocaleString()}`
                    : value;

                return (
                  <View
                    key={k}
                    className={`flex-row justify-between items-center py-3 ${
                      k !== transactionData.length - 1
                        ? "border-b border-black/5 dark:border-white/10"
                        : ""
                    }`}
                  >
                    <Text className="text-gray-500 dark:text-gray-400 font-medium">
                      {label}
                    </Text>
                    <Text
                      className={`font-semibold text-right max-w-[60%] ${isAmount ? amountColor : "text-gray-900 dark:text-white"}`}
                    >
                      {displayValue || "-"}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Category Selector */}
            <Text className="text-sm font-semibold text-green-900/60 dark:text-amber-50/60 uppercase tracking-wider mb-2 ml-1">
              Category
            </Text>
            <Pressable
              className="flex-row items-center justify-between bg-white dark:bg-black/20 border border-green-900/20 dark:border-amber-50/20 p-4 rounded-2xl mb-5"
              onPress={() => setShowCategoryPicker(true)}
            >
              <View className="flex-row items-center gap-3">
                <View className="bg-green-100 dark:bg-green-900/40 p-2 rounded-full">
                  <Lucide
                    name="tag"
                    size={20}
                    color={isDark ? "#4ade80" : "#14532d"}
                  />
                </View>
                <Text className="font-semibold text-gray-900 dark:text-white text-base">
                  {selectedCategory
                    ? data.categories.get(selectedCategory)?.name
                    : "UNKNOWN"}
                </Text>
              </View>
              <Lucide
                name="chevron-right"
                size={20}
                color={isDark ? "gray" : "gray"}
              />
            </Pressable>

            {/* SMS message */}
            <Text className="text-sm font-semibold text-green-900/60 dark:text-amber-50/60 uppercase tracking-wider mb-2 ml-1">
              Message Source
            </Text>
            <View className="bg-amber-100/50 dark:bg-slate-800/80 p-4 rounded-2xl border border-amber-200/50 dark:border-slate-700">
              <Text className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                &#34;{transaction.sms}&#34;
              </Text>
            </View>

            {/* Spacer for scrollview */}
            <View className="h-6" />
          </ScrollView>

          {/* Conditional Update Button */}
          {hasCategoryChanged && (
            <View className="pt-4 mt-2 border-t border-black/5 dark:border-white/10">
              <Pressable
                onPress={handleUpdate}
                disabled={isUpdating}
                className={`py-4 rounded-2xl items-center justify-center flex-row gap-2 ${
                  isUpdating ? "bg-green-900/70" : "bg-green-900"
                }`}
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text className="text-white font-bold text-base">
                      Update Category
                    </Text>
                    <Lucide name="check-circle" size={18} color="white" />
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* Category Modal Picker */}
          {showCategoryPicker && (
            <CategoryPicker
              close={() => setShowCategoryPicker(false)}
              category={selectedCategory}
              changeCategory={setSelectedCategory}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
