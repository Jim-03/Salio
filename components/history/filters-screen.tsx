import {
  darkModeContainerColor,
  lightModeContainerColor,
  primaryColor,
} from "@/constants/colors";
import { useLightTheme } from "@/contexts/theme-provider";
import { TransactionFilters } from "@/utils/database";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "expo-sqlite/kv-store";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface FiltersScreenProps {
  filters: TransactionFilters;
  setFilters: (
    value:
      | ((prevState: TransactionFilters) => TransactionFilters)
      | TransactionFilters,
  ) => void;
  isVisible: boolean;
  close: () => void;
}

/**
 * Filter screen
 *
 * Adjusts the filters used to fetch transactions in the history screen
 * @param {TransactionFilters} filters Current applied filters in the history screen
 * @param {(value: (((prevState: TransactionFilters) => TransactionFilters) | TransactionFilters)) => void} setFilters Function to change the history's filters
 * @param {boolean} isVisible Variable to determine if the filter modal is visible
 * @param {() => void} close function to close the filter modal
 * @returns {React.JSX.Element} Filter screen component for applying filters
 */
export default function FiltersScreen({
  filters,
  setFilters,
  isVisible,
  close,
}: FiltersScreenProps): React.JSX.Element {
  const [newFilters, setNewFilters] = useState<TransactionFilters>(filters);
  const [categories, setCategories] = useState<string[]>([]);
  const [showButtons, setShowButtons] = useState(false);

  const isLight = useLightTheme();
  const overlayBg = isLight ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.75)";
  const cardBg = isLight ? lightModeContainerColor : darkModeContainerColor;
  const mutedText = isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";
  const chipBg = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)";
  const dividerColor = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)";

  useEffect(() => {
    const loadCategories = async () => {
      const data = await AsyncStorage.getItem("categories");
      if (data) setCategories(JSON.parse(data));
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (
      newFilters.category !== "ALL" ||
      filters.category !== "ALL" ||
      newFilters.direction !== "ALL" ||
      filters.direction !== "ALL" ||
      newFilters.sort !== "LATEST" ||
      filters.sort !== "LATEST"
    ) {
      setShowButtons(true);
    } else {
      setShowButtons(false);
    }
  }, [newFilters]);

  const resetFilters = () => {
    setFilters((prev) => ({
      ...prev,
      category: "ALL",
      direction: "ALL",
      sort: "LATEST",
    }));
    close();
  };

  const applyFilters = () => {
    setFilters(newFilters);
    close();
  };

  return (
    <Modal
      transparent={true}
      animationType={"fade"}
      onRequestClose={close}
      visible={isVisible}
    >
      <View style={[styles.overlay, { backgroundColor: overlayBg }]}>
        <View style={[styles.sheet, { backgroundColor: cardBg }]}>
          {/* ── Header ─────────────────────────────────────── */}
          <View style={[styles.header, { borderBottomColor: dividerColor }]}>
            <MaterialIcons name="tune" size={18} color={primaryColor} />
            <Text style={styles.title}>Sort & Filters</Text>
            <TouchableOpacity
              onPress={close}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color={mutedText} />
            </TouchableOpacity>
          </View>

          {/* ── Body ───────────────────────────────────────── */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            {/* Direction */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: mutedText }]}>
                Transaction Direction
              </Text>
              <View style={styles.chipRow}>
                {["IN", "OUT", "ALL"].map((d, k) => (
                  <TouchableOpacity
                    key={k}
                    onPress={() =>
                      setNewFilters((prev) => ({
                        ...prev,
                        direction: d as "IN" | "OUT" | "ALL",
                      }))
                    }
                    activeOpacity={0.75}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          d === newFilters.direction ? primaryColor : chipBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color:
                            d === newFilters.direction ? "#fff" : mutedText,
                        },
                      ]}
                    >
                      {d === "IN" ? "In" : d === "OUT" ? "Out" : "All"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Category */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: mutedText }]}>
                Category
              </Text>
              <View style={styles.chipRow}>
                {[...categories, "ALL", "UNKNOWN"].map((c, k) => (
                  <TouchableOpacity
                    key={k}
                    onPress={() =>
                      setNewFilters((prev) => ({ ...prev, category: c }))
                    }
                    activeOpacity={0.75}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          c === newFilters.category ? primaryColor : chipBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: c === newFilters.category ? "#fff" : mutedText,
                        },
                      ]}
                    >
                      {c === "ALL" ? "All" : c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/* Sort */}
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: mutedText }]}>
                Sort By
              </Text>
              <View style={styles.chipRow}>
                {[
                  { val: "HIGHEST AMOUNT", label: "Highest" },
                  { val: "LEAST AMOUNT", label: "Lowest" },
                  { val: "LATEST", label: "Latest" },
                  { val: "OLDEST", label: "Oldest" },
                ].map(({ val, label }, k) => (
                  <TouchableOpacity
                    key={k}
                    onPress={() =>
                      setNewFilters((prev) => ({
                        ...prev,
                        sort: val as
                          | "HIGHEST AMOUNT"
                          | "LEAST AMOUNT"
                          | "LATEST"
                          | "OLDEST",
                      }))
                    }
                    activeOpacity={0.75}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          val === newFilters.sort ? primaryColor : chipBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: val === newFilters.sort ? "#fff" : mutedText },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* ── Footer ─────────────────────────────────────── */}
          {showButtons && (
            <View style={[styles.footer, { borderTopColor: dividerColor }]}>
              <TouchableWithoutFeedback onPress={resetFilters}>
                <View style={[styles.footerBtn, styles.resetBtn]}>
                  <MaterialIcons
                    name="refresh"
                    size={16}
                    color={primaryColor}
                  />
                  <Text style={[styles.footerBtnText, { color: primaryColor }]}>
                    Reset
                  </Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={applyFilters}>
                <View
                  style={[styles.footerBtn, { backgroundColor: primaryColor }]}
                >
                  <MaterialIcons name="upload" size={16} color="#fff" />
                  <Text style={[styles.footerBtnText, { color: "#fff" }]}>
                    Apply
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sheet: {
    width: "88%",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    maxHeight: "80%",
  },

  // ── Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: primaryColor,
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 2,
  },

  // ── Body
  body: {
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  section: {
    paddingVertical: 14,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
  },

  // ── Footer
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetBtn: {
    borderWidth: 1.5,
    borderColor: primaryColor,
  },
  footerBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
