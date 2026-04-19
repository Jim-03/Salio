import { SplashScreen } from "expo-router";
import * as SQLite from "expo-sqlite";
import React, {
  JSX,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

SplashScreen.preventAutoHideAsync(); // Prevent splash screen from closing until database connection is completed

const DatabaseContext = createContext<SQLite.SQLiteDatabase | null>(null);

/**
 * Provider component that initializes and manages the SQLite database connection.
 * It also handles the splash screen visibility, keeping it visible until the database is ready.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the provider.
 * @returns {JSX.Element} The provider component.
 */
export default function DatabaseProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  useEffect(() => {
    const createDb = async () => {
      try {
        const connection = await SQLite.openDatabaseAsync("salio");
        setDb(connection);
        console.log("Connecting to database");

        await connection.execAsync(`
            PRAGMA journal_mode = WAL;
            PRAGMA busy_timeout = 5000; 
        `);

        await connection.execAsync(`
            CREATE TABLE IF NOT EXISTS transactions
            (
                id                    INTEGER PRIMARY KEY AUTOINCREMENT,
                reference_number      TEXT NOT NULL UNIQUE,
                merchant              TEXT NOT NULL,
                transaction_timestamp TEXT NOT NULL,
                amount                REAL NOT NULL,
                balance               REAL NOT NULL,
                transaction_cost      REAL,
                direction             TEXT,
                is_paybill            REAL NOT NULL,
                is_send_money         REAL NOT NULL,
                is_buy_goods          REAL NOT NULL,
                is_reversal           REAL NOT NULL,
                category              TEXT NOT NULL 
            );
        `);
        console.log("Database connection successful");
      } catch (e) {
        throw e;
      } finally {
        await SplashScreen.hideAsync(); // Close the splash screen after connecting
      }
    };
    createDb();
  }, []);

  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
}

/**
 * Hook to access the SQLite database connection instance.
 *
 * @returns {SQLite.SQLiteDatabase} The active SQLite database connection.
 * @throws {Error} If used outside of a DatabaseProvider or if the database is not yet initialized.
 */
export const useDB = (): SQLite.SQLiteDatabase => {
  const db = useContext(DatabaseContext);

  if (!db) {
    throw new Error("useDB can only be used in DatabaseProvider");
  }

  return db;
};
