import SystemDataProvider from "@/providers/data-provider.component";
import { Stack } from "expo-router";
import "../global.css";

/**
 * Root structure of the entire app and its screens
 */
export default function RootLayout() {
  return (
    <SystemDataProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SystemDataProvider>
  );
}
