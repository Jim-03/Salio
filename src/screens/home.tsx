import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { JSX, useEffect, useState } from "react";
import HomeBanner from "../components/homeBanner";
import ExpenseSummary from "../components/expenseSummary";
import { getLast5Transactions, TransactionRecord } from "../utils/database";
import { useDB } from "../services/database";
import Review from "../components/review";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../services/theme";
import HomeReview from "../components/homeReview";

interface HomeProps {
  setToReviewScreen: () => void;
}

/**
 * Home page
 * @returns {JSX.Element} A reusable component that renders the home page
 */
const Home = ({ setToReviewScreen }: HomeProps): JSX.Element => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    labelContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 10,
      paddingHorizontal: 5,
    },
    labelText: {
      color: theme === "light" ? "seagreen" : "white",
      fontWeight: "bold",
      fontSize: 17,
      opacity: 0.8,
    },
  });
  return (
    <View style={{ flex: 1 }}>
      <HomeBanner />
      <ExpenseSummary />
      <View style={styles.labelContainer}>
        <Text style={styles.labelText}>Latest Transactions</Text>
        <TouchableWithoutFeedback onPress={setToReviewScreen}>
          <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
            <Text style={styles.labelText}>View All</Text>
            <MaterialCommunityIcons
              name="hand-pointing-right"
              size={24}
              color={theme === "light" ? "seagreen" : "white"}
              style={{ opacity: 0.8 }}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
      <HomeReview />
    </View>
  );
};

export default Home;
