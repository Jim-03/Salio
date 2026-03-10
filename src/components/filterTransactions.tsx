import {
  Modal,
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "expo-sqlite/kv-store";
import { useTheme } from "../services/theme";
import { MaterialIcons } from "@expo/vector-icons";
import useAppStyles from "../utils/styles";
import { Filters } from "../screens/review";
import { SafeAreaView } from "react-native-safe-area-context";

interface FilterTransactionProps {
  hideFilterMenu: () => void;
  setFilters: (value: ((prevState: Filters) => Filters) | Filters) => void;
  setSortBy: (value: ((prevState: string) => string) | string) => void;
  filters: Filters;
  sortBy: string;
}

/**
 * Filter transactions component
 * @param hideFilterMenu Function to hide the filter menu
 * @param setFilters Modifies the applied filters
 * @param setSortBy Modifies the sort order
 * @param filters Object containing filters
 * @param sortBy String that sorts transactions
 */
const FilterTransaction = ({
  hideFilterMenu,
  setFilters,
  setSortBy,
  filters,
  sortBy,
}: FilterTransactionProps) => {
  const [categories, setCategories] = useState<string[]>([""]);
  const [direction, setDirection] = useState<"ALL" | "IN" | "OUT">(
    filters.direction,
  );
  const [selectedCategory, setSelectedCategory] = useState(filters.category);
  const [modified, setModified] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState(sortBy);
  const theme = useTheme();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { height: screenHeight } = Dimensions.get("window");
  const appStyles = useAppStyles();

  useEffect(() => {
    if (filters.category !== "ALL") setModified(true);
    if (sortBy !== "Latest" || selectedSortBy !== "Latest") setModified(true);
    if (filters.direction !== "ALL") setModified(true);
  }, [selectedCategory, sortBy, direction, selectedSortBy]);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const slide = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [screenHeight, 0],
  });
  useEffect(() => {
    const loadData = async () => {
      const categoriesJSon = await AsyncStorage.getItemAsync("categories");
      if (categoriesJSon) {
        setCategories(JSON.parse(categoriesJSon));
      }
    };
    loadData();
  }, []);

  const styles = StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor:
        theme === "light" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.5)",
    },
    filterForm: {
      backgroundColor: theme === "light" ? "white" : "rgb(45, 45, 45)",
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      minHeight: 300,
      padding: 10,
      width: "100%",
      alignSelf: "center",
      position: "absolute",
      bottom: 0,
    },
    header: {
      justifyContent: "space-between",
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: theme === "light" ? "rgba(0, 0, 0, 0.2)" : "white",
      paddingBottom: 10,
      alignItems: "center",
    },
    headerIcons: {
      fontSize: 25,
      padding: 10,
    },
    heading: {
      fontSize: 20,
      fontWeight: "bold",
    },
    label: {
      fontWeight: "bold",
      marginTop: 5,
      fontSize: 18,
    },
    optionsBackground: {
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      padding: 10,
      flexWrap: "wrap",
      gap: 7,
    },
    directionText: {
      color: theme === "light" ? "black" : "white",
      fontSize: 15,
      backgroundColor:
        theme === "light" ? "rgb(245, 245, 245)" : "rgb(70, 70,70)",
      padding: 10,
      minWidth: 100,
      textAlign: "center",
      borderRadius: 10,
      elevation: 5,
      borderWidth: 1,
      borderColor:
        theme === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.2)",
    },
    activeDirection: {
      backgroundColor: "darkgreen",
      color: "white",
    },
    clearButton: {
      flexDirection: "row",
      marginLeft: "auto",
      height: 40,
      backgroundColor: "maroon",
      width: 100,
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      borderRadius: 10,
      elevation: 10,
    },
  });

  /**
   * Removes any filters that have been applied
   */
  const clearFilters = () => {
    setSelectedCategory("ALL");
    setSortBy("Latest");
    setDirection("ALL");
    setModified(false);
    setSelectedSortBy("Latest");
  };

  const applyFilters = () => {
    setFilters((prev) => ({ ...prev, category: selectedCategory, direction }));
    setSortBy(selectedSortBy);
    hideFilterMenu();
  };

  return (
    <Modal onRequestClose={hideFilterMenu} transparent={true}>
      <View style={styles.background}>
        <Animated.View
          style={[styles.filterForm, { transform: [{ translateY: slide }] }]}
        >
          <SafeAreaView>
            <View style={styles.header}>
              <MaterialIcons
                name="close"
                style={styles.headerIcons}
                color={"red"}
                onPress={hideFilterMenu}
              />
              <Text style={[appStyles.text, styles.heading]}>Filters</Text>
              <MaterialIcons
                name="done"
                style={styles.headerIcons}
                color={"green"}
                onPress={applyFilters}
              />
            </View>
            <View>
              <Text style={[appStyles.text, styles.label]}>
                Transaction Direction:
              </Text>
              <View style={styles.optionsBackground}>
                {["ALL", "IN", "OUT"].map((d, k) => {
                  return (
                    <Text
                      key={k}
                      style={[
                        styles.directionText,
                        direction === d ? styles.activeDirection : undefined,
                      ]}
                      onPress={() => setDirection(d as "ALL" | "IN" | "OUT")}
                    >
                      {d}
                    </Text>
                  );
                })}
              </View>
              <Text style={[appStyles.text, styles.label]}>Category:</Text>
              <View style={styles.optionsBackground}>
                {categories.concat(["AI", "ALL"]).map((c, k) => {
                  return (
                    <Text
                      key={k}
                      style={[
                        styles.directionText,
                        selectedCategory === c
                          ? styles.activeDirection
                          : undefined,
                      ]}
                      onPress={() => setSelectedCategory(c)}
                    >
                      {c}
                    </Text>
                  );
                })}
              </View>
              <Text style={[appStyles.text, styles.label]}>Sort By:</Text>
              <View style={styles.optionsBackground}>
                {["Highest Amount", "Least Amount", "Latest", "Oldest"].map(
                  (s, k) => {
                    return (
                      <Text
                        key={k}
                        onPress={() => setSelectedSortBy(s)}
                        style={[
                          styles.directionText,
                          selectedSortBy === s
                            ? styles.activeDirection
                            : undefined,
                        ]}
                      >
                        {s}
                      </Text>
                    );
                  },
                )}
              </View>
            </View>
            {modified && (
              <TouchableWithoutFeedback onPress={clearFilters}>
                <View style={styles.clearButton}>
                  <MaterialIcons
                    name="cancel"
                    style={{ color: "white", fontSize: 20 }}
                  />
                  <Text style={{ color: "white", fontSize: 20 }}>Clear</Text>
                </View>
              </TouchableWithoutFeedback>
            )}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default FilterTransaction;
