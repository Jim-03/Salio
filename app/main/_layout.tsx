import {
  darkModeContainerColor,
  lightModeContainerColor,
} from "@/constants/colors";
import SmsProvider from "@/contexts/sms-provider";
import { useLightTheme } from "@/contexts/theme-provider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

/**
 * Controller to how the app's main UI is interacted with
 * @returns {React.JSX.Element} A component that controls the main UI
 */
export default function MainLayout(): React.JSX.Element {
  const isLight = useLightTheme();

  const styles = StyleSheet.create({
    tabBar: {
      backgroundColor: isLight
        ? lightModeContainerColor
        : darkModeContainerColor,
      position: "absolute",
      bottom: 15,
      marginHorizontal: 10,
      height: 60,
      borderRadius: 10,
    },
    tabBarIcon: {
      fontSize: 24,
    },
  });
  return (
    <SmsProvider>
      <Tabs
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: isLight ? "seagreen" : "white",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons
                name="home"
                color={color}
                style={styles.tabBarIcon}
              />
            ),
            tabBarLabel: "Home",
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons
                name="bar-chart"
                color={color}
                style={styles.tabBarIcon}
              />
            ),
            tabBarLabel: "Analytics",
          }}
        />
        <Tabs.Screen
          name="review"
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons
                name="history"
                color={color}
                style={styles.tabBarIcon}
              />
            ),
            tabBarLabel: "Review",
          }}
        />
        <Tabs.Screen
          name="profiles"
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons
                name="person"
                color={color}
                style={styles.tabBarIcon}
              />
            ),
            tabBarLabel: "Profiles",
          }}
        />
      </Tabs>
    </SmsProvider>
  );
}
