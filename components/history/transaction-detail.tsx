import {
  darkModeContainerColor,
  lightModeContainerColor,
  primaryColor,
} from "@/constants/colors";
import { useLightTheme } from "@/contexts/theme-provider";
import { TransactionRecord } from "@/utils/database";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "expo-sqlite/kv-store";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface TransactionDetailModalProps {
  transaction: TransactionRecord | null;
  isVisible: boolean;
  close: () => void;
  onCategoryChange: (
    transactionId: number,
    newCategory: string,
    applyToMerchant: boolean,
    merchant: string,
  ) => void;
}

/**
 * Convert timestamp to date string
 * @param {string} ts Timestamp in milliseconds
 * @returns {string} Date string
 */
function formatTimestamp(ts: string): string {
  const date = new Date(Number(ts));
  return date.toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Convert amount to string
 *
 * Uses the direction to determine add a -/+ prefix
 * @param {number} amount
 * @param {"IN" | "OUT"} direction
 * @returns {string} Amount string with a -/+ prefix
 */
function formatAmount(amount: number, direction: "IN" | "OUT"): string {
  const formatted = amount.toLocaleString("en-KE", {
    maximumFractionDigits: 2,
  });
  return direction === "IN" ? `+ KES ${formatted}` : `- KES ${formatted}`;
}

function Badge({
  label,
  color,
  bg,
}: {
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueColor,
  mutedText,
  tint,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
  mutedText: string;
  tint: string;
}) {
  return (
    <View style={styles.detailRow}>
      <MaterialIcons
        name={icon as any}
        size={16}
        color={mutedText}
        style={styles.detailIcon}
      />
      <View style={styles.detailContent}>
        <Text style={[styles.detailLabel, { color: mutedText }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: valueColor ?? tint }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/**
 * Modal to display the details of a transaction
 *
 * Include an option to add a new category
 * A user can update the category of a single transaction or all transactions under the same
 * merchant
 * Updating a category results in training the ML model for future predictions
 * @param {TransactionRecord | null} transaction Transaction data
 * @param {boolean} isVisible Determines if the modal should be shown
 * @param {() => void} close Function to remove the modal from view
 * @param {(
 *      transactionId: number,
 *      newCategory: string,
 *      applyToMerchant: boolean,
 *      merchant: string) => void} onCategoryChange Function triggered when a category is changed
 * @returns {React.JSX.Element | null} Modal component to review transaction detail
 */
export default function TransactionDetailModal({
  transaction,
  isVisible,
  close,
  onCategoryChange,
}: TransactionDetailModalProps): React.JSX.Element | null {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [applyToMerchant, setApplyToMerchant] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isLight = useLightTheme();
  const overlayBg = isLight ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.75)";
  const cardBg = isLight ? lightModeContainerColor : darkModeContainerColor;
  const mutedText = isLight ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";
  const chipBg = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)";
  const dividerColor = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)";
  const tint = isLight ? "#000" : "#fff";
  const inputBg = isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)";

  const incomeColor = "#16a34a";
  const expenseColor = "#e53e3e";

  // Load categories from AsyncStorage
  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem("categories");
      if (data) setCategories(JSON.parse(data));
    };
    load();
  }, [isVisible]);

  // Sync selected category when transaction changes
  useEffect(() => {
    if (transaction) {
      setSelectedCategory(transaction.category ?? "ALL");
      setApplyToMerchant(false);
      setNewCategoryInput("");
      setShowNewCategoryInput(false);
    }
  }, [transaction]);

  if (!transaction) return null;

  const categoryChanged = selectedCategory !== transaction.category;
  const isIncome = transaction.direction === "IN";
  const amountColor = isIncome ? incomeColor : expenseColor;

  //  Flags
  const flags = [
    transaction.is_paybill === 1 && "Paybill",
    transaction.is_send_money === 1 && "Send Money",
    transaction.is_buy_goods === 1 && "Buy Goods",
    transaction.is_reversal === 1 && "Reversal",
  ].filter(Boolean) as string[];

  //  Add new category
  const handleAddCategory = async () => {
    const trimmed = newCategoryInput.trim().toUpperCase();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      Alert.alert("Exists", `"${trimmed}" is already a category.`);
      return;
    }
    const updated = [...categories, trimmed];
    await AsyncStorage.setItem("categories", JSON.stringify(updated));
    setCategories(updated);
    setSelectedCategory(trimmed);
    setNewCategoryInput("");
    setShowNewCategoryInput(false);
  };

  //  Apply category change
  const handleApply = () => {
    if (!categoryChanged) {
      close();
      return;
    }
    onCategoryChange(
      transaction.id,
      selectedCategory,
      applyToMerchant,
      transaction.merchant,
    );
    close();
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={close}
    >
      <View style={[styles.overlay, { backgroundColor: overlayBg }]}>
        <View style={[styles.sheet, { backgroundColor: cardBg }]}>
          {/*  Header  */}
          <View style={[styles.header, { borderBottomColor: dividerColor }]}>
            <MaterialIcons name="receipt-long" size={18} color={primaryColor} />
            <Text style={styles.headerTitle}>Transaction Detail</Text>
            <TouchableOpacity onPress={close} activeOpacity={0.7}>
              <MaterialIcons name="close" size={20} color={mutedText} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.body}
          >
            {/*  Amount hero  */}
            <View style={styles.amountHero}>
              <Text style={[styles.amountText, { color: amountColor }]}>
                {formatAmount(transaction.amount, transaction.direction)}
              </Text>
              <View style={styles.badgeRow}>
                <Badge
                  label={isIncome ? "Incoming" : "Outgoing"}
                  color={isIncome ? incomeColor : expenseColor}
                  bg={isIncome ? "rgba(22,163,74,0.1)" : "rgba(229,62,62,0.1)"}
                />
                {flags.map((f) => (
                  <Badge key={f} label={f} color={mutedText} bg={chipBg} />
                ))}
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/*  Core details ─ */}
            <View style={styles.section}>
              <DetailRow
                icon="store"
                label="Merchant"
                value={transaction.merchant}
                tint={tint}
                mutedText={mutedText}
              />
              <DetailRow
                icon="schedule"
                label="Date & Time"
                value={formatTimestamp(transaction.transaction_timestamp)}
                tint={tint}
                mutedText={mutedText}
              />
              <DetailRow
                icon="tag"
                label="Reference"
                value={transaction.reference_number}
                tint={tint}
                mutedText={mutedText}
              />
              <DetailRow
                icon="account-balance-wallet"
                label="Balance After"
                value={`KES ${transaction.balance.toLocaleString("en-KE", { maximumFractionDigits: 2 })}`}
                tint={tint}
                mutedText={mutedText}
              />
              {transaction.transaction_cost > 0 && (
                <DetailRow
                  icon="payments"
                  label="Transaction Cost"
                  value={`KES ${transaction.transaction_cost.toLocaleString("en-KE", { maximumFractionDigits: 2 })}`}
                  valueColor={expenseColor}
                  tint={tint}
                  mutedText={mutedText}
                />
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: dividerColor }]} />

            {/*  Category picker  */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionLabel, { color: mutedText }]}>
                  Category
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowNewCategoryInput((v) => !v);
                    setTimeout(() => inputRef.current?.focus(), 100);
                  }}
                  activeOpacity={0.75}
                  style={styles.addCategoryBtn}
                >
                  <MaterialIcons
                    name={showNewCategoryInput ? "remove" : "add"}
                    size={14}
                    color={primaryColor}
                  />
                  <Text
                    style={[styles.addCategoryText, { color: primaryColor }]}
                  >
                    New category
                  </Text>
                </TouchableOpacity>
              </View>

              {/* New category input */}
              {showNewCategoryInput && (
                <View style={styles.newCategoryRow}>
                  <TextInput
                    ref={inputRef}
                    value={newCategoryInput}
                    onChangeText={(t) => setNewCategoryInput(t.toUpperCase())}
                    placeholder="E.g. GROCERIES"
                    placeholderTextColor={mutedText}
                    autoCapitalize="characters"
                    style={[
                      styles.categoryInput,
                      {
                        backgroundColor: inputBg,
                        color: tint,
                        borderColor: dividerColor,
                      },
                    ]}
                  />
                  <TouchableOpacity
                    onPress={handleAddCategory}
                    activeOpacity={0.8}
                    style={[styles.addBtn, { backgroundColor: primaryColor }]}
                  >
                    <MaterialIcons name="check" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Category chips */}
              <View style={styles.chipRow}>
                {[...categories, "ALL", "UNKNOWN"].map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedCategory(c)}
                    activeOpacity={0.75}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          c === selectedCategory ? primaryColor : chipBg,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: c === selectedCategory ? "#fff" : mutedText },
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Apply to merchant checkbox — only when category changed */}
              {categoryChanged && (
                <TouchableWithoutFeedback
                  onPress={() => setApplyToMerchant((v) => !v)}
                >
                  <View
                    style={[styles.checkboxRow, { borderColor: dividerColor }]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: applyToMerchant
                            ? primaryColor
                            : "transparent",
                          borderColor: applyToMerchant
                            ? primaryColor
                            : mutedText,
                        },
                      ]}
                    >
                      {applyToMerchant && (
                        <MaterialIcons name="check" size={12} color="#fff" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.checkboxLabel, { color: tint }]}>
                        Apply to all transactions from{" "}
                        <Text
                          style={{ color: primaryColor, fontWeight: "700" }}
                        >
                          {transaction.merchant}
                        </Text>
                      </Text>
                      <Text style={[styles.checkboxSub, { color: mutedText }]}>
                        This helps train the category model for this merchant.
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              )}
            </View>
          </ScrollView>

          {/*  Footer  */}
          <View style={[styles.footer, { borderTopColor: dividerColor }]}>
            <TouchableOpacity
              onPress={close}
              activeOpacity={0.75}
              style={[
                styles.footerBtn,
                { borderColor: dividerColor, borderWidth: 1.5 },
              ]}
            >
              <Text style={[styles.footerBtnText, { color: mutedText }]}>
                Dismiss
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              activeOpacity={0.85}
              style={[
                styles.footerBtn,
                { backgroundColor: categoryChanged ? primaryColor : chipBg },
              ]}
            >
              <MaterialIcons
                name="save"
                size={15}
                color={categoryChanged ? "#fff" : mutedText}
              />
              <Text
                style={[
                  styles.footerBtnText,
                  { color: categoryChanged ? "#fff" : mutedText },
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
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
    width: "90%",
    maxHeight: "85%",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },

  //  Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: primaryColor,
    letterSpacing: 0.3,
  },

  //  Body
  body: {
    paddingHorizontal: 18,
    paddingVertical: 4,
  },

  //  Amount hero
  amountHero: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
  },
  amountText: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  //  Detail rows
  section: {
    paddingVertical: 12,
    gap: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  detailIcon: {
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
    gap: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },

  divider: {
    height: 1,
  },

  //  Category section
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  addCategoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  addCategoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  newCategoryRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  categoryInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "600",
    borderWidth: 1,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },

  //  Merchant checkbox
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  checkboxSub: {
    fontSize: 11,
    marginTop: 2,
  },

  //  Footer
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
  footerBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
