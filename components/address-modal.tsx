import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { memo, useCallback, useEffect, useState } from "react";
import { useSms } from "@/providers/sms-provider.component";
import Lucide from "@react-native-vector-icons/lucide";
import { client } from "@/lib/client";

export default function AddressModal() {
  const [data, setData] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(
    new Set(),
  );
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Save the list of addresses to track
   */
  const upload = async () => {
    if (isUploading) return;

    setIsUploading(true);
    try {
      await client.post("/address", {
        addresses: Array.from(selectedAddresses),
      });
    } catch (e) {
      console.error(
        "An error has occurred while saving the tracked addresses: ",
        e,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const { getUniqueSenders } = useSms();

  useEffect(() => {
    /**
     * Retrieve a list of inbox addresses from the phone's SMS database
     */
    const loadData = async () => {
      if (isLoading) return;
      setIsLoading(true);
      const result = await getUniqueSenders();
      setData(result);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const onClick = useCallback((item: string) => {
    setSelectedAddresses((prev) => {
      const clone = new Set(prev);

      if (clone.has(item)) clone.delete(item);
      else clone.add(item);

      return clone;
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <RenderItem
        item={item}
        isSelected={selectedAddresses.has(item)}
        onClick={onClick}
      />
    ),
    [selectedAddresses, onClick],
  );

  const keyExtractor = useCallback((item: string) => item, []);

  // h-16 (64px) + mb-1 (4px) = 68px total height
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 68,
      offset: 68 * index,
      index,
    }),
    [],
  );

  return (
    <Modal transparent={true} animationType={"slide"}>
      {/* Background */}
      <SafeAreaView
        className={"flex-1 items-center justify-center bg-black/60 p-5"}
      >
        {/* Main content */}
        <View
          className={"bg-white w-full rounded-xl p-5 h-[80vh] elevation-md"}
        >
          {isLoading ? (
            <ActivityIndicator
              size={50}
              color={"seagreen"}
              className={"m-auto"}
            />
          ) : (
            <>
              {/* Heading */}
              <Text
                className={"text-center font-bold text-2xl mb-5 text-green-800"}
              >
                Track Inbox
              </Text>

              {/* Info */}
              <Text className={"mb-2 border-b border-b-black/30 pb-2"}>
                Select Inboxes to track financial messages
              </Text>

              {/* Addresses display */}
              <FlatList
                data={data}
                renderItem={renderItem}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={5}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
                extraData={selectedAddresses}
              />

              {/* Upload button */}
              {selectedAddresses.size > 0 && (
                <Pressable
                  className={
                    "w-3/4 bg-green-800 self-center p-3 mt-3 items-center rounded"
                  }
                  onPress={upload}
                >
                  {isUploading ? (
                    <ActivityIndicator size={24} color={"white"} />
                  ) : (
                    <Lucide name={"upload"} size={24} color="white" />
                  )}
                </Pressable>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// Memoized item to display address names
const RenderItem = memo(
  ({
    item,
    isSelected,
    onClick,
  }: {
    item: string;
    isSelected: boolean;
    onClick: (item: string) => void;
  }) => {
    return (
      <Pressable
        className={
          "h-16 border-b border-b-black/10 mb-1 items-center flex-row justify-between"
        }
        onPress={() => onClick(item)}
      >
        <Text>{item.toUpperCase()}</Text>
        {isSelected && <Lucide name={"check"} color={"seagreen"} size={24} />}
      </Pressable>
    );
  },
  (prev, next) => prev.isSelected === next.isSelected,
);
