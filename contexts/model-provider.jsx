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
  const db = useDB();

  useEffect(() => {
    /**
     * Fetch model data from storage
     * @returns {Promise<void>} A promise that resolves when the model data is fetched
     */
    const loadModel = async () => {
      try {
        const data = await AsyncStorage.getItem("model");

        if (data) {
          setModel(GaussianNB.load(JSON.parse(data)));
          console.log("Model initialized");
        }
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
   */
  const train = async () => {
    const { Xtrain, Ytrain } = await getTrainingData(db);

    // Train the model from the data
    model.train(Xtrain, Ytrain);

    // Store the new model weights
    await AsyncStorage.setItem("model", JSON.stringify(model.toJSON()));
    console.log(`Model trained on ${Xtrain.length} records`);
  };

  /**
   * Determine the category a transaction belongs to
   * @param {TransactionDetails} transaction The transaction data
   * @returns {string} The category the transaction belongs to
   */
  const predict = (transaction) => {
    return model.predict([transaction])[0];
  };

  return (
    <ModelContext.Provider value={{ train, predict }}>
      {children}
    </ModelContext.Provider>
  );
}

/**
 * Hook to use the models methods
 * @returns {{train: () => void, predict: () => string}} Model's methods
 */
export const useModel = () => {
  const data = useContext(ModelContext);

  if (!data) {
    throw new Error("useModel can only be used in ModelProvider");
  }

  return data;
};
