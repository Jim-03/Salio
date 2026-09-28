import { Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import Lucide from "@react-native-vector-icons/lucide";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactNode } from "react";
import { useRouter } from "expo-router";

interface HeaderProps {
  title?: string;
  headerRight?: ReactNode;
}

/**
 * Component rendering the header component
 * @param props Header props
 * @param props.title
 * @param props.headerRight Component to render on the right side of the header
 */
export default function Header({ title, headerRight }: HeaderProps) {
  const timeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 16) return "Good Afternoon";
    return "Good Evening";
  };

  const insets = useSafeAreaInsets();

  return (
    <View className={`bg-green-900`} style={{ paddingTop: insets.top }}>
      <View
        className={"h-16 items-center justify-between flex-row"}
        style={{ paddingHorizontal: 15 }}
      >
        <Text className={"font-bold text-xl text-white"}>
          {title ? `${title}` : timeBasedGreeting()}
        </Text>
        {headerRight}
      </View>
    </View>
  );
}

/**
 * Component rendering the notification icon on the header component
 */
export const NotificationIcon = () => {
  const unreadPresent = true; // TODO: Implement notifications
  const router = useRouter();

  return (
    <TouchableOpacity
      className={"h-10 w-10"}
      onPress={() => router.push("/notifications")}
    >
      <Animated.View className={"flex-1 items-center justify-center"}>
        {unreadPresent && (
          <Lucide
            name={"dot"}
            size={44}
            color={"tomato"}
            style={{ position: "absolute", top: -18, right: -8 }}
          />
        )}
        <Lucide name={"bell"} size={24} color={"white"} />
      </Animated.View>
    </TouchableOpacity>
  );
};
