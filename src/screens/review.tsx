import { View } from "react-native";
import ReviewHeader from "../components/reviewHeader";

/**
 * A screen component that renders a list of transactions
 *
 * Allows users to review, search, filter and modify transactions' details
 * @returns A Review screen component
 */
const Review = () => {
  return (
    <View>
      <ReviewHeader />
    </View>
  );
};

export default Review;
