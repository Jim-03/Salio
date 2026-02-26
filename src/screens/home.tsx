import { View } from "react-native";
import { JSX } from "react";
import HomeBanner from "../components/homeBanner";
import ExpenseSummary from "../components/expenseSummary";

/**
 * Home page
 * @returns {JSX.Element} A reusable component that renders the home page
 */
const Home = (): JSX.Element => {
  return (
    <View style={{ flex: 1 }}>
      <HomeBanner />
      <ExpenseSummary />
    </View>
  );
};

export default Home;
