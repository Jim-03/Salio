import {
  BottomTabBarProps,
  BottomTabNavigationOptions,
} from "expo-router/build/react-navigation/bottom-tabs";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Lucide from "@react-native-vector-icons/lucide";
import { useEffect } from "react";

const icons = {
  home: "home",
  analysis: "chart-no-axes-column",
  history: "arrow-left-right",
  settings: "settings",
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Component rendering the bottom tab bar's buttons
 * @param props Button props
 * @param props.isFocused condition if the button is focused on
 * @param props.onPress function triggered after pressing the button
 * @param props.options navigation options
 * @param props.onLongPress function triggered on long pressing the button
 * @param props.iconName lucide icon to be displayed
 */
const TabButton = ({
  isFocused,
  onPress,
  options,
  onLongPress,
  iconName,
}: {
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  iconName: string;
  options: BottomTabNavigationOptions;
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    translateY.value = withSpring(isFocused ? -8 : 0, { damping: 14 });
    scale.value = withSpring(isFocused ? 1.15 : 1, { damping: 14 });
  }, [isFocused]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });

  return (
    <AnimatedPressable
      accessibilityRole={"button"}
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      className={`p-3 rounded-xl ${isFocused && "bg-white/30 elevation-lg"}`}
      style={animatedStyle}
    >
      <Lucide
        name={iconName}
        size={24}
        color={isFocused ? "#ffffff" : "#a7f3d0"}
      />
    </AnimatedPressable>
  );
};

/**
 * Component rendering the bottom navigation bar in the dashboard screens
 * @param param0 Bottom tab bar props
 */
export default function TabBar({
  state,
  descriptors,
  navigation,
  insets,
}: BottomTabBarProps) {
  return (
    <Animated.View
      className={
        "bg-green-800 w-[92%] absolute self-center h-20 rounded-xl elevation-lg flex-row justify-evenly items-center"
      }
      style={{ bottom: Math.max(insets.bottom, 10) }}
    >
      {state.routes.map((r, k) => {
        const isFocused = state.index === k;

        const { options } = descriptors[r.key];
        // @ts-ignore
        const iconName = icons[r.name] ?? "circle";

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: r.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(r.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: r.key });
        };
        return (
          <TabButton
            isFocused={isFocused}
            onLongPress={onLongPress}
            key={r.key}
            onPress={onPress}
            options={options}
            iconName={iconName}
          />
        );
      })}
    </Animated.View>
  );
}
