import DatabaseProvider from "@/contexts/database-provider";
import ModelProvider from "@/contexts/model-provider";
import ThemeProvider from "@/contexts/theme-provider";
import { Stack } from "expo-router";
import { type JSX } from "react";

/**
 * The applications main layout
 *
 * Loads the app's database and theme providers for the entire app
 * @returns {JSX.Element} An element that controls how the app is launched
 * @todo Lock the user out in case of 1 minute of inactivity
 */
export default function AppLayout(): JSX.Element {
  return (
    <ThemeProvider>
      <DatabaseProvider>
        <ModelProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ModelProvider>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
