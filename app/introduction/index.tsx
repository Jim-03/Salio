import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView, Text, useColorScheme, View } from "react-native";
import Lucide from "@react-native-vector-icons/lucide";
import Animated, { BounceInDown, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";

/**
 * Component rendering the introduction to app and its features
 */
export default function Introduction() {
  const isDark = useColorScheme() === "dark"; // System theme
  const router = useRouter();

  const features = [
    // App features
    {
      name: "Automated",
      icon: "wand-sparkles",
      description:
        "Automatically skims through financial services like M-Pesa to capture financial details.",
    },
    {
      name: "Artificially Intelligent",
      icon: "brain-circuit",
      description: "A system that learns from your financial habit.",
    },
    {
      name: "Local Storage",
      icon: "globe-off",
      description:
        "Stores details both locally and online allowing offline access.",
    },
    {
      name: "Secure",
      icon: "lock",
      description:
        "Protected by default to ensure only you can access your financial details.",
    },
  ];

  return (
    <SafeAreaView className={"flex-1 dark:bg-slate-900 bg-amber-50 p-5"}>
      <ScrollView className={"flex-1"}>
        {/* Header */}
        <View className={"items-center mt-8 mb-4"}>
          <Text className={"font-bold text-4xl text-green-800 dark:text-white"}>
            Welcome
          </Text>
        </View>

        {/* Description */}
        <Text className={"text-center dark:text-white/60"}>
          Salio is an AI-powered financial management app that helps in
          analysing your financial performance based on your usage trends.
        </Text>

        {/* Features */}
        <View className={"items-center mt-10 gap-5"}>
          {features.map((f, k) => (
            <Animated.View
              entering={FadeInDown.delay(200 + k * 120)
                .duration(400)
                .springify()}
              key={k}
              className={
                "flex-row w-[95%] gap-2 items-center bg-amber-800/10 dark:bg-blue-300/20 p-5 rounded-xl"
              }
            >
              <View>
                <Lucide
                  name={f.icon}
                  size={27}
                  color={isDark ? "rgb(147, 197, 253)" : "rgb(22, 101, 52)"}
                />
              </View>
              <View className={"justify-center"}>
                <Text
                  className={
                    "font-semibold text-xl text-green-800  dark:text-amber-100"
                  }
                >
                  {f.name}
                </Text>
                <Text className={"w-72 dark:text-white"}>{f.description}</Text>
              </View>
            </Animated.View>
          ))}

          {/* Get started button */}
          <Animated.View
            className={"h-16 w-4/5 mt-5"}
            entering={BounceInDown.delay(400).duration(500)}
          >
            <Pressable
              className={
                "flex-1 bg-green-800 items-center justify-center flex-row rounded-xl gap-2.5"
              }
              onPress={() => router.push("/introduction/permission")}
            >
              <Text className={"font-semibold text-white text-xl"}>
                Get Started
              </Text>
              <Lucide name={"log-in"} size={24} color={"white"} />
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
