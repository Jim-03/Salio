import { Modal, Pressable, Text, useColorScheme, View } from "react-native";
import Lucide from "@react-native-vector-icons/lucide";
import { SafeAreaView } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import { useEffect } from "react";

interface AuthenticationModalProps {
  close: () => void;
}

/**
 * Modal displayed to lock the screen
 * @param close State function to unmount the component
 */
export default function AuthenticationModal({
  close,
}: AuthenticationModalProps) {
  const isDark = useColorScheme() === "dark";
  const iconColor = isDark ? "rgb(147, 197, 253)" : "rgb(22, 101, 52)";

  useEffect(() => {
    authenticate();
  }, []);

  /**
   * Request authentication from user
   */
  const authenticate = async () => {
    const permission = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock Salio",
    });

    if (permission.success) {
      close();
    }
  };
  return (
    <Modal animationType={"slide"}>
      <SafeAreaView className={"bg-amber-50 dark:bg-slate-900 flex-1"}>
        <View className={"flex-1 items-center"}>
          <Lucide
            name={"lock"}
            size={50}
            style={{ marginVertical: 20 }}
            color={iconColor}
          />

          {/* Header */}
          <Text
            className={
              "font-bold  text-3xl text-green-800 dark:text-blue-300 mb-5"
            }
          >
            Salio is locked
          </Text>

          {/* Note */}
          <Text className={"w-4/5 text-center text-xl dark:text-amber-100"}>
            To protect sensitive financial information, Salio is always locked
          </Text>

          {/* Unlock button */}
          <Pressable className={"mt-auto mb-5 items-center justify-center"}>
            <Lucide
              name={"fingerprint"}
              size={45}
              color={iconColor}
              onPress={authenticate}
            />
            <Text
              className={
                "text-green-800/50 dark:text-white/60 font-semibold text-sm mt-2"
              }
            >
              Tap to unlock
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
