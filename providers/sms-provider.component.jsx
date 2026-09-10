import { createContext, useContext, useState } from "react";
import { ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SmsAndroid from "react-native-get-sms-android";

const SmsContext = createContext(null);

/**
 * Re-usable component that provides SMS related props
 * @param {ReactNode} children Child components relying on SMS props
 * @returns {React.JSX.Element}
 */
export default function SmsProvider({ children }) {
  const [isImporting, setIsImporting] = useState(false);
  const BATCH = 100;

  /**
   * Retrieve a list of all SMS senders
   * @returns {Promise<String[]>} A promise that resolves to a list of all senders in inbox
   */
  const getUniqueSenders = () => {
    const uniqueSenders = new Set(); // Store unique values
    let index = 0;

    /**
     * Fetch the next group of senders in a batch size
     * @returns {Promise<String[]>} A promise that resolves to a unique list of senders
     */
    const findNextBatch = async () => {
      // Filter to fetch all inbox messages
      const filter = {
        box: "inbox",
        indexFrom: index, // Beginning of Batch
        maxCount: BATCH, // Batch group
      };

      return new Promise((resolve, reject) => {
        SmsAndroid.list(
          JSON.stringify(filter),
          (fail) => reject(fail),
          (_count, smsList) => {
            // Extract all messages
            const messages = JSON.parse(smsList);

            // Add to unique set
            messages.forEach((msg) => uniqueSenders.add(msg.address));
            const length = messages.length;

            // Recursively call to fetch the next batch until
            // the length is less than batch size
            if (length === BATCH) {
              index += BATCH;
              resolve(findNextBatch());
            }

            // Return the current list since all messages have been fetched
            else {
              resolve([...uniqueSenders]);
            }
          },
        );
      });
    };

    return findNextBatch();
  };

  if (isImporting) {
    return (
      <SafeAreaView className={"flex-1 justify-center items-center"}>
        <ActivityIndicator size={50} color={"seagreen"} />
      </SafeAreaView>
    );
  }
  return (
    <SmsContext.Provider value={{ isImporting, getUniqueSenders }}>
      {children}
    </SmsContext.Provider>
  );
}

/**
 * @returns {{
 *   isImporting: boolean,
 *   getUniqueSenders: () => Promise<String[]>
 * }} Hook to check if messages are being imported and get a list of unique inbox addresses
 */
export const useSms = () => {
  const ctx = useContext(SmsContext);

  if (!ctx)
    throw new Error("useSms may only be used within SmsProvider component!");

  return ctx;
};
