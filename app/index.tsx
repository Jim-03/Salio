import { Redirect } from "expo-router";
import AsyncStorage from "expo-sqlite/kv-store";
import { useEffect, useState, type JSX } from "react";

/**
 * Main app controller
 *
 * It checks if the app has ever been opened
 * If it's the first time, it redirects to the '/introduction' route to introduce the app to the user
 * Otherwise, it redirects to the '/home' route where the main activity is
 * @returns {JSX.Element} A redirect component
 */
export default function (): JSX.Element {
  const [isFirstTime, setIsFirstTime] = useState(true); // State to confirm if the app has ever been opened
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Confirm if the app has ever been opened before
     */
    const checkIfFirstTime = async () => {
      setIsLoading(true);
      try {
        const data = await AsyncStorage.getItem("firstTime");

        if (data !== null) {
          setIsFirstTime(JSON.parse(data));
        }
      } catch (error) {
        // Default to first time if an error has occurred
        console.error(
          "An error has occurred while checking if the app has been opened before. Defaulting to first time",
        );
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    checkIfFirstTime();
  }, []);

  if (isLoading) {
    return <></>;
  }

  if (isFirstTime) {
    return <Redirect href={"/introduction"} />;
  }

  return <Redirect href={"/main"} />;
}
