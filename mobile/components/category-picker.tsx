import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { Category } from "@/lib/dto";
import Lucide from "@react-native-vector-icons/lucide";
import { client } from "@/lib/client";
import { useData } from "@/providers/data-provider.component";

interface CategoryPickerProps {
  close: () => void;
  category: number;
  changeCategory: (value: ((prevState: number) => number) | number) => void;
}

/**
 * Component rendering the category picker
 * @param props
 * @param props.close State function to close the modal
 * @param props.category The id of the selected category
 * @param props.changeCategory State function to change the selected category
 */
export default function CategoryPicker({
  close,
  category,
  changeCategory,
}: CategoryPickerProps) {
  const { data } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>(
    Array.from(data.categories.values()),
  );
  const [showAddCategoryButton, setShowAddCategoryButton] = useState(true);

  useEffect(() => {
    setCategories(Array.from(data.categories.values()));
  }, [data.categories]);

  return (
    <Modal onRequestClose={close} animationType={"slide"} transparent>
      {/* Background */}
      <View className={"flex-1 bg-black/60 items-center justify-center"}>
        {/* Main display */}
        <View
          className={
            "bg-[rgb(245_245_245)] dark:bg-gray-600 w-[80%] min-h-[50%] rounded-xl p-5"
          }
        >
          {isLoading ? (
            <ActivityIndicator
              size={50}
              color={"seagreen"}
              style={{ margin: "auto" }}
            />
          ) : (
            <>
              {showAddCategoryButton ? (
                <AddCategoryButton
                  setShowAddCategoryButton={setShowAddCategoryButton}
                />
              ) : (
                <AddCategoryInput
                  setCategory={changeCategory}
                  setIsLoading={setIsLoading}
                  close={close}
                />
              )}

              {categories.length != 0 ? (
                <Categories
                  categories={categories}
                  selected={category}
                  setCategory={changeCategory}
                />
              ) : (
                <View className={"flex-1 items-center justify-center"}>
                  <Text className={"text-black/50 dark:text-white/50"}>
                    No categories at the moment
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
 * Component rendering the button to add new categories
 * @param props
 * @param props.setShowAddCategoryButton State function to unmount the component
 */
const AddCategoryButton = ({
  setShowAddCategoryButton,
}: {
  setShowAddCategoryButton: (
    value: ((prevState: boolean) => boolean) | boolean,
  ) => void;
}) => {
  return (
    <Pressable
      className={"flex-row gap-2.5 bg-amber-100 elevation-md p-2.5 rounded"}
      onPress={() => {
        setShowAddCategoryButton(false);
        Keyboard.isVisible();
      }}
    >
      <Lucide name={"plus"} size={24} />
      <Text>Add New Category</Text>
    </Pressable>
  );
};

/**
 * Component rendering the add category input
 * @param props
 * @param props.setCategory State function to change the selected category
 * @param props.setIsLoading State function to change loading state
 * @param props.close State function to unmount the category picker
 */
const AddCategoryInput = ({
  setCategory,
  setIsLoading,
  close,
}: {
  setCategory: (value: ((prevState: number) => number) | number) => void;
  setIsLoading: (value: ((prevState: boolean) => boolean) | boolean) => void;
  close: () => void;
}) => {
  const { setData } = useData();
  const [categoryName, setCategoryName] = useState("");
  const upload = async () => {
    if (!categoryName) return;
    setIsLoading(true);

    try {
      const response = await client.post("/categories", { name: categoryName });
      const data = response.data as Category;

      setCategory(data.id);
      setData((prev) => {
        const nextCategories = new Map(prev.categories);
        nextCategories.set(data.id, data);

        return {
          ...prev,
          categories: nextCategories,
        };
      });
      close();
    } catch (e) {
      console.error("An error has occurred while adding a new category: ", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      className={
        "flex-row border border-black/30 rounded-xl items-center gap-2.5 p-2.5 justify-between"
      }
    >
      <TextInput
        placeholder={"Enter category name"}
        autoFocus={true}
        onChangeText={setCategoryName}
      />
      <Pressable className={"bg-green-900 p-2.5 rounded"} onPress={upload}>
        <Lucide name={"plus"} size={24} color={"white"} />
      </Pressable>
    </View>
  );
};

/**
 * Component rendering the list of categories
 * @param props
 * @param props.categories List of categories to be rendered
 * @param props.selected The id of the selected category
 * @param props.setCategory State function to change the selected category id
 */
const Categories = ({
  categories,
  selected,
  setCategory,
}: {
  categories: Category[];
  selected: number;
  setCategory: (value: ((prevState: number) => number) | number) => void;
}) => {
  const isDark = useColorScheme() === "dark";
  return (
    <FlatList
      className={"mt-5"}
      data={categories}
      renderItem={({ item }) => {
        return (
          <Pressable
            onPress={() => setCategory(item.id)}
            className={
              "mt-2.5 mb-2.5 border-b border-b-black/30 dark:border-b-white/30 pb-2.5 flex-row justify-between"
            }
          >
            <Text className={"font-semibold text-green-950 dark:text-white"}>
              {item.name}
            </Text>
            {selected === item.id && (
              <Lucide
                name={"dot"}
                size={30}
                color={isDark ? "rgb(74, 222, 128)" : "rgb(5, 46 ,22)"}
              />
            )}
          </Pressable>
        );
      }}
    />
  );
};
