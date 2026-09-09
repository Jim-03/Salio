import { Redirect, SplashScreen } from "expo-router";
import { useEffect, useState } from "react";
import { AsyncStorage } from "expo-sqlite/kv-store";

// Show splash screen
SplashScreen.preventAutoHideAsync();

/**
 * App's root component that redirects to the appropriate screen
 */
export default function Root() {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    /**
     * Confirm if app has ever been opened
     */
    const checkFirstTime = async () => {
      // Prevent double loading
      if (isLoading) return;
      setIsLoading(true);

      try {
        // Fetch data from async storage
        const data = await AsyncStorage.getItem("isFirstTime");

        // Update if data is found
        if (data) setIsFirstTime(JSON.parse(data));
      } catch (e) {
        console.error("Failed to check if first time: ", e);
      } finally {
        // Close splash screen
        await SplashScreen.hideAsync();
        setIsLoading(false);
      }
    };
    checkFirstTime();
  }, []);

  // Unmount everything if app is still loading
  if (isLoading) return <></>;

  // Redirect if it's the first time opening the app
  if (isFirstTime) {
    return <Redirect href={"/introduction"} />;
  }

  // Redirect home
  return <Redirect href={"/(dashboard)"} />;
}
