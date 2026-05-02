import { useLightTheme } from "@/contexts/theme-provider";
import { TransactionRecord } from "@/utils/database";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

/**
 * Display a circular component with the merchant's initial
 * @param {string[]} names A list of the merchant's name
 * @param {boolean} isLight Confirmatory to use light theme style
 * @returns {React.JSX.Element} A component that renders a profile photo like UI
 */
const MerchantIcon = ({
  names,
  isLight,
}: {
  names: string[];
  isLight: boolean;
}): React.JSX.Element => {
  const initials = `${names[0][0]}${names[1] ? names[1][0] : ""}`.toUpperCase();
  return (
    <View
      style={[
        styles.profile,
        isLight ? styles.profileLight : styles.profileDark,
      ]}
    >
      <Text style={styles.initial}>{initials}</Text>
    </View>
  );
};

/**
 * Badge to indicate transactions categorized by AI
 * @param {boolean} isLight Confirmatory to use light theme mode
 * @returns {React.JSX.Element} A reusable component to indicate AI categorized transactions
 */
const AiBadge = ({ isLight }: { isLight: boolean }): React.JSX.Element => {
  const badgeBg = isLight
    ? "rgba(44, 139, 87, 0.10)"
    : "rgba(44, 139, 87, 0.22)";
  const badgeBorder = isLight
    ? "rgba(44, 139, 87, 0.30)"
    : "rgba(44, 139, 87, 0.45)";
  const badgeText = isLight ? "#1a7a52" : "#5cd49a";

  return (
    <View
      style={[
        styles.aiBadge,
        { backgroundColor: badgeBg, borderColor: badgeBorder },
      ]}
    >
      <MaterialIcons name={"auto-awesome"} color={badgeText} />
      <Text style={[styles.aiBadgeText, { color: badgeText }]}>
        AI · may vary
      </Text>
    </View>
  );
};

/**
 * Render the summary of a transaction
 * @param {TransactionRecord} transaction An object containing a transaction's summary
 * @param {() => void} onPress function triggered when the row is clicked
 * @returns {React.JSX.Element} A component rendering the transaction summary
 */
export default function TransactionRow({
  transaction,
  onPress,
}: {
  transaction: TransactionRecord;
  onPress?: () => void;
}): React.JSX.Element {
  const date = new Date(Number(transaction.transaction_timestamp));
  const isLight = useLightTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const merchantNames = transaction.merchant.split(/\s+/);
  const isIncoming = transaction.direction === "IN";

  const textPrimary = isLight ? "#111827" : "#f3f4f6";
  const textSecondary = isLight ? "#6b7280" : "#9ca3af";
  const dividerColor = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)";
  const rowBg = isLight ? "#ffffff" : "#111827"; // used for shadow context only
  const amountColor = isIncoming ? "#16a34a" : "#ef4444";

  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 50,
    }).start();
  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
    }).start();

  const formattedDate = date.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date
    .toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();

  const categoryLabel = transaction.category
    ? transaction.category.charAt(0).toUpperCase() +
      transaction.category.slice(1).toLowerCase()
    : null;

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          styles.row,
          { borderBottomColor: dividerColor, transform: [{ scale }] },
        ]}
      >
        {/* Left: Icon */}
        <MerchantIcon names={merchantNames} isLight={isLight} />

        {/* Center: Name / meta */}
        <View style={styles.centerBlock}>
          <Text
            style={[styles.merchantName, { color: textPrimary }]}
            numberOfLines={1}
          >
            {merchantNames[0]}
            {merchantNames[1] ? ` ${merchantNames[1]}` : ""}
          </Text>

          {/* Meta row: date · category pill */}
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: textSecondary }]}>
              {formattedDate}
            </Text>
            {categoryLabel && (
              <>
                <View
                  style={[styles.metaDot, { backgroundColor: textSecondary }]}
                />
                <Text
                  style={[styles.metaText, { color: textSecondary }]}
                  numberOfLines={1}
                >
                  {categoryLabel}
                </Text>
              </>
            )}
          </View>

          {/* AI badge */}
          {transaction.is_ai_categorized === 1 && <AiBadge isLight={isLight} />}
        </View>

        {/* Right: Amount / time */}
        <View style={styles.rightBlock}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {isIncoming ? "+" : "−"}{" "}
            {transaction.amount.toLocaleString("en-KE", {
              maximumFractionDigits: 1,
            })}
          </Text>
          <Text style={[styles.currency, { color: textSecondary }]}>KES</Text>
          <Text style={[styles.time, { color: textSecondary }]}>
            {formattedTime}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    gap: 12,
  },

  // Merchant icon
  profile: {
    height: 44,
    width: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  profileLight: {
    backgroundColor: "rgba(22, 163, 74, 0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(22, 163, 74, 0.25)",
  },
  profileDark: {
    backgroundColor: "rgba(44, 139, 87, 0.25)",
    borderWidth: 1.5,
    borderColor: "rgba(44, 139, 87, 0.40)",
  },
  initial: {
    color: "#16a34a",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 0.5,
  },

  // Center block
  centerBlock: {
    flex: 1,
    gap: 3,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 11.5,
    fontWeight: "400",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.5,
  },

  // AI badge
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  aiBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // Right block
  rightBlock: {
    alignItems: "flex-end",
    gap: 1,
    flexShrink: 0,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  currency: {
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.5,
    marginTop: -2,
  },
  time: {
    fontSize: 11,
    fontWeight: "400",
    marginTop: 2,
  },
});
