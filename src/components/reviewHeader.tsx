import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import useAppStyles from "../utils/styles";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { useTheme } from "../services/theme";
import { Filters } from "../screens/review";
import FilterTransaction from "./filterTransactions";

interface ReviewHeaderProps {
  setFilters: (value: ((prevState: Filters) => Filters) | Filters) => void;
  setSortBy: (value: ((prevState: string) => string) | string) => void;
  filters: Filters;
  sortBy: string;
}

/**
 * Review Header
 * @returns A reusable component that renders the header in the review screen
 */
const ReviewHeader = ({
  setFilters,
  setSortBy,
  filters,
  sortBy,
}: ReviewHeaderProps) => {
  const [isSearching, setIsSearching] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const appStyles = useAppStyles();
  const theme = useTheme();
  const styles = StyleSheet.create({
    mainBar: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    background: {
      flexDirection: "row",
      height: "8%",
      alignItems: "center",
    },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme === "light" ? "lavender" : "grey",
      paddingHorizontal: 5,
      borderRadius: 5,
    },
    icons: {
      fontSize: 30,
      color: "seagreen",
    },
  });
  return (
    <View style={styles.background}>
      {isSearching ? (
        <View style={styles.mainBar}>
          <TouchableWithoutFeedback onPress={() => setIsSearching(false)}>
            <MaterialIcons
              name="close"
              style={[styles.icons, { paddingRight: 5 }]}
            />
          </TouchableWithoutFeedback>
          <View style={styles.searchBar}>
            <TextInput
              placeholder={"Enter merchant name"}
              style={{ flex: 1 }}
            />
            <MaterialIcons
              name="search"
              style={styles.icons}
              onPress={() => Alert.alert("Search to be implemented soon!")}
            />
            {/*TODO: Implement search functionality*/}
          </View>
        </View>
      ) : (
        <View style={styles.mainBar}>
          <Text style={appStyles.heading}>Review</Text>
          <TouchableWithoutFeedback onPress={() => setIsSearching(true)}>
            <MaterialCommunityIcons
              name="database-search"
              style={styles.icons}
            />
          </TouchableWithoutFeedback>
        </View>
      )}
      <MaterialIcons
        name="filter-list-alt"
        style={[styles.icons, { paddingLeft: 5 }]}
        onPress={() => setShowFilterMenu(true)}
      />
      {showFilterMenu && (
        <FilterTransaction
          hideFilterMenu={() => setShowFilterMenu(false)}
          setFilters={setFilters}
          setSortBy={setSortBy}
          filters={filters}
          sortBy={sortBy}
        />
      )}
    </View>
  );
};

export default ReviewHeader;
