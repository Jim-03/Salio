import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, View } from "react-native";
import AuthenticationModal from "@/components/authentication-modal";

const AuthenticationContext = createContext<{
  isAuthenticated: boolean;
} | null>(null);

/**
 * Re-usable component that locks the app after 1 minute of inactive state
 * @param children Child components requiring authentication
 */
export default function AuthenticationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const timeout = useRef(0);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        timeout.current = Date.now();
      } else if (state === "active") {
        if (Date.now() - timeout.current > 1000 * 60) {
          setIsAuthenticated(false);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <AuthenticationContext.Provider value={{ isAuthenticated }}>
      <View className={"flex-1"}>
        {!isAuthenticated && (
          <AuthenticationModal close={() => setIsAuthenticated(true)} />
        )}
        {children}
      </View>
    </AuthenticationContext.Provider>
  );
}

/**
 * @returns a state to check if the session is authenticated
 */
export const useAuthentication = () => {
  const ctx = useContext(AuthenticationContext);

  if (!ctx)
    throw new Error(
      "useAuthentication may only be used within AuthenticationProvider component!",
    );
  return ctx;
};
