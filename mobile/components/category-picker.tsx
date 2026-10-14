import Lucide from "@react-native-vector-icons/lucide";
import { useData } from "@/providers/data-provider.component";
import { useState } from "react";
import { client } from "@/lib/client";
import { Category } from "@/lib/dto";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

/**
 * Component rendering the category picker
 */
export default function CategoryPicker({
  close,
  category,
  changeCategory,
}: {
  close: () => void;
  category: number;
  changeCategory: (value: ((prevState: number) => number) | number) => void;
}) {
  const { data } = useData();
  const isDark = useColorScheme() === "dark";
  const [isLoading, setIsLoading] = useState(false);
  const categories = Array.from(data.categories.values());
  const [showAddCategoryButton, setShowAddCategoryButton] = useState(true);

  return (
    <Modal onRequestClose={close} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 items-center justify-end sm:justify-center p-0 sm:p-4">
        {/* Main display */}
        <View className="bg-amber-50 dark:bg-slate-900 w-full sm:w-[90%] h-[60%] sm:h-auto sm:max-h-[80%] rounded-t-[32px] sm:rounded-[32px] p-6 pb-10 shadow-2xl">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Select Category
            </Text>
            <Pressable
              onPress={close}
              className="p-2 bg-black/5 dark:bg-white/10 rounded-full"
            >
              <Lucide name="x" size={20} color={isDark ? "white" : "#022c22"} />
            </Pressable>
          </View>

          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator
                size="large"
                color={isDark ? "#4ade80" : "#14532d"}
              />
            </View>
          ) : (
            <>
              {/* Add Category Section */}
              <View className="mb-4">
                {showAddCategoryButton ? (
                  <AddCategoryButton
                    setShowAddCategoryButton={setShowAddCategoryButton}
                  />
                ) : (
                  <AddCategoryInput
                    setCategory={changeCategory}
                    setIsLoading={setIsLoading}
                    close={() => setShowAddCategoryButton(true)}
                  />
                )}
              </View>

              {/* Categories List */}
              {categories.length !== 0 ? (
                <Categories
                  categories={categories}
                  selected={category}
                  setCategory={(id) => {
                    changeCategory(id);
                    close(); // Auto-close picker on selection
                  }}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Lucide
                    name="inbox"
                    size={48}
                    color="gray"
                    style={{ opacity: 0.5 }}
                  />
                  <Text className="text-gray-500 dark:text-gray-400 mt-4 font-medium">
                    No categories found
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

/**
 * Button to add new categories
 */
const AddCategoryButton = ({
  setShowAddCategoryButton,
}: {
  setShowAddCategoryButton: (val: boolean) => void;
}) => {
  const isDark = useColorScheme() === "dark";
  return (
    <Pressable
      className="flex-row items-center justify-center gap-2 bg-green-900/10 dark:bg-green-400/10 border border-green-900/20 dark:border-green-400/20 p-4 rounded-2xl border-dashed"
      onPress={() => {
        setShowAddCategoryButton(false);
      }}
    >
      <Lucide name="plus" size={20} color={isDark ? "#4ade80" : "#14532d"} />
      <Text className="font-semibold text-green-900 dark:text-green-400">
        Create New Category
      </Text>
    </Pressable>
  );
};

/**
 * Input to add new categories
 */
const AddCategoryInput = ({
  setCategory,
  setIsLoading,
  close,
}: {
  setCategory: (val: number) => void;
  setIsLoading: (val: boolean) => void;
  close: () => void;
}) => {
  const { setData } = useData();
  const isDark = useColorScheme() === "dark";
  const [categoryName, setCategoryName] = useState("");

  const upload = async () => {
    if (!categoryName.trim()) return;
    setIsLoading(true);

    try {
      const response = await client.post("/categories", {
        name: categoryName.trim(),
      });
      const data = response.data as Category;

      setCategory(data.id);
      setData((prev) => {
        const nextCategories = new Map(prev.categories);
        nextCategories.set(data.id, data);
        return { ...prev, categories: nextCategories };
      });
      close();
    } catch (e) {
      console.error("An error has occurred while adding a new category: ", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1 flex-row items-center bg-white dark:bg-black/20 border border-green-900/30 dark:border-amber-50/30 rounded-2xl px-4 py-2">
        <TextInput
          placeholder="Enter category name"
          autoFocus={true}
          onChangeText={setCategoryName}
          className="flex-1 text-gray-900 dark:text-white h-10"
          placeholderTextColor={
            isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"
          }
          onSubmitEditing={upload}
        />
        <Pressable onPress={close} className="p-1 ml-2">
          <Lucide name="x" size={18} color="gray" />
        </Pressable>
      </View>
      <Pressable
        className="bg-green-900 h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
        onPress={upload}
      >
        <Lucide name="check" size={24} color="white" />
      </Pressable>
    </View>
  );
};

/**
 * List of categories
 */
const Categories = ({
  categories,
  selected,
  setCategory,
}: {
  categories: Category[];
  selected: number;
  setCategory: (val: number) => void;
}) => {
  const isDark = useColorScheme() === "dark";

  return (
    <FlatList
      className="flex-1"
      data={categories}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const isSelected = selected === item.id;
        return (
          <Pressable
            onPress={() => setCategory(item.id)}
            className={`flex-row justify-between items-center p-4 mb-2 rounded-2xl border ${
              isSelected
                ? "bg-green-900/10 border-green-900/50 dark:bg-green-400/10 dark:border-green-400/50"
                : "bg-white/50 dark:bg-black/20 border-transparent"
            }`}
          >
            <Text
              className={`font-semibold text-base ${
                isSelected
                  ? "text-green-900 dark:text-green-400"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {item.name}
            </Text>
            {isSelected && (
              <Lucide
                name="check-circle-2"
                size={22}
                color={isDark ? "#4ade80" : "#14532d"}
              />
            )}
          </Pressable>
        );
      }}
    />
  );
};
