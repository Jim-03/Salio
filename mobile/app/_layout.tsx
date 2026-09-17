import { Stack } from "expo-router";
import "../global.css";

/**
 * Root structure of the entire app and its screens
 */
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}