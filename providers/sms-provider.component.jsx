import { createContext, useContext, useEffect, useRef, useState } from "react";
import SmsAndroid from "react-native-get-sms-android";
import { useData } from "@/providers/data-provider.component";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
import { client } from "@/lib/client";

const SmsContext = createContext(null);

/**
 * Re-usable component that provides SMS related props
 * @param {ReactNode} children Child components relying on SMS props
 * @returns {React.JSX.Element}
 */
export default function SmsProvider({ children }) {
  const [isImporting, setIsImporting] = useState(false);
  const BATCH = 100;
  const { data } = useData();
  const messages = useRef([]);
  const addresses = JSON.stringify(data.addresses);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const importSms = async () => {
      // Skip double/empty imports
      if (isImporting || !addresses) return;
      setIsImporting(true);

      // Temporary array to hold new messages
      let smsMessages = [];

      // Iterate through each address being tracked
      for (const address of JSON.parse(addresses)) {
        // Position to start fetching from
        let index = 0;
        console.log(`Importing messages from ${address.name}`);
        let hasMore = true; // Condition to break loop
        const addressMessages = [];

        // Fetch until last message
        while (hasMore) {
          const batch = await new Promise((resolve, reject) => {
            const filters = {
              box: "inbox",
              indexFrom: index,
              maxCount: BATCH,
              address: address.name,
              //minData: address.last_fetch TODO: Implement timestamp to avoid fetching the entire database
            };

            SmsAndroid.list(
              JSON.stringify(filters),
              (fail) => reject(fail),
              (_count, smsList) => resolve(JSON.parse(smsList)),
            );
          });

          // Add new batch to temporary array
          batch.forEach((msg) => {
            addressMessages.push(msg.body);
          });

          // Continue until the batches are less than maximum batch
          if (batch.length === BATCH) {
            index += BATCH;
          } else {
            // Stop on last message
            hasMore = false;
          }
        }
        console.log(`Total -> ${addressMessages.length}`);
        smsMessages = smsMessages.concat(addressMessages);
      }
      console.log(`Total messages -> ${smsMessages.length}`);
      messages.current = smsMessages;

      setIsImporting(false);
    };

    importSms();
  }, [addresses]);

  useEffect(() => {
    const uploadData = async () => {
      // Wait until importation/uploading stops
      // Exit if no new message exists
      if (isImporting || isUploading || messages.current.length === 0) return;
      setIsUploading(true);
      try {
        await client.post("/messages", { messages: messages.current });
      } catch (e) {
        console.error("An error has occurred while adding new messages: ", e);
      } finally {
        setIsUploading(false);
      }
    };
    uploadData();
  }, [isImporting]);

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
    <SmsContext.Provider value={{ isImporting, getUniqueSenders, isUploading }}>
      {children}
    </SmsContext.Provider>
  );
}

/**
 * @returns {{
 *   isImporting: boolean,
 *   isUploading: boolean,
 *   getUniqueSenders: () => Promise<String[]>
 * }} Hook to check if messages are being imported/uploaded and get a list of unique inbox addresses
 */
export const useSms = () => {
  const ctx = useContext(SmsContext);

  if (!ctx)
    throw new Error("useSms may only be used within SmsProvider component!");

  return ctx;
};
