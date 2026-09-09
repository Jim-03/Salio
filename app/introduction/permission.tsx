import { PermissionsAndroid, Platform, Pressable, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Lucide from "@react-native-vector-icons/lucide";
import Animated, { BounceInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { AsyncStorage } from "expo-sqlite/kv-store";

/**
 * Component rendering the grnat sms permission screen
 */
export default function Permission() {
  const router = useRouter();

  /**
   * Ask for READ_SMS permission from the user
   */
  const askPermission = async () => {
    if (Platform.OS !== "android") return; // Skip all other platforms

    const grant = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_SMS,
    );

    /**
     * Redirect the user if permission is granted
     */
    if (grant === PermissionsAndroid.RESULTS.GRANTED) {
      await AsyncStorage.setItemAsync("isFirstTime", JSON.stringify(false)); // Completed introduction
      router.replace("/(dashboard)");
    }

    return;
  };

  return (
    <SafeAreaView
      className={"flex-1 bg-amber-50 dark:bg-slate-900 items-center"}
    >
      <Animated.View entering={BounceInUp.delay(200)}>
        <Lucide
          name={"message-square-more"}
          size={50}
          style={{ marginVertical: 50, color: "seagreen" }}
        />
      </Animated.View>
      {/* Heading */}
      <Text className={"font-bold text-3xl text-green-800 dark:text-amber-100"}>
        Grant Permission
      </Text>

      <Text className={"text-xl w-4/5 text-center mt-2.5 dark:text-white"}>
        Salio requires permission to access SMS messages
      </Text>

      {/* Permission button */}
      <Pressable
        className={
          "bg-green-800 pt-5 pb-5 w-1/2 mt-5 items-center flex-row justify-center gap-2.5 rounded-xl"
        }
        onPress={askPermission}
      >
        <Lucide name={"handshake"} size={24} color={"white"} />
        <Text className={"text-white text-xl"}>Grant</Text>
      </Pressable>
    </SafeAreaView>
  );
}
