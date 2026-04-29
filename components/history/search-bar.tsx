import {
  darkModeContainerColor,
  lightModeContainerColor,
  primaryColor,
} from "@/constants/colors";
import { useLightTheme } from "@/contexts/theme-provider";
import { TransactionFilters } from "@/utils/database";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface SearchBarProps {
  setFilters: (
    value:
      | ((prevState: TransactionFilters) => TransactionFilters)
      | TransactionFilters,
  ) => void;
  filters: TransactionFilters;
}

/**
 * History Search bar
 * @param {(value: (((prevState: TransactionFilters) => TransactionFilters) | TransactionFilters)) => void} setFilters Function to change the fetch filters
 * @param {TransactionFilters} filters Filters applied when fetching transactions
 * @returns {React.JSX.Element} A search bar component in the history screen
 */
export default function SearchBar({ setFilters, filters }: SearchBarProps): React.JSX.Element {
  const [search, setSearch] = useState("");

  const isLight = useLightTheme();
  const bgColor = isLight ? lightModeContainerColor : darkModeContainerColor;
  const color = isLight ? "black" : "white";
  const borderColor = isLight
    ? "rgba(46, 139, 87, 0.5)"
    : "rgba(255, 255, 255, 0.5)";

  const searchMerchant = () => {
    Keyboard.dismiss();
    if (search && search !== filters.merchant)
      setFilters((f) => ({ ...f, merchant: search }));
  };

  const close = () => {
    Keyboard.dismiss();
    if (search && search === filters.merchant) {
      setFilters((f) => ({ ...f, merchant: "ALL" }));
    }
    setSearch("");
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.searchBar, { borderColor }]}>
        {search && (
          <TouchableWithoutFeedback onPress={close}>
            <View style={styles.button}>
              <MaterialIcons name={"close"} style={styles.icon} />
            </View>
          </TouchableWithoutFeedback>
        )}
        <TextInput
          inputMode={"search"}
          value={search}
          placeholder={"Search for merchants"}
          style={[styles.textInput, { color }]}
          onChangeText={setSearch}
        />
        <TouchableWithoutFeedback onPress={searchMerchant}>
          <View style={[styles.button, { marginRight: 10 }]}>
            <MaterialIcons name={"search"} style={styles.icon} />
          </View>
        </TouchableWithoutFeedback>
      </View>
      <TouchableWithoutFeedback>
        <View style={styles.button}>
          <MaterialIcons name={"filter-alt"} style={styles.icon} />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 70,
    marginTop: 5,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 10,
    elevation: 5,
    borderRadius: 5,
  },
  searchBar: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
  },
  textInput: {
    flex: 1,
    letterSpacing: 2,
  },
  button: {
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 24,
    color: primaryColor,
  },
});
