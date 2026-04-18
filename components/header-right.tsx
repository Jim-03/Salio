import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import type React from "react";
import { StyleSheet, TouchableWithoutFeedback, View } from "react-native";

/**
 * Profile icon on the right side of the header
 *
 * It redirects the user to '/settings' route
 * @returns {React.JSX.Element} Profile Icon component
 */
export default function HeaderRight(): React.JSX.Element {
  return (
    <TouchableWithoutFeedback onPress={() => router.push("/settings")}>
      <View style={styles.background}>
        <MaterialIcons name={"person"} style={styles.icon} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "seagreen",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  icon: {
    fontSize: 25,
    color: "white",
  },
});
