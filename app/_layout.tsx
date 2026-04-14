import DatabaseProvider from "@/contexts/database-provider";
import ThemeProvider from "@/contexts/theme-provider";
import { Redirect, Stack } from "expo-router";
import { AsyncStorage } from "expo-sqlite/kv-store";
import { useEffect, useState, type JSX } from "react";

/**
 * The applications main layout
 *
 * It checks if the app has ever been opened. If it's the first time,
 * the app redirects to the '/introduction' route to introduce the app to the user
 * It initializes a connection to the database for child components to use that connection
 * It also provides a theme for the child components
 * @returns {JSX.Element} An element that controls how the app is launched
 * @todo Lock the user out in case of 1 minute of inactivity
 */
export default function AppLayout(): JSX.Element {
  const [isFirstTime, setIsFirstTime] = useState(false); // State to confirm if the app has ever been opened

  useEffect(() => {
    /**
     * Confirm if the app has ever been opened before
     */
    const checkIfFirstTime = async () => {
      try {
        const data = await AsyncStorage.getItem("firstTime");

        if (data) {
          setIsFirstTime(JSON.parse(data));
        }
      } catch (error) {
        // Default to first time if an error has occurred
        console.error(
          "An error has occurred while checking if the app has been opened before. Defaulting to first time",
        );
        console.error(error);
      }
    };
    checkIfFirstTime();
  }, []);

  return (
    <ThemeProvider>
      <DatabaseProvider>
        {isFirstTime ? (
          <Redirect href={"/introduction"} />
        ) : (
          <Stack screenOptions={{ headerShown: false }} />
        )}
      </DatabaseProvider>
    </ThemeProvider>
  );
}
