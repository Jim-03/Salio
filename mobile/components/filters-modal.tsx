import Lucide from "@react-native-vector-icons/lucide";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import Animated, { ZoomIn, ZoomOutEasyDown } from "react-native-reanimated";
import { Filters, TransactionDirection } from "@/lib/dto";

interface FiltersModalProps {
  close: () => void;
  currentFilters: Filters;
  setFilters: (value: ((prevState: Filters) => Filters) | Filters) => void;
  refetch: () => void;
}

type Timeframe =
  "ALL_TIME" | "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR" | "CUSTOM";

/**
 * Reusable component rendering the filters modal
 * @param props
 * @param props.close State function to unmount the component
 * @param props.currentFilters Filters that are already applied in the previous fetch
 * @param props.setFilters State function to apply new filters for the next fetch
 */
export default function FiltersModal({
  close,
  currentFilters,
  setFilters,
  refetch,
}: FiltersModalProps) {
  const isDark = useColorScheme() === "dark";

  // Local state to hold selections before applying
  const [localFilters, setLocalFilters] = useState<Filters>({
    ...currentFilters,
  });

  // Determine initial timeframe based on whether start/end exist
  const [timeframe, setTimeframe] = useState<Timeframe>(
    currentFilters.start ? "CUSTOM" : "ALL_TIME",
  );

  // Custom date strings for the fallback custom picker (YYYY-MM-DD)
  const [customStart, setCustomStart] = useState(
    currentFilters.start
      ? new Date(currentFilters.start).toISOString().split("T")[0]
      : "",
  );
  const [customEnd, setCustomEnd] = useState(
    currentFilters.end
      ? new Date(currentFilters.end).toISOString().split("T")[0]
      : "",
  );

  const applyTimeframe = (tf: Timeframe) => {
    setTimeframe(tf);
    const now = new Date();
    let start: number | undefined;
    let end: number | undefined = new Date(
      now.setHours(23, 59, 59, 999),
    ).getTime();

    switch (tf) {
      case "TODAY":
        start = new Date(now.setHours(0, 0, 0, 0)).getTime();
        break;
      case "THIS_WEEK": {
        const firstDay = now.getDate() - now.getDay();
        start = new Date(
          new Date(now.setDate(firstDay)).setHours(0, 0, 0, 0),
        ).getTime();
        break;
      }
      case "THIS_MONTH":
        start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        break;
      case "THIS_YEAR":
        start = new Date(now.getFullYear(), 0, 1).getTime();
        break;
      case "ALL_TIME":
        start = undefined;
        end = undefined;
        break;
      case "CUSTOM":
        // State handles this separately on apply
        return;
    }

    setLocalFilters((prev) => ({ ...prev, start, end }));
  };

  const parseCustomDate = (
    dateStr: string,
    isEnd: boolean,
  ): number | undefined => {
    if (!dateStr) return undefined;
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return undefined;

    const date = new Date(y, m - 1, d);
    if (isEnd) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date.getTime();
  };

  const handleApply = () => {
    let finalStart = localFilters.start;
    let finalEnd = localFilters.end;

    if (timeframe === "CUSTOM") {
      finalStart = parseCustomDate(customStart, false);
      finalEnd = parseCustomDate(customEnd, true);
    }

    refetch();
    setFilters((prev) => ({
      ...prev,
      direction: localFilters.direction,
      limit: localFilters.limit,
      start: finalStart,
      end: finalEnd,
      page: 0, // Always reset to the first page when applying new filters
      // search_term is ignored here; we spread prev and it remains intact
    }));
    close();
  };

  const handleReset = () => {
    setFilters((prev) => ({
      ...prev,
      direction: TransactionDirection.ALL,
      limit: 10,
      start: undefined,
      end: undefined,
      page: 0,
    }));
    close();
  };

  const Chip = ({
    label,
    isActive,
    onPress,
  }: {
    label: string;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full mr-2 mb-2 border ${
        isActive
          ? "bg-green-900 border-green-900"
          : "bg-transparent border-green-900/30 dark:border-amber-50/30"
      }`}
    >
      <Text
        className={`font-medium ${
          isActive ? "text-white" : "text-green-950 dark:text-amber-50"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal transparent animationType="fade" onRequestClose={close}>
      {/* Background */}
      <View className="bg-black/60 flex-1 justify-center items-center p-4">
        {/* Filters form */}
        <Animated.View
          entering={ZoomIn.duration(500)}
          exiting={ZoomOutEasyDown}
          className="bg-amber-50 dark:bg-slate-900 w-full rounded-[32px] p-6 shadow-2xl max-h-[85%]"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-green-950 dark:text-white">
              Filters
            </Text>
            <Pressable
              onPress={close}
              className="p-2 -mr-2 bg-black/5 dark:bg-white/10 rounded-full"
            >
              <Lucide name="x" size={24} color={isDark ? "white" : "#022c22"} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Direction */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-green-900/60 dark:text-amber-50/60 mb-3 uppercase tracking-wider">
                Transaction Type
              </Text>
              <View className="flex-row flex-wrap">
                {Object.values(TransactionDirection).map((dir) => (
                  <Chip
                    key={dir}
                    label={dir.charAt(0) + dir.slice(1).toLowerCase()}
                    isActive={localFilters.direction === dir}
                    onPress={() =>
                      setLocalFilters({ ...localFilters, direction: dir })
                    }
                  />
                ))}
              </View>
            </View>

            {/* Date Range / Timeframe */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-green-900/60 dark:text-amber-50/60 mb-3 uppercase tracking-wider">
                Date Range
              </Text>
              <View className="flex-row flex-wrap">
                <Chip
                  label="All Time"
                  isActive={timeframe === "ALL_TIME"}
                  onPress={() => applyTimeframe("ALL_TIME")}
                />
                <Chip
                  label="Today"
                  isActive={timeframe === "TODAY"}
                  onPress={() => applyTimeframe("TODAY")}
                />
                <Chip
                  label="This Week"
                  isActive={timeframe === "THIS_WEEK"}
                  onPress={() => applyTimeframe("THIS_WEEK")}
                />
                <Chip
                  label="This Month"
                  isActive={timeframe === "THIS_MONTH"}
                  onPress={() => applyTimeframe("THIS_MONTH")}
                />
                <Chip
                  label="This Year"
                  isActive={timeframe === "THIS_YEAR"}
                  onPress={() => applyTimeframe("THIS_YEAR")}
                />
                <Chip
                  label="Custom..."
                  isActive={timeframe === "CUSTOM"}
                  onPress={() => applyTimeframe("CUSTOM")}
                />
              </View>

              {/* Custom Date Inputs */}
              {timeframe === "CUSTOM" && (
                <View className="flex-row gap-4 mt-4">
                  <View className="flex-1">
                    <Text className="text-xs text-green-900/60 dark:text-amber-50/60 mb-1 ml-1">
                      Start Date
                    </Text>
                    <TextInput
                      className="bg-white/50 dark:bg-black/20 border border-green-900/30 dark:border-amber-50/30 rounded-xl p-3 text-black dark:text-white"
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={
                        isDark ? "rgba(255,255,255,0.4)" : "rgba(0,100,0,0.4)"
                      }
                      value={customStart}
                      onChangeText={setCustomStart}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-green-900/60 dark:text-amber-50/60 mb-1 ml-1">
                      End Date
                    </Text>
                    <TextInput
                      className="bg-white/50 dark:bg-black/20 border border-green-900/30 dark:border-amber-50/30 rounded-xl p-3 text-black dark:text-white"
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={
                        isDark ? "rgba(255,255,255,0.4)" : "rgba(0,100,0,0.4)"
                      }
                      value={customEnd}
                      onChangeText={setCustomEnd}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Limit */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-green-900/60 dark:text-amber-50/60 mb-3 uppercase tracking-wider">
                Items per page
              </Text>
              <View className="flex-row flex-wrap">
                {[10, 20, 50].map((limit) => (
                  <Chip
                    key={limit}
                    label={`${limit} items`}
                    isActive={localFilters.limit === limit}
                    onPress={() => setLocalFilters({ ...localFilters, limit })}
                  />
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="flex-row gap-4 mt-4 pt-4 border-t border-green-900/10 dark:border-amber-50/10">
            <Pressable
              onPress={handleReset}
              className="flex-1 py-4 items-center justify-center rounded-2xl bg-black/5 dark:bg-white/10"
            >
              <Text className="font-bold text-green-950 dark:text-white">
                Reset
              </Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              className="flex-[2] py-4 items-center justify-center rounded-2xl bg-green-900"
            >
              <Text className="font-bold text-white text-base">
                Apply Filters
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
