import {
  darkModeBackground,
  lightModeBackground,
  primaryColor,
} from "@/constants/colors";
import { useLightTheme } from "@/contexts/theme-provider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import AsyncStorage from "expo-sqlite/kv-store";
import type { JSX } from "react";
import { StyleSheet, Text, View } from "react-native";

/**
 * A security component that introduces the user to the app's security feature
 * It prompts the user through their device's authentication feature
 *
 * On a successful authentication, it redirects the user to the main screen
 * It also marks the app has already been opened to prevent reintroducing it to the user on the next start
 * @returns {JSX.Element} A security introduction screen
 */
export default function Security() {
  const isLight = useLightTheme();

  const styles = StyleSheet.create({
    background: {
      backgroundColor: isLight ? lightModeBackground : darkModeBackground,
      flex: 1,
      alignItems: "center",
    },
    securityLogo: {
      fontSize: 50,
      marginTop: 100,
      marginBottom: 20,
      color: primaryColor,
    },
    title: {
      fontSize: 25,
      fontWeight: "bold",
      color: primaryColor,
      marginBottom: 10,
    },
    notice: {
      flexShrink: 1,
      textAlign: "center",
      fontSize: 15,
      color: isLight ? "black" : "white",
    },
    fingerprintIcon: {
      marginTop: "auto",
      fontSize: 48,
      color: primaryColor,
    },
    unlockLabel: {
      color: isLight ? "black" : "white",
      opacity: 0.7,
      fontSize: 15,
      marginVertical: 10,
    },
  });

  const handleIconPress = async () => {
    try {
      // Get the authentication from the system
      const authentication = await LocalAuthentication.authenticateAsync();
      if (authentication.success) {
        // Mark the app as already opened
        await AsyncStorage.setItem("firstTime", JSON.stringify(true));
        // Switch to main route
        router.replace("/main");
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <View style={styles.background}>
      {/*Security logo*/}
      <MaterialIcons name={"security"} style={styles.securityLogo} />

      {/* Title*/}
      <Text style={styles.title}>Security in Salio</Text>

      {/* Notice*/}
      <Text style={styles.notice}>
        To keep your financial data away from unwanted hands, Salio is always
        locked after 1 minute of inactivity
      </Text>

      {/* Fingerprint icon*/}
      <MaterialIcons
        name={"fingerprint"}
        onPress={handleIconPress}
        style={styles.fingerprintIcon}
      />

      {/*Unlock label*/}
      <Text style={styles.unlockLabel}>Tap to unlock</Text>
    </View>
  );
}
