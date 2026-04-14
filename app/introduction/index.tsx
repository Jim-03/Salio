import {
  darkModeBackground,
  lightModeBackground,
  primaryColor,
} from "@/constants/colors";
import { useLightTheme } from "@/contexts/theme-provider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { type JSX } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * The Introduction component serves as the initial screen for users entering the app.
 * It provides a brief overview of the app's features and prompts the user to "Get Started",
 * which navigates them to the security setup route.
 *
 * This component dynamically adjusts its background and text colors based on the
 * system's theme (light or dark mode) using the `useLightTheme` hook.
 *
 * @returns {JSX.Element} The introduction screen of the app.
 */
export default function Introduction(): JSX.Element {
  const isLight = useLightTheme();

  const bgColor = isLight ? lightModeBackground : darkModeBackground;
  const textColor = isLight ? "black" : "white";

  const styles = StyleSheet.create({
    background: {
      flex: 1,
      backgroundColor: bgColor,
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    heading: {
      color: primaryColor,
      fontSize: 32,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 30,
    },
    featuresContainer: {
      gap: 24,
      marginBottom: 30,
    },
    feature: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    icons: {
      fontSize: 30,
      color: textColor,
    },
    featureText: {
      color: textColor,
      fontSize: 16,
      flexShrink: 1,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderColor: primaryColor,
      borderWidth: 2,
      borderRadius: 8,
      paddingVertical: 14,
      gap: 10,
      backgroundColor: primaryColor,
    },
    buttonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
    },
  });

  return (
    <View style={styles.background}>
      {/* Greeting title */}
      <Text style={styles.heading}>Welcome to Salio</Text>
      {/*Feature's container*/}
      <View style={styles.featuresContainer}>
        {/*Description feature*/}
        <View style={styles.feature}>
          <MaterialIcons name="wallet" style={styles.icons} />
          <Text style={styles.featureText}>
            Your personal financial analysis tool for M-Pesa transactions
          </Text>
        </View>
        {/* Graph feature*/}
        <View style={styles.feature}>
          <MaterialIcons name="bar-chart" style={styles.icons} />
          <Text style={styles.featureText}>
            Review transactions in visually appealing graphs
          </Text>
        </View>
        {/*Security feature*/}
        <View style={styles.feature}>
          <MaterialIcons name="lock" style={styles.icons} />
          <Text style={styles.featureText}>
            Your data never leaves this device
          </Text>
        </View>
      </View>
      {/*Get started button*/}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/introduction/security")}
      >
        <MaterialIcons
          name="login"
          style={{ ...styles.icons, color: "white" }}
        />
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
