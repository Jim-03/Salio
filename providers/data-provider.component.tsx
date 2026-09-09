import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { SystemData } from "@/lib/dto";

type SystemDataContextProps = {
  data: SystemData;
  setData: Dispatch<SetStateAction<SystemData>>;
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

  return (
    <SystemDataContext.Provider value={{ data, setData }}>
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
