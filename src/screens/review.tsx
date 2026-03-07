import { View } from "react-native";
import ReviewHeader from "../components/reviewHeader";
import Transactions from "../components/transactions";

/**
 * A screen component that renders a list of transactions
 *
 * Allows users to review, search, filter and modify transactions' details
 * @returns A Review screen component
 */
const Review = () => {
  return (
    <View style={{
      flex: 1
    }}>
      <ReviewHeader />
      <Transactions />
    </View>
  );
};

export default Review;
