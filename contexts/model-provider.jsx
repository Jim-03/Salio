import { useDB } from "@/contexts/database-provider";
import { getTrainingData } from "@/utils/database";
import { SplashScreen } from "expo-router";
import AsyncStorage from "expo-sqlite/kv-store";
import { GaussianNB } from "ml-naivebayes";
import React, { createContext, useContext, useEffect, useState } from "react";

const ModelContext = createContext();

SplashScreen.preventAutoHideAsync();

/**
 * Provider that creates a machine learning model used in categorizing transactions
 *
 * Uses Gaussian Naive Bayes algorithm
 * @param {{children: React.ReactNode}} children Child elements requiring the model
 * @returns {React.JSX.Element} A component that provide ML methods
 */
export default function ModelProvider({ children }) {
  const [model, setModel] = useState(new GaussianNB());
  const [categories, setCategories] = useState([]);
  const db = useDB();

  useEffect(() => {
    /**
     * Fetch model data from storage
     * @returns {Promise<void>} A promise that resolves when the model data is fetched
     */
    const loadModel = async () => {
      try {
        const modelData = await AsyncStorage.getItem("model");
        const categoriesData = await AsyncStorage.getItem("model_categories");

        if (modelData) {
          setModel(GaussianNB.load(JSON.parse(modelData)));
        }
        if (categoriesData) {
          setCategories(JSON.parse(categoriesData));
        }

        console.log("Model initialized");
      } catch (e) {
        console.error(
          "An error has occurred while fetching the model data: ",
          e,
        );
      } finally {
        await SplashScreen.hideAsync();
      }
    };
    loadModel();
  }, []);

  /**
   * Renews the ML model memory
   * @return {number} Length of training data
   */
  const train = async () => {
    const {
      Xtrain,
      Ytrain,
      categories: newCategories,
    } = await getTrainingData(db);

    console.log("Training model");
    model.train(Xtrain, Ytrain);

    await AsyncStorage.multiSet([
      ["model", JSON.stringify(model.toJSON())],
      ["model_categories", JSON.stringify(newCategories)],
    ]);

    setCategories(newCategories);

    console.log(`Model trained on ${Xtrain.length} records`);
    return Xtrain.length;
  };

  /**
   * Determine the category a transaction belongs to
   * @param {TransactionDetails} transaction The transaction data
   * @returns {string} The category the transaction belongs to
   */
  const predict = (transaction) => {
    const classId = model.predict([transaction])[0];
    return categories[classId] || "Unknown";
  };

  return (
    <ModelContext.Provider value={{ train, predict }}>
      {children}
    </ModelContext.Provider>
  );
}

/**
 * Hook to use the app's ML model
 * @returns {{
 *   train:  () => Promise<number>,
 *   predict: (TransactionRecord) => string
 * }} An object containing the method to train the model and predict a transaction's category
 * @throws {Error} In case the hook is called outside the model provider
 */
export const useModel = () => {
  const data = useContext(ModelContext);

  if (!data) {
    throw new Error("useModel can only be used in ModelProvider");
  }

  return data;
};
