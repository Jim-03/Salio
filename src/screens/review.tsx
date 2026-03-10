import { View } from "react-native";
import ReviewHeader from "../components/reviewHeader";
import Transactions from "../components/transactions";
import { useState } from "react";

export interface Filters {
  category: string;
  direction: "IN" | "OUT" | "ALL";
}

/**
 * A screen component that renders a list of transactions
 *
 * Allows users to review, search, filter and modify transactions' details
 * @returns A Review screen component
 */
const Review = () => {
  const [filters, setFilters] = useState<Filters>({
    category: "ALL",
    direction: "ALL",
  });
  const [sortBy, setSortBy] = useState("Latest");

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <ReviewHeader
        setFilters={setFilters}
        setSortBy={setSortBy}
        filters={filters}
        sortBy={sortBy}
      />
      <Transactions filters={filters} sortBy={sortBy} />
    </View>
  );
};

export default Review;
