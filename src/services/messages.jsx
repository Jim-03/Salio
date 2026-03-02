import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SmsAndroid from "react-native-get-sms-android";
import {
  getLastBalance,
  getLastTransactionDate,
  storeNewMessages,
} from "../utils/database";
import { useDB } from "./database";

const MessageContext = createContext();

/**
 * Provider for message context
 * @param children Components depending on the message context
 * @param classifier Classifier instance
 * @returns {React.JSX.Element} A component that provides message context to child elements
 */
const MessageProvider = ({ children, classifier }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [messagesList, setMessagesList] = useState([""]);
  const db = useDB();
  const [lastTransactionDate, setLastTransactionDate] = useState(null);

  /**
   * Hook to fetch the date of the last transaction stored in the database
   */
  useEffect(() => {
    const loadData = async () => {
      setLastTransactionDate(await getLastTransactionDate(db));
    };
    loadData();
  }, [db]);

  /**
   * Imports all messages sent by mpesa to store it locally
   * TODO: Fetch from last imported sms
   */
  const importSms = useCallback(() => {
    setIsImporting(true);
    const filters = lastTransactionDate
      ? {
          address: "MPESA",
          box: "inbox",
          minDate: lastTransactionDate.getTime(),
        }
      : {
          address: "MPESA",
          box: "inbox",
        };

    SmsAndroid.list(
      JSON.stringify(filters),
      (fail) => {
        setIsImporting(false);
        console.error(
          "An error has occurred while fetching the messages: ",
          fail,
        );
      },
      async (count, smsList) => {
        const parsedList = JSON.parse(smsList);
        const messages = [];
        const features = [];

        for (let i = 0; i < count; i++) {
          const messageString = parsedList[i].body;
          const transactionFeatures = {
            ...classifier.extractFeatures(messageString),
            category: classifier.predict(messageString),
            message: messageString,
          };
          if (
            transactionFeatures.merchant &&
            transactionFeatures.amount &&
            transactionFeatures.date
          ) {
            messages.push(messageString);
            features.push(transactionFeatures);
          }
        }

        setMessagesList(messages);
        console.log("Adding new transactions to the database");

        if (lastTransactionDate) {
          features.pop();
        }

        await storeNewMessages(db, features.reverse());
        setIsImporting(false);
      },
    );
  }, [lastTransactionDate]);

  return (
    <MessageContext.Provider value={{ importSms, isImporting }}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageProvider;

/**
 * Creates the context variables
 * @returns {unknown} an object containing the context variables
 */
export const useSms = () => {
  const sms = useContext(MessageContext);
  if (!sms) {
    throw Error("useSms can only be used in MessageProvider!");
  }
  return sms;
};
