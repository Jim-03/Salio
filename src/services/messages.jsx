import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import SmsAndroid from "react-native-get-sms-android";
import Classifier from "../utils/classifier";

const MessageContext = createContext();

/**
 * Provider for message context
 * @param children Components depending on the message context
 * @returns {React.JSX.Element} A component that provides message context to child elements
 */
const MessageProvider = ({ children }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [messagesList, setMessagesList] = useState([""]);
  const [featureList, setFeatureList] = useState([]);
  const classifier = useRef(new Classifier());

  /**
   * Imports all messages sent by mpesa to store it locally
   * TODO: Fetch from last imported sms and store in database
   */
  const importSms = useCallback(() => {
    setIsImporting(true);
    const filters = {
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
      (_count, smsList) => {
        const parsedList = JSON.parse(smsList);
        const messages = [];
        const features = [];

        parsedList.forEach((m) => {
          const messageString = m.body;
          messages.push(messageString);
          features.push({
            ...classifier.current.extractFeatures(messageString),
            category: classifier.current.predict(messageString),
          });
        });

        setMessagesList(messages);
        setFeatureList(features);
        setIsImporting(false);
      },
    );
  }, []);

  /**
   * Retrieves the user's MPESA balance
   * @type {number} The user's MPESA balance
   */
  const balance = useMemo(() => {
    let balance = 0;
    console.log("New messages:", featureList.length);

    for (let i = 0; i < messagesList.length; i++) {
      const balanceMatch = messagesList[i].match(
        /.*balance is Ksh([\d,]+\.\d{1,2})/,
      );
      if (balanceMatch) {
        balance = balanceMatch[1].replace(/,/g, "");
        break;
      }
    }

    return Number(balance);
  }, [messagesList]);

  return (
    <MessageContext.Provider value={{ importSms, balance, isImporting }}>
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
