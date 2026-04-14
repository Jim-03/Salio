import { Stack } from "expo-router";
import type { JSX } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Layout describing the introduction route
 *
 * @returns {JSX.Element} A component that defines how the introduction route is structured
 */
export default function IntroductionLayout(): JSX.Element {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
