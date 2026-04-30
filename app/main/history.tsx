import SearchBar from "@/components/history/search-bar";
import TransactionDetailModal from "@/components/history/transaction-detail";
import TransactionRow from "@/components/transaction-row";
import { darkModeBackground, lightModeBackground } from "@/constants/colors";
import { useDB } from "@/contexts/database-provider";
import { useModel } from "@/contexts/model-provider";
import { useSms } from "@/contexts/sms-provider";
import { useLightTheme } from "@/contexts/theme-provider";
import {
  getAllTransactions,
  TransactionFilters,
  TransactionRecord,
  updateTransaction,
} from "@/utils/database";
import React, { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

const FlatListRow = memo(
  ({ item, onPress }: { item: TransactionRecord; onPress: () => void }) => (
    <TransactionRow transaction={item} onPress={onPress} />
  ),
);

/**
 * History screen
 *
 * Allows user's to view their past transactions
 * Contains a search bar where users can search for transactions under a specific merchant
 * @returns {React.JSX.Element} A history screen component
 */
export default function History(): React.JSX.Element {
  const [filters, setFilters] = useState<TransactionFilters>({
    category: "ALL",
    direction: "ALL",
    merchant: "ALL",
    sort: "LATEST",
  });
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoadingMoreData, setIsLoadingMoreData] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionRecord | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const renderItem = useCallback(
    ({ item }: { item: TransactionRecord }) => (
      <FlatListRow
        item={item}
        onPress={() => {
          setSelectedTransaction(item);
          setShowTransactionModal(true);
        }}
      />
    ),
    [],
  );

  const isImporting = useSms();
  const db = useDB();
  const isLight = useLightTheme();

  const { train } = useModel();

  const backgroundColor = isLight ? lightModeBackground : darkModeBackground;

  useEffect(() => {
    const loadMoreData = async () => {
      if (isImporting) return;

      setIsLoadingMoreData(true);

      try {
        const data = await getAllTransactions(db, filters, offset);

        if (data) {
          setTransactions((prev) => {
            if (offset === 0) return data;

            const existingId = new Set(prev.map((p) => p.id));
            const newRecords = data.filter((t) => !existingId.has(t.id));
            return [...prev, ...newRecords];
          });
        }
      } finally {
        setIsLoadingMoreData(false);
      }
    };

    loadMoreData();
  }, [offset, filters, db]);

  useEffect(() => {
    setOffset(0);
    setTransactions([]);
  }, [filters]);

  const changeCategory = async (
    transactionId: number,
    newCategory: string,
    applyToMerchant: boolean,
    merchant: string,
  ) => {
    await updateTransaction(
      db,
      transactionId,
      applyToMerchant,
      merchant,
      newCategory,
    );
    await train();
  };

  return (
    <View style={[styles.background, { backgroundColor }]}>
      {showTransactionModal && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          isVisible={showTransactionModal}
          close={() => setShowTransactionModal(false)}
          onCategoryChange={changeCategory}
        />
      )}
      {/* Search Bar*/}
      <SearchBar setFilters={setFilters} filters={filters} />

      {/* Transactions list */}
      <View>
        <FlatList
          data={transactions}
          renderItem={renderItem}
          onEndReached={() => setOffset((prev) => prev + 10)}
        />
      </View>

      {/* Loading Icon */}
      {isLoadingMoreData && <ActivityIndicator size={20} />}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 168,
  },
});
