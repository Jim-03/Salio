import { addToDatabase, getLastTransactionDate } from "@/utils/database";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import SmsAndroid from "react-native-get-sms-android";
import ImportSmsCard from "../components/import-sms-card";
import extractTransactionDetails from "../utils/regex-parser";
import { useDB } from "./database-provider";

const SmsContext = createContext(false);

/**
 * Provider component that reads through the device's SMS messages
 *
 * It then extracts valid M-Pesa transactions and stores in the local database
 * @param children child components depending on the provider
 * @returns {React.JSX.Element} A component that auto imports M-Pesa messages
 */
export default function SmsProvider({ children }) {
  const [isImporting, setIsImporting] = useState(false);
  const [validTransactions, setValidTransactions] = useState(0);
  const [lastTransactionDate, setLastTransactionDate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const db = useDB();
  const SMS_BATCH = 500;

  const isRunningRef = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      if (isImporting) return;
      try {
        const data = await getLastTransactionDate(db);

        if (data) setLastTransactionDate(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [isImporting]);

  useEffect(() => {
    if (isLoading) return;

    if (isRunningRef.current) return;
    isRunningRef.current = true;

    let totalRecords = 0;
    let startingTime = Date.now();

    /**
     * Retrieve all SMS messages from M-Pesa
     * @param {number} startIndex The position to start fetching from
     */
    const importSms = (startIndex) => {
      const filters = {
        box: "inbox",
        address: "MPESA",
        indexFrom: startIndex,
        maxCount: SMS_BATCH,
      };
      // If the last transaction date is provided, fetch from that timestamp
      if (lastTransactionDate) {
        filters.minDate = lastTransactionDate;
      }

      setIsImporting(true);

      SmsAndroid.list(
        JSON.stringify(filters),
        /**
         * Callback function for failed fetch
         * @param fail Error
         */
        (fail) => {
          isRunningRef.current = false;
          console.error(
            "An error has occurred while fetching SMS messages:",
            fail,
          );
        },
        /**
         * Callback function that handles the found SMS messages
         * @param {number} count Total number of messages
         * @param {string} smsList A string of SMS JSON objects
         * @returns {Promise<void>} A promise that resolves when SMS messages are imported
         */
        async (count, smsList) => {
          // Parse the JSON string
          const parsedList = JSON.parse(smsList);
          const transactions = []; // A list of valid transactions
          // Iterate through each JSON object
          parsedList.forEach((pl) => {
            const details = {
              // Extract the features of the message
              ...extractTransactionDetails(pl.body),
              category: "unknown",
              timestamp: pl.date,
              message: pl.body,
            };

            if (
              details.merchant ||
              details.amount ||
              details.date ||
              details.balance
            ) {
              // A valid transaction
              transactions.push(details);
            }
          });
          totalRecords += transactions.length;
          setValidTransactions((prev) => prev + transactions.length);

          // Add to database
          await addToDatabase(db, transactions);
          if (count === SMS_BATCH) {
            importSms(startIndex + SMS_BATCH);
          } else {
            const completionTime = Date.now();
            console.log(`Transaction import completed`);
            console.log(
              `Added ${totalRecords} transactions in ${((completionTime - startingTime) / 1000).toFixed(1)} seconds`,
            );
            setIsImporting(false); // Stop the animation
            isRunningRef.current = false;
          }
        },
      );
    };
    startingTime = Date.now();
    console.log(`Importing transactions`);
    importSms(0);
  }, [db, isLoading, lastTransactionDate]);

  return (
    <SmsContext value={isImporting}>
      {isImporting && (
        <ImportSmsCard
          isLoading={isImporting}
          transactions={validTransactions}
        />
      )}
      {children}
    </SmsContext>
  );
}

/**
 * Hook to check if SMS messages are being imported
 * @returns {boolean} true if SMS messages are still importing, false otherwise
 * @throws {Error} In case the hook is used outside the SmsProvider
 */
export const useSms = () => {
  const isImporting = useContext(SmsContext);

  if (isImporting === null) {
    throw new Error("useSms can only be used in SmsProvider");
  }
  return isImporting;
};
