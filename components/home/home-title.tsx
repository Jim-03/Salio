import { primaryColor } from "@/constants/colors";
import { useLightTheme } from "@/contexts/theme-provider";
import type React from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * Title at the home screen
 * @returns {React.JSX.Element} Title component
 */
export default function HomeTitle() {
  const isLight = useLightTheme();
  /**
   * Get greeting depending on time
   * @returns {string} Greeting depending on time
   */
  const greeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 16) {
      return "Good Afternoon";
    }
    return "Good Evening";
  };

  const titleColor = isLight ? primaryColor : "white";

  return (
    <View style={[styles.background]}>
      <Text style={[styles.title, { color: titleColor }]}>{greeting()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: 500,
  },
});
