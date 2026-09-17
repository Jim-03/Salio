import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SystemData } from "@/lib/dto";
import { AppState } from "react-native";

type SystemDataContextProps = {
  data: SystemData;
  setData: Dispatch<SetStateAction<SystemData>>;
  isOnline: boolean;
  isReconnecting: boolean;
} | null;

const SystemDataContext = createContext<SystemDataContextProps>(null);

/**
 * Reusable component containing the entire app's data
 * @param children Child components relying on the system's data
 */
export default function SystemDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [data, setData] = useState<SystemData>({});
  const [isOnline, setIsOnline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(true);

  const websocket = useRef<WebSocket | null>(null);
  const retries = useRef(0);
  const maxRetries = 5;
  const retryRef = useRef<ReturnType<typeof setTimeout>>(0);

  useEffect(() => {
    /**
     * Connect to server for instant messaging
     */
    const connect = () => {
      // Exit if connection is still alive
      if (websocket.current) {
        setIsReconnecting(false);
        setIsOnline(true);
        return;
      }
      const url = process.env.EXPO_PUBLIC_WEBSOCKET_URL!;

      // Connect to server
      websocket.current = new WebSocket(url);

      // Set the app as online
      websocket.current.onopen = () => {
        console.log("Connected to server");
        setIsOnline(true);
        setIsReconnecting(false);
        retries.current = 0;
      };

      // Read incoming messages
      websocket.current.onmessage = (msg) => {
        try {
          JSON.parse(msg.data);

          // TODO: Store message
        } catch (e) {
          console.error("Failed to parse incoming message: ", e);
        }
      };

      // Retry connecting in case of network drop/disconnection
      websocket.current.onclose = () => {
        websocket.current = null;
        setIsOnline(false);
        if (retries.current === maxRetries) {
          setIsReconnecting(false);
        } else {
          setIsReconnecting(true);
          retries.current += 1;
          retryRef.current = setTimeout(connect, 5000);
        }
      };
    };

    // Disconnect if app is in background
    const subscription = AppState.addEventListener("change", (state) => {
      // Kill connection if app isn't active
      if (state !== "active") {
        if (retryRef.current) clearTimeout(retryRef.current);
        if (websocket.current) {
          websocket.current.onclose = null;
          websocket.current.close();

          websocket.current = null;
          setIsOnline(false);
        }
      } else {
        retries.current = 0;
        connect();
      }
    });

    connect();

    return () => {
      subscription.remove();

      if (retryRef.current) clearTimeout(retryRef.current);

      if (websocket.current) {
        websocket.current.onclose = null;
        websocket.current.close();
      }
    };
  }, []);

  return (
    <SystemDataContext.Provider
      value={{ data, setData, isOnline, isReconnecting }}
    >
      {children}
    </SystemDataContext.Provider>
  );
}

/**
 * Hook to obtain and update system data
 */
export const useData = () => {
  const ctx = useContext(SystemDataContext);
  if (!ctx)
    throw Error(
      "useData may only be used within SystemDataProvider component!",
    );

  return ctx;
};
